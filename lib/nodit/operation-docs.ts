import { Address } from '../types/market';

export const ProfilePageStatsQuery = (sender: Address, moduleAddress: Address) => `
query StatisticsPageQuery {
        created_markets: account_transactions_aggregate(
            where: {account_address: {_eq: "${sender}"}, user_transaction: {entry_function_id_str: {_in: ["${moduleAddress}::market::create_market", "${moduleAddress}::event_market::create_market"]}}}
        ) {
            aggregate {
            count
            }
        }
        market_interactions: account_transactions_aggregate(
            where: {account_address: {_eq: "${sender}"}, user_transaction: {entry_function_id_str: {_like: "${moduleAddress}::market%"}}}
        ) {
            aggregate {
            count
            }
        }
		event_market_interactions: account_transactions_aggregate(
            where: {account_address: {_eq: "${sender}"}, user_transaction: {entry_function_id_str: {_like: "${moduleAddress}::event_market%"}}}
        ) {
            aggregate {
            count
            }
        }
        total_votes: account_transactions_aggregate(
            where: {account_address: {_eq: "${sender}"}, user_transaction: {entry_function_id_str: {_in: ["${moduleAddress}::market::vote", "${moduleAddress}::event_market::vote"]}}}
        ) {
            aggregate {
            count
            }
        }
        placed_bets: coin_activities_aggregate(
            where: {owner_address: {_eq: "${sender}"}, entry_function_id_str: {_in: ["${moduleAddress}::market::place_bet", "${moduleAddress}::event_market::place_bet"]}, activity_type: {_eq: "0x1::coin::WithdrawEvent"}}
        ) {
            aggregate {
                count
            }
        }
        placed_bets: coin_activities_aggregate(
            where: {owner_address: {_eq: "${sender}"}, entry_function_id_str: {_in: ["${moduleAddress}::market::place_bet", "${moduleAddress}::event_market::place_bet"]}, activity_type: {_eq: "0x1::coin::WithdrawEvent"}}
        ) {
            aggregate {
                sum {
                    amount
                }
            }
        }
        apt_placed:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::PlaceBet<${moduleAddress}::switchboard_asset::APT>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        btc_placed:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::PlaceBet<${moduleAddress}::switchboard_asset::BTC>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        eth_placed:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::PlaceBet<${moduleAddress}::switchboard_asset::ETH>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        sol_placed:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::PlaceBet<${moduleAddress}::switchboard_asset::SOL>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        usdc_placed:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::PlaceBet<${moduleAddress}::switchboard_asset::USDC>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        apt:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::CreateMarket<${moduleAddress}::switchboard_asset::APT>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
        btc:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::CreateMarket<${moduleAddress}::switchboard_asset::BTC>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
        eth:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::CreateMarket<${moduleAddress}::switchboard_asset::ETH>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
        sol:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::CreateMarket<${moduleAddress}::switchboard_asset::SOL>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
        usdc:events(
            where: {indexed_type: {_eq: "${moduleAddress}::market::CreateMarket<${moduleAddress}::switchboard_asset::USDC>"}, data: {_cast: {String: {_like: "%${sender}%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
    }`;