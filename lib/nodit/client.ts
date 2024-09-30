import { Address } from '../types/market';
import { ProfilePageStatsQuery } from './operation-docs';
import { StatisticsPageResponse } from './response';

export class NoditClient {

    constructor(
        private _moduleId: Address,
        private _apiKey: Address,
    ) {}

    
    public async fetchProfileStatisticsData(sender: Address): Promise<StatisticsPageResponse> {
        return this.fetchGraphQL<StatisticsPageResponse>(
            ProfilePageStatsQuery(sender, this._moduleId),
            "StatisticsPage",
            {}
        );
    }   

    private async fetchGraphQL<T>(query: string, operationName: string, variables: {[key: string]: any }) {
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
        return result.json() as T;
    }
}