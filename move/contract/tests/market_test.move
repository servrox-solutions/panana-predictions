#[test_only]
module panana::market_test {
    #[test_only]
    use std::signer;
    #[test_only]
    use std::vector;
    #[test_only]
    use aptos_framework::aptos_account;
    #[test_only]
    use aptos_framework::aptos_coin::AptosCoin;
    #[test_only]
    use aptos_framework::coin;
    #[test_only]
    use aptos_framework::object;
    #[test_only]
    use aptos_framework::timestamp;
    #[test_only]
    use panana::price_oracle;
    #[test_only]
    use panana::marketplace;
    #[test_only]
    use panana::market;
    #[test_only]
    use aptos_framework::account;
    #[test_only]
    use aptos_framework::aptos_coin::initialize_for_test;
    #[test_only]
    use aptos_framework::block;
    #[test_only]
    use panana::utils;
    #[test_only]
    use panana::price_oracle::BTC;
    #[test_only]
    use panana::price_oracle::APT;
    #[test_only]
    use switchboard::aggregator;

    #[test_only]
    fun init_marketplace<C>(owner: &signer, aggregator: &signer, start_price: u128): address {
        aggregator::new_test(aggregator, start_price, 9, false);

        price_oracle::initialize(owner);
        price_oracle::add_aggregator<C>(owner, signer::address_of(aggregator));

        marketplace::create_marketplace<C>(owner);

        marketplace::marketplace_address<C>(signer::address_of(owner))
    }


    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        assert!(vector::length(&open_markets) == 1, 1);
        let created_market_address = vector::borrow(&open_markets, 0);

        let (market_fee_nominator, market_fee_denominator) = market::fee(*created_market_address);
        assert!(market::min_bet(*created_market_address) == min_bet, 2);
        assert!(market::end_time(*created_market_address) == end_time, 3);
        assert!(market::up_bets_sum(*created_market_address) == 0, 4);
        assert!(market::down_bets_sum(*created_market_address) == 0, 5);
        assert!(market::up_bets(*created_market_address) == 0, 6);
        assert!(market::down_bets(*created_market_address) == 0, 7);
        assert!(market_fee_nominator == fee_nominator, 8);
        assert!(market_fee_denominator == fee_denominator, 9);
        assert!(market::start_time(*created_market_address) == 0, 10);
        assert!(market::start_price(*created_market_address) == start_price, 11);

    }

    #[expected_failure(abort_code = market::E_INVALID_MARKET_CLOSING_TIME)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market_invalid_closing_time(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let end_time = market::min_open_duration() - 1;
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);
    }

    #[expected_failure(abort_code = market::E_FEE_DENOMINATOR_NULL)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market_invalid_fee_denominator(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 0;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);
    }



    #[expected_failure(abort_code = market::E_BET_TOO_LOW)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_market_bet_too_low(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, market_object, true, min_bet - 1);
    }

    #[expected_failure(abort_code = market::E_MARKET_CLOSED)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_market_bet_closed(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer)  {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        timestamp::fast_forward_seconds(market::min_open_duration());
        market::place_bet(user, market_object, true, min_bet);
    }

    #[expected_failure(abort_code = market::E_ALREADY_BETTED_UP)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_market_bet_already_bet_up(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, market_object, true, min_bet);
        market::place_bet(user, market_object, false, min_bet);
    }

    #[expected_failure(abort_code = market::E_ALREADY_BETTED_DOWN)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_market_bet_already_bet_down(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, market_object, false, min_bet);
        market::place_bet(user, market_object, true, min_bet);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_marketplace_payout(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::create_account(signer::address_of(user2));

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        aptos_account::transfer(user, marketplace_address, 1234);
        marketplace::payout_marketplace(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), signer::address_of(user2));
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 1234, 3);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 0, 4);
    }

    #[expected_failure(abort_code = market::E_INVALID_RESOLVE_MARKET_TYPE)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_invalid_market_type(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::create_account(signer::address_of(user2));

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::resolve_market<BTC>(user, market_object);
    }

    #[expected_failure(abort_code = market::E_INVALID_RESOLVE_MARKET_TYPE)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA, btc_aggr = @0x222BBB)]
    fun test_resolve_market_invalid_resolve_market_type(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer, btc_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        aggregator::new_test(apt_aggr, 100, 9, false);

        price_oracle::initialize(owner);
        price_oracle::add_aggregator<APT>(owner, signer::address_of(apt_aggr));
        price_oracle::add_aggregator<BTC>(owner, signer::address_of(btc_aggr));

        marketplace::create_marketplace<APT>(owner);
        marketplace::create_marketplace<BTC>(owner);

        let apt_marketplace_address =  object::create_object_address(
            &signer::address_of(owner),
            utils::type_of<marketplace::Marketplace<APT>>()
        );

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(apt_marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(apt_marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::create_account(signer::address_of(user2));

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        timestamp::fast_forward_seconds(market::min_open_duration());
        market::resolve_market<BTC>(user, market_object);
    }

    #[expected_failure(abort_code = market::E_MARKET_STILL_OPEN)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_still_open(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::create_account(signer::address_of(user2));

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        timestamp::fast_forward_seconds(market::min_open_duration());
        market::resolve_market<APT>(user, market_object);
    }

    #[expected_failure(abort_code = market::E_MARKET_CLOSED)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_not_in_marketplace_open(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::create_account(signer::address_of(user2));

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        // Don't know if this can ever happen naturally, but we have it covered.
        // Manually causing the error here.
        panana::marketplace::remove_open_market<APT>(marketplace_address, *created_market_address);
        market::resolve_market<APT>(user, market_object);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = marketplace::open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<market::Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, market_object, true, 1000000000);
        market::place_bet(user2, market_object, false, 2000000000);

        timestamp::fast_forward_seconds(market::min_open_duration() + 1);
        market::resolve_market<APT>(user, market_object);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 0, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 2700000000, 2);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 300000000, 3);
    }
}
