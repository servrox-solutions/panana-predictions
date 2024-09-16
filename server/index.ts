import { Aptos, AptosConfig, Network, type ClientRequest, type ClientResponse } from "@aptos-labs/ts-sdk";
import axios, { type AxiosResponse } from "axios";
import {ABI} from "../lib/abi.ts";
import {createEntryPayload, createSurfClient} from "@thalalabs/surf";
import type {CreateMarketEvent, Data} from "./create-market.type.ts";
import * as schedule from 'node-schedule';

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
      data: requestOptions.body,  // Use `body` for the request payload
    });

    // Map the Axios response to the ClientResponse format
    const clientResponse: ClientResponse<Res> = {
        status: axiosResponse.status,
        headers: axiosResponse.headers,
        data: axiosResponse.data,
        statusText: axiosResponse.statusText,
    };

    return clientResponse;
  } catch (error: any) {
    // Handle error (you may want to throw an error or return a failure response)
    throw new Error(`Request failed: ${error.message}`);
  }
}

const config = new AptosConfig({
    network: Network.TESTNET,
    // fullnode: 'https://aptos-testnet.nodit.io/GvkONibN8vC47~_1G9qGWZKWsY-_Ftjg/v1',
    // indexer: 'https://aptos-testnet.nodit.io/GvkONibN8vC47~_1G9qGWZKWsY-_Ftjg/v1/graphql',
    client: {provider},  // Pass the custom Axios instance here
});
const aptosClient = new Aptos(config);
const aptosSurfClient = createSurfClient(aptosClient);

const MODULE_ID ='0x51a9217bbc1845b450ebad40bde0d93735db32a36c55080a80f74df2977fbc82';
// const payload = aptosClient.useABI(ABI).resource.Market({
//     typeArguments: [],
//     account: '0x51a9217bbc1845b450ebad40bde0d93735db32a36c55080a80f74df2977fbc82'
// }).

// console.log(getAptosClient())
let pageIdx = 0;
const limit = 2;
while(true) {
    const events = await aptosClient.getModuleEventsByEventType({
        eventType: `${MODULE_ID}::market::CreateMarket<${MODULE_ID}::switchboard_asset::APT>`,
        options: {
            offset: pageIdx * limit,
            limit,
        }
    });
    const createMarketEvents = events.map(event => event.data as Data);
    if (createMarketEvents.length == 0) {
        break;
    }
    for(const createMarketEvent of createMarketEvents) {
        const now = Math.floor(Date.now() / 1000);
        // console.log(createMarketEvent);
        const start_time_timestamp_ms = +createMarketEvent.start_time_timestamp * 1000;
        const end_time_timestamp_ms = +createMarketEvent.end_time_timestamp * 1000;
        if (start_time_timestamp_ms > now) {

            const date = new Date(start_time_timestamp_ms);

            const job = schedule.scheduleJob(date, function(){
                // aptosSurfClient.useABI(ABI).entry.
                // TODO: set start price
            });
            console.log(`scheduled job to start market ${createMarketEvent.market.inner} at ${date.toString()}`);
        }
        if (end_time_timestamp_ms > now) {
            const date = new Date(end_time_timestamp_ms);

            const job = schedule.scheduleJob(date, function(){
                const payload = createEntryPayload(ABI, {
                    function: "place_bet",
                    typeArguments: [`${moduleAddress}::price_oracle::BTC`],
                    functionArguments: [
                        `0x4e19e11ee04ac5f16169720de8e2a004602207b32847bd4b31af1337f017e342`,
                        data.betDirection === "up",
                        data.betAmount.toString(),
                    ],
                });
            });
            console.log(`scheduled job to resolve market ${createMarketEvent.market.inner} at ${date.toString()}`);
        }
    }
    pageIdx++;
}
// console.log();