#[test_only]
module panana::market_test {
    use std::option;
    #[test_only]
    use aptos_framework::event;
    #[test_only]
    use std::signer;
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
    use panana::switchboard_asset::APT;
    #[test_only]
    use switchboard::aggregator;

    #[test_only]
    fun init_marketplace<C>(owner: &signer, aggregator: &signer, start_price: u128): address {
        aggregator::new_test(aggregator, start_price, 9, false);

        marketplace::create_marketplace<C>(owner, signer::address_of(aggregator));

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
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        assert!(open_markets.length() == 1, 1);
        let created_market_address = open_markets.borrow(0);

        let (market_fee_nominator, market_fee_denominator) = market::fee<APT>(*created_market_address);
        assert!(market::min_bet<APT>(*created_market_address) == min_bet, 2);
        assert!(market::end_time<APT>(*created_market_address) == end_time, 3);
        assert!(market::up_bets_sum<APT>(*created_market_address) == 0, 4);
        assert!(market::down_bets_sum<APT>(*created_market_address) == 0, 5);
        assert!(market::up_bets<APT>(*created_market_address) == 0, 6);
        assert!(market::down_bets<APT>(*created_market_address) == 0, 7);
        assert!(market_fee_nominator == fee_nominator, 8);
        assert!(market_fee_denominator == fee_denominator, 9);
        assert!(market::start_time<APT>(*created_market_address) == start_time, 10);
        assert!(market::start_price<APT>(*created_market_address) == start_price, 11);
        assert!(
            event::was_event_emitted(
                &market::test_create_market_event<APT>(
                    object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
                        object::address_to_object<market::Market<APT>>(*created_market_address),
             market::start_time<APT>(*created_market_address),
             market::end_time<APT>(*created_market_address),
                )
            ), 12);
    }

