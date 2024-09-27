import { Address } from '../types/market';
import { NoditOperationDocs } from './operation-docs';
import { CountResponse } from './response';

export class NoditClient {

    constructor(
        private _moduleId: Address,
        private _apiKey: Address,
    ) {}

    
    public async fetchCreatedMarketCount(sender: Address): Promise<number> {
        const result = await this.fetchGraphQL(
            NoditOperationDocs['create-market-count'](sender, this._moduleId),
            "CreatedMarketCount",
            {}
        ) as CountResponse;
        return result?.data?.account_transactions_aggregate?.aggregate?.count ?? 0;
    }

    public async fetchPlacedBetCount(sender: Address) {
        const result = await this.fetchGraphQL(
            NoditOperationDocs['place-bet-count'](sender, this._moduleId),
            "PlacedBetCount",
            {}
        ) as CountResponse;
        return result?.data?.account_transactions_aggregate?.aggregate?.count ?? 0;
    }

    private async fetchGraphQL(query: string, operationName: string, variables: {[key: string]: any }) {
        const result = await fetch(
            `https://aptos-testnet.nodit.io/${this._apiKey}/v1/graphql`,
            {
            headers: {
                'content-type': 'application/json',
            },
            method: "POST",
                body: JSON.stringify({ query })
            }
        );
        return result.json();
    }
}