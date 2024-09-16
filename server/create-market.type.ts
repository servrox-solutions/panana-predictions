export interface CreateMarketEvent {
    account_address: string
    creation_number: number
    data: Data
    event_index: number
    sequence_number: number
    transaction_block_height: number
    transaction_version: number
    type: string
    indexed_type: string
}

export interface Data {
    market: Market
    marketplace: Marketplace
    end_time_timestamp: string
    start_time_timestamp: string
}

export interface Market {
    inner: string
}

export interface Marketplace {
    inner: string
}
