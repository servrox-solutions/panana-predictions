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
import { ABI as MARKET_ABI } from "../lib/market-abi";
import { ABI as MARKETPLACE_ABI } from "../lib/marketplace-abi";
import { createSurfClient } from "@thalalabs/surf";
import { RecurrenceRule, scheduleJob } from "node-schedule";
import * as yaml from "js-yaml";
import { readFileSync } from "fs";
import { DateTime } from "luxon";

const yamlConfig = yaml.load(
  readFileSync("../.aptos/config.yaml", "utf8")
) as any;
const profile = `${process.env.PROJECT_NAME}-${process.env.NEXT_PUBLIC_APP_NETWORK}`;
const privateKey = yamlConfig["profiles"][profile]["private_key"];

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
      console.error("request error", axiosResponse.status);
      // Map the Axios response to the ClientResponse format
      const clientResponse: ClientResponse<Res> = {
        status: axiosResponse.status,
        headers: axiosResponse.headers,
        data: axiosResponse.data,
        statusText: axiosResponse.statusText,
      };
      return clientResponse;
    }
    console.error("request error", error);
    throw error;

    // Handle error (you may want to throw an error or return a failure response)
    // throw new Error(`Request failed: ${error.message}`);
  }
}

const MODULE_ID =
  "0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac";
// const ASSETS = ["APT", "BTC", "SOL", "USDC", "ETH"];

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

// const payload = aptosClient.useABI(ABI).resource.Market({
//     typeArguments: [],
//     account: '0x51a9217bbc1845b450ebad40bde0d93735db32a36c55080a80f74df2977fbc82'
// }).

// console.log(getAptosClient())

// aptosSurfClient.useABI(ABI).view.{
//     typeArguments: [`${MODULE_ID}::switchboard_asset::APT`],
//     functionArguments: [
//         MODULE_ID,
//         DateTime.fromJSDate(firstDate).plus({minute: 20}).toSeconds(),
//         DateTime.fromJSDate(firstDate).plus({minute: 39}).toSeconds(),
//         100,
//         false,
//         2,
//         10,
//         2,
//         10,
//     ],
//     account: Account.fromPrivateKey(privateKey)
// }).

const rule = new RecurrenceRule();
rule.minute = [0, 20, 40];
// await aptosSurfClient.useABI(ABI).entry.create_market({
//     typeArguments: [`${MODULE_ID}::switchboard_asset::APT`],
//     functionArguments: [
//         '0x499d00d650051553714c63024c12ad0a821137cd6d240ddd63a276a9a36d0328',
//         Math.ceil(DateTime.fromJSDate(new Date()).plus({minute: 20}).toSeconds()),
//         Math.ceil(DateTime.fromJSDate(new Date()).plus({minute: 39}).toSeconds()),
//         100,
//         false,
//         2,
//         10,
//         2,
//         10,
//     ],
//     account: Account.fromPrivateKey({privateKey: ed25519Key})
// // });
// scheduleJob(rule, async ( )=> {
//     try {
//         await aptosSurfClient.useABI(ABI).entry.create_market({
//             typeArguments: [`${MODULE_ID}::switchboard_asset::APT`],
//             functionArguments: [
//                 '0x499d00d650051553714c63024c12ad0a821137cd6d240ddd63a276a9a36d0328',
//                 Math.ceil(DateTime.fromJSDate(new Date()).plus({minute: 20}).toSeconds()),
//                 Math.ceil(DateTime.fromJSDate(new Date()).plus({minute: 39}).toSeconds()),
//                 100,
//                 false,
//                 2,
//                 10,
//                 2,
//                 10,
//             ],
//             account: Account.fromPrivateKey({privateKey: ed25519Key})
//         });
//         // console.log(`Created market. Tx: ${res.hash}`);
//     } catch(err) {
//         console.error('error creating market: ', err);
//     }
// });

marketplaceSurfClient.view
  .available_marketplaces({
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

    availableMarketplaces.forEach(async (marketplace) =>
      handleMarketUpdates(marketplace)
    );
  });

async function handleMarketUpdates(marketplace: AvailableMarketplace) {
  const availableMarkets = await marketplaceSurfClient.view.available_markets({
    functionArguments: [marketplace.key],
    typeArguments: [marketplace.value],
  });

  availableMarkets
    .flat()
    .forEach(async (marketAddress) =>
      handleMarketResolution(marketAddress, marketplace.value)
    );
}

async function handleMarketResolution(
  marketAddress: `0x${string}`,
  type: string
) {
  const market = await marketSurfClient.resource.Market({
    account: marketAddress,
    typeArguments: [type],
  });
  await resolveMarket(
    type,
    marketAddress,
    +market.start_time,
    +market.end_time
  );
}

async function resolveMarket(
  type: string,
  marketAddress: `0x${string}`,
  start_time_timestamp_sec: number,
  end_time_timestamp_sec: number
) {
  const now = Date.now();
  const start_time_timestamp_ms = start_time_timestamp_sec * 1000;
  const end_time_timestamp_ms = end_time_timestamp_sec * 1000;

  const isStartInFuture = start_time_timestamp_ms > now;
  if (isStartInFuture) {
    const date = new Date(start_time_timestamp_ms);

    const job = scheduleJob(date, function () {
      console.log(
        `run job to set market price for amrket ${marketAddress} on ${type}`
      );
      // TODO: set start price
    });
    console.log(
      `scheduled job to start market ${marketAddress} at ${date.toString()} on ${type}`
    );
  }

  const isEndInFuture = end_time_timestamp_ms > now;
  if (isEndInFuture) {
    // current date is after market was started but before market was resolved
    const date = new Date(end_time_timestamp_ms);
    let numberRetries = 0;

    const job = scheduleJob(date, () => {
      marketSurfClient.entry
        .resolve_market({
          typeArguments: [type],
          functionArguments: [marketAddress],
          account,
        })
        .then((res) => {
          if (!res.success) {
            if (numberRetries == 10) {
              throw new Error("Maximum retries reached");
            }
            console.error(
              `Failure resolving market ${marketAddress} on ${type}. Retrying in ${
                numberRetries * 2
              } Minute(s).`
            );
            job.runOnDate(
              DateTime.fromJSDate(date)
                .plus({ minute: numberRetries * 2 })
                .toJSDate()
            );
            numberRetries++;
          } else {
            console.log(
              `Successfull resolved market ${marketAddress} on ${type}`
            );
          }
        })
        .catch((err) => {
          if (numberRetries == 10) {
            return;
          }
          console.error(
            `Failure resolving market ${marketAddress} on ${type}. Retrying in ${
              numberRetries * 2
            } Minute(s).`,
            err
          );
          job.runOnDate(
            DateTime.fromJSDate(date)
              .plus({ minute: numberRetries * 2 })
              .toJSDate()
          );
          numberRetries++;
        });
    });
    console.log(
      `scheduled job to resolve market ${marketAddress} at ${date.toString()} on ${type}`
    );
  }

  const shouldAlreadyBeClosed = !isStartInFuture && !isEndInFuture;
  if (shouldAlreadyBeClosed) {
    marketSurfClient.entry
      .resolve_market({
        typeArguments: [type],
        functionArguments: [marketAddress],
        account,
      })
      .then((res) => {
        if (!res.success) {
          console.error(
            `Failure resolving market ${marketAddress} on ${type}. Retrying in 1 Minute.`
          );
          // TODO: implement retry
        } else {
          console.log(
            `Successfull resolved market ${marketAddress} on ${type}`
          );
        }
      })
      .catch((err) => {
        // TODO: implement retry
        console.error(err);
      });
  }
}
