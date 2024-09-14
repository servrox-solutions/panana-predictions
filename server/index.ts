import { Aptos, AptosConfig, Network, type ClientRequest, type ClientResponse } from "@aptos-labs/ts-sdk";
import axios, { type AxiosResponse } from "axios";

import http from "http";
import https from "https";

// Create a custom Axios instance with agents to force HTTP/1.1
const axiosInstance = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),   // HTTP/1.1 agent for HTTP requests
  httpsAgent: new https.Agent({ keepAlive: true }), // HTTPS/1.1 agent for HTTPS requests
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

let aptosClient: Aptos | null = null;

export const getAptosClient = (): Aptos => {
  if (!aptosClient) {
    const config = new AptosConfig({
        network: Network.TESTNET,
        // fullnode: 'https://aptos-testnet.nodit.io/GvkONibN8vC47~_1G9qGWZKWsY-_Ftjg/v1',
        // indexer: 'https://aptos-testnet.nodit.io/GvkONibN8vC47~_1G9qGWZKWsY-_Ftjg/v1/graphql',
        client: {provider},  // Pass the custom Axios instance here
    });
    aptosClient = new Aptos(config);
  }
  return aptosClient;
};

// console.log(getAptosClient())
getAptosClient().event.getEvents().then(console.log).catch(err => console.error('a', err))
// console.log();