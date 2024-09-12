module panana::price_oracle {
    use std::signer;
    use std::string::String;
    use panana::math128;
    use switchboard::aggregator;
    use switchboard::math;
    use aptos_std::simple_map;
    use panana::utils;

    const E_STORAGE_ALREADY_EXISTS: u64 = 0;        // Error when Storage already exists during initialization
    const E_WRONG_OWNER: u64 = 1;                   // Error when the signer is not the expected owner
    const E_STORAGE_DOES_NOT_EXIST: u64 = 2;        // Error when Storage does not exist
    const E_AGGREGATOR_ALREADY_REGISTERED: u64 = 3; // Error when an aggregator is already registered
    const E_ASSET_NOT_REGISTERED: u64 = 4;          // Error when an asset is not registered


    // https://app.switchboard.xyz/aptos/testnet
    struct APT {}
    struct SOL {}
    struct USDC {}
    struct BTC {}
    struct ETH {}

    struct Result has store, copy, drop {
        value: u128,
        dec: u8
    }

    struct Owner has store, copy, drop, key{
        a: address
    }

    struct Storage has key {
        aggregators: simple_map::SimpleMap<String, address>,
        results: simple_map::SimpleMap<String, Result>
    }

    struct Volume<phantom C> has key, drop {
        input: u128,
        price: Result,
        result: u128
    }

    struct Amount<phantom C> has key, drop {
        input: u128,
        price: Result,
        result: u128
    }

    // TODO: remove this in the final product
    fun init_module(sender: &signer) {
        let aggregators = &mut simple_map::create<String, address>();
        let results = &mut simple_map::create<String, Result>();
        let key = utils::key<APT>();
        simple_map::add(aggregators, key, @switchbaord_feed_apt);
        simple_map::add(results, key, Result { value: 0, dec: 0 });

        move_to(sender, Storage {
            aggregators: *aggregators,
            results: *results
        });
    }

    public entry fun initialize(owner: &signer) {
        assert!(!exists<Storage>(signer::address_of(owner)), E_STORAGE_ALREADY_EXISTS);

        move_to(owner, Storage {
            aggregators: simple_map::create<String, address>(),
            results: simple_map::create<String, Result>()
        });

        // TODO: remove this in the final product
        // add_aggregator<APT>(owner, @switchbaord_feed_apt);
        // add_aggregator<SOL>(owner, @switchbaord_feed_sol);
        // add_aggregator<USDC>(owner, @switchbaord_feed_usdc);
        // add_aggregator<BTC>(owner, @switchbaord_feed_btc);
        // add_aggregator<ETH>(owner, @switchbaord_feed_eth);
    }

    public entry fun add_aggregator<C>(owner: &signer, aggregator: address) acquires Storage {
        let owner_addr = utils::owner();
        assert!(signer::address_of(owner) == owner_addr, E_WRONG_OWNER);
        let key = utils::key<C>();
        assert!(exists<Storage>(owner_addr), E_STORAGE_DOES_NOT_EXIST);
        assert!(!is_registered(key), E_AGGREGATOR_ALREADY_REGISTERED);
        let aggrs = &mut borrow_global_mut<Storage>(owner_addr).aggregators;
        simple_map::add(aggrs, key, aggregator);
        let results = &mut borrow_global_mut<Storage>(owner_addr).results;
        simple_map::add(results, key, Result { value: 0, dec: 0 });
    }

    fun is_registered(key: String): bool acquires Storage {
        let storage_ref = borrow_global<Storage>(utils::owner());
        is_registered_internal(key, storage_ref)
    }

    fun is_registered_internal(key: String, storage: &Storage): bool {
        simple_map::contains_key(&storage.aggregators, &key)
    }

    public fun price_from_aggregator(aggregator_addr: address): (u128, u8) {
        let latest_value = aggregator::latest_value(aggregator_addr);
        let (value, dec, _) = math::unpack(latest_value);
        (value, dec)
    }
    fun price_internal(key: String): (u128, u8) acquires Storage {
        let owner_addr = utils::owner();
        assert!(exists<Storage>(owner_addr), E_STORAGE_DOES_NOT_EXIST);
        assert!(is_registered(key), E_ASSET_NOT_REGISTERED);
        let aggrs = &borrow_global<Storage>(owner_addr).aggregators;
        let aggregator_addr = simple_map::borrow<String, address>(aggrs, &key);
        let (value, dec) = price_from_aggregator(*aggregator_addr);
        let results = &mut borrow_global_mut<Storage>(owner_addr).results;
        let result = simple_map::borrow_mut(results, &key);
        result.value = value;
        result.dec = dec;
        (value, dec)
    }
    public fun cached_price<C>(_account: &signer): (u128, u8) acquires Storage {
        let results = &borrow_global<Storage>(utils::owner()).results;
        let result = simple_map::borrow(results, &utils::key<C>());
        (result.value, result.dec)
    }
    public fun cached_price_entry<C>(account: &signer) acquires Storage {
        cached_price<C>(account);
    }
    public fun price<C>(_account: &signer): (u128, u8) acquires Storage {
        price_internal(utils::key<C>())
    }
    public entry fun price_entry<C>(account: &signer) acquires Storage {
        price<C>(account);
    }
    
    public entry fun volume<C>(account: &signer, amount: u128) acquires Storage, Volume {
        let (value, dec) = price_internal(utils::key<C>());
        let numerator = amount * value;
        let result = numerator / math128::pow_10((dec as u128));
        let account_addr = signer::address_of(account);
        let result_res = Volume<C> {
            input: amount,
            price: Result { value, dec },
            result: copy result,
        };
        if (exists<Volume<C>>(account_addr)) {
            let res = borrow_global_mut<Volume<C>>(account_addr);
            res.input = result_res.input;
            res.price = result_res.price;
            res.result = result_res.result;
        } else {
            move_to(account, result_res);
        };
    }
    public entry fun to_amount<C>(account: &signer, volume: u128) acquires Storage, Amount {
        let (value, dec) = price_internal(utils::key<C>());
        let numerator = volume * math128::pow_10((dec as u128));
        let result = numerator / value;
        let account_addr = signer::address_of(account);
        let result_res = Amount<C> {
            input: volume,
            price: Result { value, dec },
            result: copy result,
        };
        if (exists<Amount<C>>(account_addr)) {
            let res = borrow_global_mut<Amount<C>>(account_addr);
            res.input = result_res.input;
            res.price = result_res.price;
            res.result = result_res.result;
        } else {
            move_to(account, result_res);
        };
    }

    #[test_only]
    use std::vector;
    #[test_only]
    use std::unit_test;
    #[test_only]
    use aptos_framework::account;
    #[test_only]
    use aptos_framework::block;
    #[test_only]
    use aptos_framework::timestamp;
    #[test(aptos_framework = @aptos_framework)]
    fun test_aggregator(aptos_framework: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let signers = unit_test::create_signers_for_testing(1);
        let acc1 = vector::borrow(&signers, 0);

        aggregator::new_test(acc1, 100, 0, false);
        let (val, dec, is_neg) = math::unpack(aggregator::latest_value(signer::address_of(acc1)));
        assert!(val == 100 * math128::pow_10((dec as u128)), 0);
        assert!(dec == 9, 1);
        assert!(is_neg == false, 2);
    }
    #[test(owner = @owner, aptos_framework = @aptos_framework, eth_aggr = @0x111AAA, usdc_aggr = @0x222AAA)]
    fun test_price(owner: &signer, aptos_framework: &signer, eth_aggr: &signer, usdc_aggr: &signer) acquires Storage {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        account::create_account_for_test(signer::address_of(owner));
        initialize(owner);

        aggregator::new_test(eth_aggr, 1300, 0, false);
        aggregator::new_test(usdc_aggr, 99, 2, false);
        add_aggregator<ETH>(owner, signer::address_of(eth_aggr));
        add_aggregator<USDC>(owner, signer::address_of(usdc_aggr));

        let (val, dec) = price<ETH>(owner);
        assert!(val == math128::pow_10(9) * 1300, 0);
        assert!(dec == 9, 1);
        let (val, dec) = cached_price<ETH>(owner);
        assert!(val == math128::pow_10(9) * 1300, 2);
        assert!(dec == 9, 3);

        let (val, dec) = price<USDC>(owner);
        assert!(val == math128::pow_10(9) * 99 / 100, 0);
        assert!(dec == 9, 1);
        let (val, dec) = cached_price<USDC>(owner);
        assert!(val == math128::pow_10(9) * 99 / 100, 2);
        assert!(dec == 9, 3);
    }
}
