module switchboard::aggregator_open_round_action {
    use std::vector;
    use std::option::{Self, Option};


    struct AggregatorOpenRoundParams has copy, drop {
        aggregator_addr: address,
        jitter: u64,
    }

    struct AggregatorOpenRoundActuateParams has copy, drop {
        open_round_params: AggregatorOpenRoundParams,
        queue_addr: address,
        batch_size: u64,
        job_keys: vector<address>,
        reward: u64,
        open_round_reward: u64,
    }

    public(friend) fun params(aggregator_addr: address, jitter: u64): AggregatorOpenRoundParams {
        AggregatorOpenRoundParams { aggregator_addr, jitter }
    }

    public fun simulate<CoinType>(params: AggregatorOpenRoundParams): (u64, Option<AggregatorOpenRoundActuateParams>) {
        (
            0, 
            option::some<AggregatorOpenRoundActuateParams>(AggregatorOpenRoundActuateParams {
                open_round_params: params,
                queue_addr: @0x0,
                batch_size: 0,
                job_keys: vector::empty(),
                reward: 0,
                open_round_reward: 0,
            }),
        )
    }

    public fun validate<CoinType>(_account: &signer, params: AggregatorOpenRoundParams): AggregatorOpenRoundActuateParams {
        AggregatorOpenRoundActuateParams {
          open_round_params: params,
          queue_addr: @0x0,
          batch_size: 0,
          job_keys: vector::empty(),
          reward: 0,
          open_round_reward: 0,
        }
    }

    public(friend) fun actuate<CoinType>(_account: &signer, _params: AggregatorOpenRoundActuateParams): u64 {
      0
    }

    public entry fun run<CoinType>(
        account: signer,
        aggregator_addr: address,
        jitter: u64
    ) {
        let params = AggregatorOpenRoundParams { aggregator_addr, jitter };
        let actuate_params = validate<CoinType>(&account, params);
        actuate<CoinType>(&account, actuate_params);
    }    

    public entry fun run_many<CoinType>(
        _account: &signer,
        _aggregator_addrs: vector<address>,
        _jitter: u64
    ) {}

    public entry fun run_n<CoinType>(
        _account: signer,
        _aggregator_addrs: vector<address>,
        _jitter: u64
    ) {}
}
