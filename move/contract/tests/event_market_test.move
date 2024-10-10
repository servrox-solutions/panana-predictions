#[test_only]
module panana::event_market_test {
    #[test_only]
    use std::string::{Self, String};
    #[test_only]
    use std::option;
    #[test_only]
    use std::vector;
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
    use panana::event_market;
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
    fun test_initialize_event_market(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            owner,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        assert!(vector::length(&open_markets) == 1, 1);
        let created_market_address = vector::borrow(&open_markets, 0);

        let (market_fee_nominator, market_fee_denominator) = event_market::fee<APT>(*created_market_address);
        assert!(event_market::creator<APT>(*created_market_address) == signer::address_of(owner), 1);
        assert!(event_market::min_bet<APT>(*created_market_address) == min_bet, 2);
        assert!(market_fee_nominator == fee_nominator, 8);
        assert!(market_fee_denominator == fee_denominator, 9);
        assert!(event_market::created_at<APT>(*created_market_address) == 0, 10);
    }

    #[expected_failure(abort_code = event_market::E_FEE_DENOMINATOR_NULL)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_event_market_invalid_fee_denominator(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 0;

        event_market::create_market<APT>(
            owner,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );
    }

    #[expected_failure(abort_code = event_market::E_BET_TOO_LOW)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_event_market_bet_too_low(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            owner,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<event_market::EventMarket<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        event_market::place_bet(user, market_object, 0, min_bet - 1);
    }

    #[expected_failure(abort_code = event_market::E_MARKET_CLOSED)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_event_market_bet_closed(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            owner,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<event_market::EventMarket<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        event_market::place_bet(user, market_object, 1, min_bet);
        event_market::place_bet(user, market_object, 0, min_bet); // Betting on multiple answers to test if the market will prevent it later
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA, market_admin = @0x400)]
    fun test_event_market_bet(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer, market_admin: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            owner,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<event_market::EventMarket<APT>>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        let coins2 = coin::mint<AptosCoin>(2000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);
        aptos_account::deposit_coins(signer::address_of(user2), coins2);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        assert!(option::is_none(&event_market::accepted<APT>(*created_market_address)), 5);
        event_market::accept_market(market_admin, market_object);
        assert!(*option::borrow_with_default(&event_market::accepted<APT>(*created_market_address), &false), 6);

        event_market::place_bet(user, market_object, 0, 1000000000);
        event_market::place_bet(user2, market_object, 1, 2000000000);

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 0, 1);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) == 0, 2);

        event_market::resolve_market(market_admin, market_object, 1); // resolving for answer index 1

        assert!(coin::balance<AptosCoin>(signer::address_of(user)) == 0, 3);
        assert!(coin::balance<AptosCoin>(signer::address_of(user2)) > 0, 4);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300, apt_aggr = @0x111AAA, market_admin = @0x400)]
    fun test_event_market_reject(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer, apt_aggr: &signer, market_admin: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");

        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            owner,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<event_market::EventMarket<APT>>(*created_market_address);

        assert!(option::is_none(&event_market::accepted<APT>(*created_market_address)), 5);
        let rejection_string = string::utf8(b"The provided information is not sufficient to accureately resolve the market.");
        event_market::reject_market(market_admin, market_object, rejection_string);
        assert!(!*option::borrow_with_default(&event_market::accepted<APT>(*created_market_address), &true), 6);
        assert!(*option::borrow_with_default(&event_market::rejection_reason<APT>(*created_market_address), &(string::utf8(b""))) == rejection_string, 6);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA, market_admin = @0x400)]
    fun test_vote_event_market(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer, market_admin: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            market_admin,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<event_market::EventMarket<APT>>(*created_market_address);

        event_market::vote(user, market_object, true);
        assert!(event_market::get_down_votes_sum<APT>(*created_market_address) == 0, 0);
        assert!(event_market::get_up_votes_sum<APT>(*created_market_address) == 1, 0);
    }

    #[expected_failure(abort_code = event_market::E_INVALID_VOTE)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA, market_admin = @0x400)]
    fun test_vote_event_market_twice(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer, market_admin: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            market_admin,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<event_market::EventMarket<APT>>(*created_market_address);

        event_market::vote(user, market_object, true);
        event_market::vote(user, market_object, true);
    }

    #[expected_failure(abort_code = event_market::E_UNAUTHORIZED)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA, market_admin = @0x400)]
    fun test_unauthorized_accept_market(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer, market_admin: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            market_admin,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<event_market::EventMarket<APT>>(*created_market_address);

        event_market::accept_market(owner, market_object);
    }

    #[expected_failure(abort_code = event_market::E_UNAUTHORIZED)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA, market_admin = @0x400)]
    fun test_unauthorized_reject_market(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer, market_admin: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let question = string::utf8(b"Will the price of APT increase?");
        let rules = string::utf8(b"The rules are simple: will the APT price incrase until 01/01/24? The final price will be determined by a switchboard oracle.");
        let answers = vector::empty<String>();
        vector::push_back(&mut answers, string::utf8(b"Yes"));
        vector::push_back(&mut answers, string::utf8(b"No"));

        let fee_nominator = 10;
        let fee_denominator = 100;

        event_market::create_market<APT>(
            market_admin,
            object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address),
            min_bet,
            fee_nominator,
            fee_denominator,
            question,
            rules,
            answers
        );

        let open_markets = marketplace::available_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<event_market::EventMarket<APT>>(*created_market_address);

        event_market::reject_market(owner, market_object, string::utf8(b"This is just some reason to have the test pass successfully."));
    }
}
