import { Address } from '../types/market';

export const ProfilePageStatsQuery = (sender: Address, moduleAddress: Address) => `
query StatisticsPageQuery {
        created_markets: account_transactions_aggregate(
            where: {account_address: {_eq: "0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314"}, user_transaction: {entry_function_id_str: {_in: ["0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::create_market", "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::event_market::create_market"]}}}
        ) {
            aggregate {
            count
            }
        }
        market_interactions: account_transactions_aggregate(
            where: {account_address: {_eq: "0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314"}, user_transaction: {entry_function_id_str: {_like: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market%"}}}
        ) {
            aggregate {
            count
            }
        }
		event_market_interactions: account_transactions_aggregate(
            where: {account_address: {_eq: "0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314"}, user_transaction: {entry_function_id_str: {_like: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::event_market%"}}}
        ) {
            aggregate {
            count
            }
        }
        total_votes: account_transactions_aggregate(
            where: {account_address: {_eq: "0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314"}, user_transaction: {entry_function_id_str: {_in: ["0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::vote", "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::event_market::vote"]}}}
        ) {
            aggregate {
            count
            }
        }
        placed_bets: coin_activities_aggregate(
            where: {owner_address: {_eq: "0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314"}, entry_function_id_str: {_in: ["0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::place_bet", "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::event_market::place_bet"]}, activity_type: {_eq: "0x1::coin::WithdrawEvent"}}
        ) {
            aggregate {
                count
            }
        }
        placed_bets: coin_activities_aggregate(
            where: {owner_address: {_eq: "0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314"}, entry_function_id_str: {_in: ["0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::place_bet", "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::event_market::place_bet"]}, activity_type: {_eq: "0x1::coin::WithdrawEvent"}}
        ) {
            aggregate {
                sum {
                    amount
                }
            }
        }
        apt_placed:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::PlaceBet<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::APT>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        btc_placed:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::PlaceBet<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::BTC>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        eth_placed:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::PlaceBet<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::ETH>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        sol_placed:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::PlaceBet<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::SOL>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        usdc_placed:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::PlaceBet<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::USDC>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            data
        }
        apt:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::CreateMarket<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::APT>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
        btc:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::CreateMarket<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::BTC>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
        eth:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::CreateMarket<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::ETH>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
        sol:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::CreateMarket<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::SOL>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
        usdc:events(
            where: {indexed_type: {_eq: "0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::market::CreateMarket<0x6e042405369c44a5fec8ddd28bb47442cf0256367b74b9aea64ae0e6ed90b489::switchboard_asset::USDC>"}, data: {_cast: {String: {_like: "%0x59e9982aaa5194058e51c8be75519ec54c518ea3651b3a4a87c39b9bd88ba314%"}}}}
            order_by: {transaction_block_height: desc}
        ) {
            account_address
        }
    }`;