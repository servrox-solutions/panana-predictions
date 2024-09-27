export interface CountResponse {
  data: {
    account_transactions_aggregate: AccountTransactionsAggregate
  }
}

export interface AccountTransactionsAggregate {
  aggregate: Aggregate
}

export interface Aggregate {
  count: number
}