    #[expected_failure(abort_code = market::E_INVALID_MARKET_OPENING_TIME)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market_invalid_opening_time(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec() - 1;
        let end_time = start_time + market::min_open_duration() + 100;
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);
    }

    #[expected_failure(abort_code = market::E_INVALID_MARKET_CLOSING_TIME)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market_invalid_closing_time(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration() - 1;
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);
    }

    #[expected_failure(abort_code = market::E_PRICE_DELTA_DENOMINATOR_NULL)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market_price_delta_denominator_null(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration() - 1;
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::some(true), 0, 0, fee_nominator, fee_denominator);
    }

    #[expected_failure(abort_code = market::E_FEE_DENOMINATOR_NULL)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market_invalid_fee_denominator(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 0;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);
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
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

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
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec() + market::min_open_duration());
        market::place_bet(user, market_object, true, min_bet);
    }

    #[expected_failure(abort_code = market::E_MARKET_RUNNING)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_market_bet_running(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer)  {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec());
        market::place_bet(user, market_object, true, min_bet);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_market_bet(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer)  {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec() - 1);
        market::place_bet(user, market_object, true, min_bet);
        assert!(market::up_bets<APT>(*created_market_address) == 1, 0);
        assert!(market::down_bets<APT>(*created_market_address) == 0, 1);
        assert!(market::up_bet<APT>(*created_market_address, signer::address_of(user)).extract() == min_bet, 3);

        market::place_bet(user2, market_object, true, 30000);
        assert!(market::up_bets<APT>(*created_market_address) == 2, 0);
        assert!(market::down_bets<APT>(*created_market_address) == 0, 1);
        assert!(market::up_bet<APT>(*created_market_address, signer::address_of(user)).extract() == min_bet, 3);
        assert!(market::up_bet<APT>(*created_market_address, signer::address_of(user2)).extract() == 30000, 3);

        market::place_bet(user, market_object, false, 12345);
        assert!(market::up_bets<APT>(*created_market_address) == 2, 0);
        assert!(market::down_bets<APT>(*created_market_address) == 1, 1);
        assert!(market::up_bet<APT>(*created_market_address, signer::address_of(user)).extract() == min_bet, 3);
        assert!(market::down_bet<APT>(*created_market_address, signer::address_of(user)).extract() == 12345, 3);

        market::place_bet(user2, market_object, true, 30000);
        assert!(market::up_bets<APT>(*created_market_address) == 2, 0);
        assert!(market::down_bets<APT>(*created_market_address) == 1, 1);
        assert!(market::up_bet<APT>(*created_market_address, signer::address_of(user2)).extract() == 60000, 3);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_marketplace_payout(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

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

    #[expected_failure(abort_code = market::E_MARKET_STILL_AVAILABLE)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_still_open(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::create_account(signer::address_of(user2));

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        timestamp::fast_forward_seconds(market::min_open_duration());
        market::resolve_market<APT>(market_object);
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
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::create_account(signer::address_of(user2));

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        // Don't know if this can ever happen naturally, but we have it covered.
        // Manually causing the error here.
        panana::marketplace::remove_open_market<APT>(marketplace_address, *created_market_address);
        market::resolve_market<APT>(market_object);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, market_object, true, 1000000000);
        market::place_bet(user2, market_object, false, 2000000000);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec() + market::min_open_duration() + 1);
        aggregator::update_value(apt_aggr, start_price - 1, 9, false);
        market::resolve_market<APT>(market_object);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 0, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 2700000000, 2);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 300000000, 3);
        assert!(marketplace::available_markets<APT>(marketplace_address).length() == 0, 4);
        assert!(
            event::was_event_emitted(
                &market::test_resolve_market_event<APT>(
                    object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
                    object::address_to_object<market::Market<APT>>(*created_market_address),
                    market::start_time<APT>(*created_market_address),
                    market::end_time<APT>(*created_market_address),
                    1000000000 + 2000000000,
                    false
                )
            ), 5);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_percentage_up_success(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        let price_delta_numerator = 10;
        let price_delta_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::some(true), price_delta_numerator, price_delta_denominator, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let up_market_address = open_markets.borrow(0);

        let up_market_object = object::address_to_object<market::Market<APT>>(*up_market_address);
        let up_market_address = open_markets.borrow(0);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);
        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, up_market_object, true, 1000000000);
        market::place_bet(user2, up_market_object, false, 2000000000);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec() + market::min_open_duration() + 1);

        aggregator::update_value(apt_aggr, start_price + 10, 9, false);
        market::resolve_market<APT>(up_market_object);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 2700000000, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 0, 2);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 300000000, 3);
        assert!(marketplace::available_markets<APT>(marketplace_address).length() == 0, 4);
        assert!(
            event::was_event_emitted(
                &market::test_resolve_market_event<APT>(
                    object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
                    object::address_to_object<market::Market<APT>>(*up_market_address),
                    market::start_time<APT>(*up_market_address),
                    market::end_time<APT>(*up_market_address),
                    1000000000 + 2000000000,
                    false
                )
            ), 5);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_percentage_up_fail(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let start_price = 100;
        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        let price_delta_numerator = 10;
        let price_delta_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::some(true), price_delta_numerator, price_delta_denominator, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let up_market_address = open_markets.borrow(0);

        let up_market_object = object::address_to_object<market::Market<APT>>(*up_market_address);
        let up_market_address = open_markets.borrow(0);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);
        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, up_market_object, true, 1000000000);
        market::place_bet(user2, up_market_object, false, 2000000000);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec() + market::min_open_duration() + 1);

        aggregator::update_value(apt_aggr, start_price + 9, 9, false);
        market::resolve_market<APT>(up_market_object);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 0, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 2700000000, 2);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 300000000, 3);
        assert!(marketplace::available_markets<APT>(marketplace_address).length() == 0, 4);
        assert!(
            event::was_event_emitted(
                &market::test_resolve_market_event<APT>(
                    object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
                    object::address_to_object<market::Market<APT>>(*up_market_address),
                    market::start_time<APT>(*up_market_address),
                    market::end_time<APT>(*up_market_address),
                    1000000000 + 2000000000,
                    false
                )
            ), 5);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_percentage_down_success(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);


        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        let price_delta_numerator = 10;
        let price_delta_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::some(false), price_delta_numerator, price_delta_denominator, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let down_market_address = open_markets.borrow(0);

        let down_market_object = object::address_to_object<market::Market<APT>>(*down_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);
        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, down_market_object, true, 1000000000);
        market::place_bet(user2, down_market_object, false, 2000000000);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec() + market::min_open_duration() + 1);

        aggregator::update_value(apt_aggr, start_price - 10, 9, false);
        market::resolve_market<APT>(down_market_object);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 2700000000, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 0, 2);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 300000000, 3);
        assert!(marketplace::available_markets<APT>(marketplace_address).length() == 0, 4);
        assert!(
            event::was_event_emitted(
                &market::test_resolve_market_event<APT>(
                    object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
                    object::address_to_object<market::Market<APT>>(*down_market_address),
                    market::start_time<APT>(*down_market_address),
                    market::end_time<APT>(*down_market_address),
                    1000000000 + 2000000000,
                    false
                )
            ), 5);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_percentage_down_fail(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);


        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        let price_delta_numerator = 10;
        let price_delta_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::some(false), price_delta_numerator, price_delta_denominator, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let down_market_address = open_markets.borrow(0);

        let down_market_object = object::address_to_object<market::Market<APT>>(*down_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);
        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, down_market_object, true, 1000000000);
        market::place_bet(user2, down_market_object, false, 2000000000);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec() + market::min_open_duration() + 1);

        aggregator::update_value(apt_aggr, start_price - 9, 9, false);
        market::resolve_market<APT>(down_market_object);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 0, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 2700000000, 2);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 300000000, 3);
        assert!(marketplace::available_markets<APT>(marketplace_address).length() == 0, 4);
        assert!(
            event::was_event_emitted(
                &market::test_resolve_market_event<APT>(
                    object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
                    object::address_to_object<market::Market<APT>>(*down_market_address),
                    market::start_time<APT>(*down_market_address),
                    market::end_time<APT>(*down_market_address),
                    1000000000 + 2000000000,
                    false
                )
            ), 5);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_dissolve_if_equal_price(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, market_object, true, 1000000000);
        market::place_bet(user2, market_object, false, 2000000000);

        timestamp::fast_forward_seconds(market::earliest_market_opening_after_sec() + market::min_open_duration() + 1);
        market::resolve_market<APT>(market_object);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 900000000, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 1800000000, 2);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 300000000, 3);
        assert!(marketplace::available_markets<APT>(marketplace_address).length() == 0, 4);
        assert!(
            event::was_event_emitted(
                &market::test_resolve_market_event<APT>(
                    object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
                    object::address_to_object<market::Market<APT>>(*created_market_address),
                    market::start_time<APT>(*created_market_address),
                    market::end_time<APT>(*created_market_address),
                    1000000000 + 2000000000,
                    true
                )
            ), 4);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA)]
    fun test_resolve_market_dissolve_if_resolve_timespan_passed(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        market::place_bet(user, market_object, true, 1000000000);
        market::place_bet(user2, market_object, false, 2000000000);

        timestamp::fast_forward_seconds(end_time + market::max_resolve_market_timespan());
        aggregator::update_value(apt_aggr, start_price - 1, 9, false);
        market::resolve_market<APT>(market_object);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 900000000, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 1800000000, 2);
        assert!(coin::balance<AptosCoin>(marketplace_address) == 300000000, 3);
        assert!(marketplace::available_markets<APT>(marketplace_address).length() == 0, 4);
        assert!(
            event::was_event_emitted(
                &market::test_resolve_market_event<APT>(
                    object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
                    object::address_to_object<market::Market<APT>>(*created_market_address),
                    market::start_time<APT>(*created_market_address),
                    market::end_time<APT>(*created_market_address),
                    1000000000 + 2000000000,
                    true
                )
            ), 4);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_vote_market(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        market::vote(user, market_object, true);
        assert!(market::get_down_votes_sum<APT>(*created_market_address) == 0, 0);
        assert!(market::get_up_votes_sum<APT>(*created_market_address) == 1, 0);
    }

    #[expected_failure(abort_code = market::E_INVALID_VOTE)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_vote_market_twice(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        market::vote(user, market_object, true);
        market::vote(user, market_object, true);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_vote_market_change_vote(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let start_time = market::earliest_market_opening_after_sec();
        let end_time = start_time + market::min_open_duration();
        let fee_nominator = 10;
        let fee_denominator = 100;
        market::create_market<APT>(owner, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), start_time, end_time, min_bet, option::none(), 0, 0, fee_nominator, fee_denominator);

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = open_markets.borrow(0);
        let market_object = object::address_to_object<market::Market<APT>>(*created_market_address);

        market::vote(user, market_object, true);
        market::vote(user, market_object, false);
        assert!(market::get_down_votes_sum<APT>(*created_market_address) == 1, 0);
        assert!(market::get_up_votes_sum<APT>(*created_market_address) == 0, 0);

    }
}
