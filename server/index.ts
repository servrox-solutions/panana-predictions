import {
  Aptos,
  AptosConfig,
  Network,
  type ClientRequest,
  type ClientResponse,
  Account,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import axios, { type AxiosResponse } from "axios";
import { ABI as MARKET_ABI } from "../lib/market-abi.ts";
import { ABI as MARKETPLACE_ABI } from "../lib/marketplace-abi.ts";
import { createSurfClient } from "@thalalabs/surf";
import { RecurrenceRule, scheduledJobs, scheduleJob } from "node-schedule";
import * as yaml from "js-yaml";
import { readFileSync } from "fs";
import { DateTime } from "luxon";
import { MODULE_ADDRESS_FROM_ABI } from "../lib/aptos.ts";
import { telegramNotifier } from "./telegram-notifier/index.ts";

// Configuration Loader
function loadConfig() {
  const yamlConfig = yaml.load(
    readFileSync("./.aptos/config.yaml", "utf8")
  ) as any;
  const profile = `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`;
  const privateKey =
    process.env.PRIVATE_KEY ?? yamlConfig["profiles"][profile]["private_key"];
  return { privateKey };
}

const { privateKey } = loadConfig();
const account = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(privateKey),
});

const MODULE_ID = MODULE_ADDRESS_FROM_ABI;

// Axios-based provider function
async function provider<Req, Res>(
  requestOptions: ClientRequest<Req>
): Promise<ClientResponse<Res>> {
  try {
    const axiosResponse: AxiosResponse<Res> = await axios({
      method: requestOptions.method,
      url: requestOptions.url,
      headers: requestOptions.headers,
      data: requestOptions.body,
    });

    return mapAxiosToClientResponse(axiosResponse);
  } catch (error) {
    return handleError<Res>(error);
  }
}

// Map Axios response to ClientResponse
function mapAxiosToClientResponse<Res>(
  axiosResponse: AxiosResponse<Res>
): ClientResponse<Res> {
  return {
    status: axiosResponse.status,
    headers: axiosResponse.headers,
    data: axiosResponse.data,
    statusText: axiosResponse.statusText,
  };
}

// Handle errors centrally
function handleError<Res>(error: any): ClientResponse<Res> {
  const axiosResponse = error.response as AxiosResponse;
  if (axiosResponse) {
    return mapAxiosToClientResponse<Res>(axiosResponse);
  }
  console.error("Request error", error);
  throw error;
}

// Aptos client configuration
const config = new AptosConfig({
  network: Network.TESTNET,
  client: { provider },
});
const aptosClient = new Aptos(config);
const marketSurfClient = createSurfClient(aptosClient).useABI(MARKET_ABI);
const marketplaceSurfClient =
  createSurfClient(aptosClient).useABI(MARKETPLACE_ABI);

// Interface Definitions
interface AvailableMarketplacesResponse {
  data: AvailableMarketplace[];
}

interface AvailableMarketplace {
  key: `0x${string}`;
  value: string;
}

// Schedule market creation
function scheduleCreateMarket(marketplace: AvailableMarketplace, min: number) {
  const rule = new RecurrenceRule();
  rule.minute = [min];
  scheduleExecutionWithRetry(
    "Create Market",
    async () => createMarket(marketplace),
    rule
  );
  console.log(
    `create market scheduler scheduled for ${marketplace.key} (${marketplace.value})`
  );
}

// Create market function
async function createMarket(
  marketplace: AvailableMarketplace
): Promise<{ success: boolean }> {
  const startTime = DateTime.now()
    .plus({ minute: 30 })
    .set({ second: 0, millisecond: 0 })
    .toSeconds();
  const endTime = DateTime.fromSeconds(startTime)
    .plus({ minute: 30 })
    .toSeconds();
  console.log(
    `Scheduled create market: ${marketplace.key}:${marketplace.value}`
  );
  return marketSurfClient.entry.create_market({
    typeArguments: [marketplace.value],
    functionArguments: [marketplace.key, startTime, endTime, 1000000, 2, 100],
    account,
  });
}

// Fetch and schedule available marketplaces
async function fetchAndScheduleMarketplaces() {
  try {
    const marketplaces =
      await marketplaceSurfClient.view.available_marketplaces({
        typeArguments: [],
        functionArguments: [MODULE_ID],
      });
    processMarketplaces(marketplaces as AvailableMarketplacesResponse[]);
  } catch (err) {
    console.error("Error fetching marketplaces: ", err);
  }
}

// Process available marketplaces
function processMarketplaces(
  availableMarketplacesResponse: AvailableMarketplacesResponse[]
) {
  const availableMarketplaces = availableMarketplacesResponse[0].data;
  if (!availableMarketplaces || availableMarketplaces.length === 0) {
    throw new Error("No marketplaces available");
  }
  availableMarketplaces.forEach((marketplace, idx) => {
    const scheduleMinute = Math.floor(
      (60 / availableMarketplaces.length) * idx
    );
    scheduleCreateMarket(marketplace, scheduleMinute);
    handleMarketUpdates(marketplace);
  });
}

// Handle market updates and set up listeners
async function handleMarketUpdates(marketplace: AvailableMarketplace) {
  await setupMarketsListeners(marketplace);
  scheduleJob("*/1 * * * *", async () => {
    await setupMarketsListeners(marketplace);
  });
}

