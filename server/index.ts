import {
  Aptos,
  AptosConfig,
  Network,
  type ClientRequest,
  type ClientResponse,
  Account,
  Ed25519PrivateKey,
} from "@aptos-labs/ts-sdk";
import axios, {type AxiosResponse} from "axios";
import {ABI as MARKET_ABI} from "../lib/market-abi.ts";
import {ABI as MARKETPLACE_ABI} from "../lib/marketplace-abi.ts";
import { createSurfClient} from "@thalalabs/surf";
import {RecurrenceRule, scheduledJobs, scheduleJob} from 'node-schedule';
import * as yaml from 'js-yaml';
import { readFileSync } from "fs";
import {DateTime} from "luxon";
import {MODULE_ADDRESS_FROM_ABI} from "../lib/aptos.ts";
const yamlConfig = yaml.load(
  readFileSync("./.aptos/config.yaml", "utf8")
) as any;
const profile = `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`;
const privateKey = process.env.PRIVATE_KEY ?? yamlConfig["profiles"][profile]["private_key"];

const account = Account.fromPrivateKey({
  privateKey: new Ed25519PrivateKey(privateKey),
});

// Define the provider function
async function provider<Req, Res>(
  requestOptions: ClientRequest<Req>
): Promise<ClientResponse<Res>> {
  try {
    // Make the HTTP request using Axios
    const axiosResponse: AxiosResponse<Res> = await axios({
      method: requestOptions.method,
      url: requestOptions.url,
      headers: requestOptions.headers,
      data: requestOptions.body, // Use `body` for the request payload
    });

    // Map the Axios response to the ClientResponse format
    const clientResponse: ClientResponse<Res> = {
      status: axiosResponse.status,
      headers: axiosResponse.headers,
      data: axiosResponse.data,
      statusText: axiosResponse.statusText,
    };

    return clientResponse;
  } catch (error) {


      const axiosResponse = (error as any).response as AxiosResponse;
      if (axiosResponse) {
          // console.error('request error', axiosResponse.status);
          // Map the Axios response to the ClientResponse format
          const clientResponse: ClientResponse<Res> = {
              status: axiosResponse.status,
              headers: axiosResponse.headers,
              data: axiosResponse.data,
              statusText: axiosResponse.statusText,
          };
          return clientResponse;
      }
      console.error('request error', error);
      throw error;
    // Handle error (you may want to throw an error or return a failure response)
    // throw new Error(`Request failed: ${error.message}`);
  }
}

const MODULE_ID = MODULE_ADDRESS_FROM_ABI;

const config = new AptosConfig({
  network: Network.TESTNET,
  // fullnode: 'https://aptos-testnet.nodit.io/GvkONibN8vC47~_1G9qGWZKWsY-_Ftjg/v1',
  // indexer: 'https://aptos-testnet.nodit.io/GvkONibN8vC47~_1G9qGWZKWsY-_Ftjg/v1/graphql',
  client: { provider }, // Pass the custom Axios instance here
});
const aptosClient = new Aptos(config);
const marketSurfClient = createSurfClient(aptosClient).useABI(MARKET_ABI);
const marketplaceSurfClient =
  createSurfClient(aptosClient).useABI(MARKETPLACE_ABI);

interface AvailableMarketplacesResponse {
  data: AvailableMarketplace[];
}

interface AvailableMarketplace {
  key: `0x${string}`;
  value: string;
}

function scheduleCreateMarket(marketplace: AvailableMarketplace, min: number) {
  const rule = new RecurrenceRule();
    rule.minute = [min];
    scheduleJob(rule, async ( )=> {
        try {
            const startTime = Math.floor(DateTime.now().plus({minute: 30}).set({second: 0, millisecond: 0}).toSeconds());
            const endTime = Math.floor(DateTime.fromSeconds(startTime).plus({minute: 30}).toSeconds());
            await marketSurfClient.entry.create_market({
                typeArguments: [marketplace.value],
                functionArguments: [
                    marketplace.key,
                    startTime,
                    endTime,
                    1000000,
                    2,
                    100,
                ],
                account
            });
            // console.log(`Created market. Tx: ${res.hash}`);
        } catch(err) {
            console.error('error creating market: ', err);
        }
    });
    console.log(`create market scheduler scheduled for ${marketplace.key} (${marketplace.value})`);
}

