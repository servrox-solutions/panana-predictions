import { Address } from '../types/market';

export const NoditOperationDocs = {
    'create-market-count': (sender: Address, moduleAddress: Address) => `query CreateMarketCount {
            account_transactions_aggregate(
                where: {user_transaction: {sender: {_eq: "${sender}"}, entry_function_id_str: {_eq: "${moduleAddress}::market::create_market"}}}
            ) {
                aggregate {
                    count
                }
            }
        }`,
    'place-bet-count': (sender: Address, moduleAddress: Address) => `query PlaceBetCount {
            account_transactions_aggregate(
                where: {user_transaction: {sender: {_eq: "${sender}"}, entry_function_id_str: {_eq: "${moduleAddress}::market::place_bet"}}}
            ) {
                aggregate {
                    count
                }
            }
        }`
 } as const;