// Set up market listeners
async function setupMarketsListeners(marketplace: AvailableMarketplace) {
  const availableMarkets = await marketplaceSurfClient.view.available_markets({
    functionArguments: [marketplace.key],
    typeArguments: [marketplace.value],
  });

  availableMarkets.flat().forEach((marketAddress) => {
    handleMarketResolution(marketAddress, marketplace.value);
  });
}

// Handle market resolution
async function handleMarketResolution(
  marketAddress: `0x${string}`,
  type: string
) {
  const market = await marketSurfClient.resource.Market({
    account: marketAddress,
    typeArguments: [type],
  });
  await scheduleMarketTimers(
    type,
    marketAddress,
    market.start_price.vec.length !== 0,
    +market.start_time,
    +market.end_time
  );
}

// Schedule market timers
async function scheduleMarketTimers(
  type: string,
  marketAddress: `0x${string}`,
  hasStartPrice: boolean,
  start_time_timestamp_sec: number,
  end_time_timestamp_sec: number
) {
  if (!hasStartPrice)
    setupStartPriceTimer(start_time_timestamp_sec, marketAddress, type);
  setupResolveMarketTimer(marketAddress, end_time_timestamp_sec, type);
}

// Timer setup for market start price
function setupStartPriceTimer(
  start_time_timestamp_sec: number,
  marketAddress: `0x${string}`,
  type: string
) {
  const jobName = `setPriceTimer::${marketAddress}::${type}`;
  if (scheduledJobs[jobName]) return;

  const date = determineJobExecutionTime(start_time_timestamp_sec);
  scheduleExecutionWithRetry(
    jobName,
    async () => {
      try {
        const res = await marketSurfClient.entry.start_market({
          typeArguments: [type],
          functionArguments: [marketAddress],
          account,
        });
        return res;
      } catch (err: any) {
        if (err?.transaction?.vm_status?.includes("E_MARKET_RUNNING")) {
          return { success: true }; // if the error is market running, the start price is already set
        }
        console.error(`error starting market`, JSON.stringify(err));
        return { success: false };
      }
    },
    date
  );

  console.log(
    `Scheduled job to set price for market ${marketAddress} at ${date.toString()} on ${type}`
  );
}

// Timer setup for market resolution
function setupResolveMarketTimer(
  marketAddress: `0x${string}`,
  end_time_timestamp_sec: number,
  type: string
) {
  const jobName = `resolveTimer::${marketAddress}::${type}`;
  if (scheduledJobs[jobName]) return;

  const date = determineJobExecutionTime(end_time_timestamp_sec);
  scheduleExecutionWithRetry(
    jobName,
    async () => {
      try {
        const res = await marketSurfClient.entry.resolve_market({
          typeArguments: [type],
          functionArguments: [marketAddress],
          account,
        });
        return res;
      } catch (err: any) {
        if (err?.transaction?.vm_status?.includes("E_MARKET_CLOSED")) {
          return { success: true }; // if the error is market closed, the end price is already set
        }
        console.error(`error resolving market`, JSON.stringify(err));
        return { success: false };
      }
    },
    date
  );

  console.log(
    `Scheduled job to resolve market ${marketAddress} at ${date.toString()} on ${type}`
  );
}

// Determine job execution time
function determineJobExecutionTime(timestamp: number): DateTime {
  const now = DateTime.now().toSeconds();
  const isInFuture = timestamp > now;
  return isInFuture
    ? DateTime.fromSeconds(timestamp)
    : DateTime.now().plus({ second: 1 });
}

// Schedule execution with retry logic
function scheduleExecutionWithRetry(
  jobName: string,
  promise: () => Promise<{ success: boolean }>,
  start: DateTime | RecurrenceRule,
  retryCount = 100
) {
  let numberRetries = 0;
  const timeConfig = start instanceof DateTime ? start.toJSDate() : start;
  const job = scheduleJob(jobName, timeConfig, async (fireDate) => {
    try {
      const res = await promise();
      if (!res.success) {
        throw new Error(`request failed: ${JSON.stringify(res)}`);
      } else {
        console.log(`Successfully executed ${jobName}`);
      }
    } catch (err) {
      retryExecution(job, jobName, fireDate, numberRetries++, retryCount, err);
    }
  });
}

// Retry logic for failed execution
function retryExecution(
  job: any,
  jobName: string,
  fireDate: Date,
  numberRetries: number,
  retryCount: number,
  error?: any
) {
  if (numberRetries >= retryCount) {
    console.error(`Max retries reached for ${jobName}`, error);
    return;
  }

  const retryDelay = (numberRetries + 1) ** 2;
  console.error(
    `Failure executing ${jobName}. Retrying in ${retryDelay} seconds.`,
    error
  );
  job.runOnDate(
    DateTime.fromJSDate(fireDate).plus({ seconds: retryDelay }).toJSDate()
  );
}

(async () => {
  try {
    // Run both telegramNotifier and fetchAndScheduleMarketplaces concurrently
    await Promise.all([telegramNotifier(), fetchAndScheduleMarketplaces()]);
    console.log("Initialization complete.");
  } catch (error) {
    console.error("Error during initialization:", error);
  }
})();