marketplaceSurfClient.view.available_marketplaces({
    typeArguments: [],
    functionArguments: [MODULE_ID],
  })
  .then((marketplaces: unknown[]) => {
    if (marketplaces.length === 0) {
      throw new Error("no marketplaces available");
    }
    const availableMarketplaces = (
      marketplaces as AvailableMarketplacesResponse[]
    )[0].data;
    if (!availableMarketplaces || availableMarketplaces.length === 0) {
      throw new Error("no marketplaces available");
    }
    availableMarketplaces.forEach(async (marketplace, idx) => {
        scheduleCreateMarket(marketplace, Math.floor((60 / availableMarketplaces.length) * idx));
        handleMarketUpdates(marketplace);
    });
});

async function handleMarketUpdates(marketplace: AvailableMarketplace) {
    await setupMarketsListeners(marketplace);
    scheduleJob('*/1 * * * *',async () => {
        await setupMarketsListeners(marketplace);
    });
}


async function setupMarketsListeners(marketplace: AvailableMarketplace) {
    const availableMarkets = await marketplaceSurfClient.view.available_markets({
        functionArguments: [marketplace.key],
        typeArguments: [marketplace.value],
    });

    availableMarkets.flat().forEach(marketAddress => {
        handleMarketResolution(marketAddress, marketplace.value)
    });
}


async function handleMarketResolution(marketAddress: `0x${string}`, type: string) {
        const market = await marketSurfClient.resource.Market({
            account: marketAddress,
            typeArguments: [type]
        });
        await scheduleMarketTimers(type, marketAddress, market.start_price.vec.length !== 0, +market.start_time, +market.end_time);
}

async function scheduleMarketTimers(type: string, marketAddress: `0x${string}`, hasStartPrice: boolean, start_time_timestamp_sec: number, end_time_timestamp_sec: number) {
    if (!hasStartPrice) setupStartPriceTimer(start_time_timestamp_sec, marketAddress, type);
    setupResolveMarketTimer(marketAddress, end_time_timestamp_sec, type);
}

function setupStartPriceTimer(start_time_timestamp_sec: number, marketAddress: `0x${string}`, type: string) {
    const jobName = `setPriceTimer::${marketAddress}::${type}`;
    if (scheduledJobs[jobName]) return; // don't run same scheduler multiple times.

    const now = DateTime.now().toSeconds();
    const isStartInFuture = start_time_timestamp_sec > now;
    // if it should already have been resolved, resolve in 1 sec.
    const date = isStartInFuture ? DateTime.fromSeconds(start_time_timestamp_sec) : DateTime.now().plus({second: 1});

    scheduleExecutionWithRetry(
        jobName,
        () => marketSurfClient.entry.start_market({
            typeArguments: [type],
            functionArguments: [marketAddress],
            account,
        }),
        date
    );

    console.log(`scheduled job to set price for market ${marketAddress} at ${date.toString()} on ${type}`);
}

function setupResolveMarketTimer(marketAddress: `0x${string}`, end_time_timestamp_sec: number, type: string) {
    const jobName = `resolveTimer::${marketAddress}::${type}`;
    if (scheduledJobs[jobName]) return; // don't run same scheduler multiple times

    const now = DateTime.now().toSeconds();
    const isEndInFuture = end_time_timestamp_sec > now;
    // if it should already have been resolved, resolve in 1 sec.
    const date = isEndInFuture ? DateTime.fromSeconds(end_time_timestamp_sec) : DateTime.now().plus({second: 1});


  scheduleExecutionWithRetry(
      jobName,
      () => marketSurfClient.entry.resolve_market({
          typeArguments: [type],
          functionArguments: [marketAddress],
          account,
      }),
      date
  );

    console.log(`scheduled job to resolve market ${marketAddress} at ${date.toString()} on ${type}`);
}

function scheduleExecutionWithRetry(jobName: string, promise: () => Promise<{success: boolean}>, start: DateTime, retryCount = 50) {
    let numberRetries = 0;
    const job = scheduleJob(jobName, start.toJSDate(), async (fireDate) => {
        try {
            const res = await promise();
            if (!res.success) {
                if (numberRetries == retryCount) {
                    throw new Error('Maximum retries reached');
                }

                console.error(`Failure executing ${jobName}. Retrying in ${(numberRetries + 1) * 2} seconds(s).`);
                job.runOnDate(DateTime.fromJSDate(fireDate).plus({seconds: (numberRetries + 1) * 3}).toJSDate());
                numberRetries++;
                return;
            }
            console.error(`Successfully executed ${jobName}`);
        } catch (err) {
            if (numberRetries == retryCount) {
                console.error(`Failure executing ${jobName}. Max retries reached.`, err);
                return;
            }
            console.error(`Failure executing ${jobName}. Retrying in ${(numberRetries + 1) * 2} seconds(s).`, err);
            job.runOnDate(DateTime.fromJSDate(fireDate).plus({seconds: (numberRetries + 1) * 3}).toJSDate());
            numberRetries++;
        }
    });
}