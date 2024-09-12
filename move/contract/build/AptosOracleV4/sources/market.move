module panana::market {

    use std::signer;
    use aptos_std::simple_map;
    use aptos_std::coin;
    use std::timestamp;
    use std::vector;
    use std::object::{ObjectCore, Self};
    use aptos_framework::object::{Object, ExtendRef};
    use aptos_framework::aptos_account::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use panana::price_oracle;
    use panana::utils;
    #[test_only]
    use aptos_std::debug;
    #[test_only]
    use aptos_std::pool_u64_unbound::create;

    const E_MARKETPLACE_ALREADY_EXISTS: u64 = 0; // Error when the marketplace already exists
    const E_UNAUTHORIZED: u64 = 1; // Error when the user is not authorized to perform an action
    const E_MARKETPLACE_DOES_NOT_EXIST: u64 = 2; // Error if we try to oprate on an non-existing marketplace
    const E_INVALID_MARKET_CLOSING_TIME: u64 = 3; // Error if we try to create a marketplace with an invalid closing time
    const E_ALREADY_BETTED_UP: u64 = 4; // Error if the user tries to bet down but has already betted up
    const E_ALREADY_BETTED_DOWN: u64 = 5; // Error if the user tries to bet up but has already betted down
    const E_MARKET_CLOSED: u64 = 6; // Error if user interacts with a market that is already closed
    const E_MARKET_STILL_OPEN: u64 = 7; // Error if trying to perform an action on an open market which is inteded for closed markets only
    const E_BET_TOO_LOW: u64 = 8; // Error if the placed bet is lower than the minimum requried amount
    const E_FEE_DENOMINATOR_NULL: u64 = 9; // Error if the fee denominator is 0


    const MIN_OPEN_DURATION_SEC: u64 = 60 * 10; // minimum open duration for a market is 10 minutes

    struct BetInfo has store {
        amount: u64,
        bet_up: bool, // true if the user is betting that the price will go up
    }

    struct MarketFee has store {
        nominator: u64,
        denominator: u64,
    }

    struct Market has key, store {
        start_price: u128,
        start_time: u64,
        end_time: u64,
        min_bet: u64,
        up_bets_sum: u64,
        down_bets_sum: u64,
        fee: MarketFee,
        up_bets: simple_map::SimpleMap<address, BetInfo>, // map of users betting up
        down_bets: simple_map::SimpleMap<address, BetInfo>, // map of users betting down
    }

    struct Marketplace<phantom C> has key {
        open_markets: vector<address> // contains all addresses of open markets
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ObjectController has key {
        extend_ref: object::ExtendRef,
    }

    #[view]
    public fun open_markets<C>(account: address): vector<address> acquires Marketplace {
        borrow_global_mut<Marketplace<C>>(account).open_markets
    }

    public entry fun initialize_marketplace<C>(account: &signer) {
        let account_address = &signer::address_of(account);
        let marketplace_address = object::create_object_address(account_address, utils::type_of<Marketplace<C>>());

        assert!(
            !object::object_exists<Marketplace<C>>(marketplace_address),
            E_MARKETPLACE_ALREADY_EXISTS
        );

        let marketplace_constructor_ref = &object::create_named_object(
            account,
            utils::type_of<Marketplace<C>>()
        );
        let marketplace_signer = &object::generate_signer(marketplace_constructor_ref);

        move_to(
            marketplace_signer,
            Marketplace<C> {
                open_markets: vector::empty<address>()
            }
        );

        let marketplace_object = object::object_from_constructor_ref<ObjectCore>(
            marketplace_constructor_ref
        );

        let extend_ref = object::generate_extend_ref(marketplace_constructor_ref);
        move_to(marketplace_signer, ObjectController { extend_ref });

        object::transfer(
            account,
            marketplace_object,
            *account_address
        );
    }

    public entry fun initialize_market<C>(account: &signer, end_time: u64, min_bet: u64, fee_nominator: u64, fee_denominator: u64) acquires Marketplace {
        assert!(fee_denominator != 0, E_FEE_DENOMINATOR_NULL);

        let account_address = &signer::address_of(account);
        let marketplace_address = object::create_object_address(account_address, utils::type_of<Marketplace<C>>());
        assert!(
            object::object_exists<Marketplace<C>>(marketplace_address),
            E_MARKETPLACE_DOES_NOT_EXIST
        );

        let start_time = timestamp::now_seconds();
        assert!(end_time > start_time + MIN_OPEN_DURATION_SEC, E_INVALID_MARKET_CLOSING_TIME);

        let market_constructor_ref = &object::create_object(marketplace_address);
        let market_signer = object::generate_signer(market_constructor_ref);

        let (start_price, _) = price_oracle::price<C>(account);

        // Set up the object by creating 2 resources in it
        move_to(
            &market_signer,
            Market {
                start_price,
                end_time,
                start_time,
                min_bet,
                fee: MarketFee {
                    nominator: fee_nominator,
                    denominator: fee_denominator,
                },
                up_bets_sum: 0,
                down_bets_sum: 0,
                up_bets: simple_map::create<address, BetInfo>(),
                down_bets: simple_map::create<address, BetInfo>(),
            }
        );

        let market_object = object::object_from_constructor_ref<Market>(
            market_constructor_ref
        );

        let marketplace_address = object::create_object_address(account_address, utils::type_of<Marketplace<C>>());
        object::transfer(account, market_object, marketplace_address);

        let extend_ref = object::generate_extend_ref(market_constructor_ref);
        move_to(&market_signer, ObjectController { extend_ref });

        let markets = &mut borrow_global_mut<Marketplace<C>>(marketplace_address).open_markets;
        vector::push_back(markets, object::object_address(&market_object));
    }

    public entry fun place_bet(account: &signer, market_obj: Object<Market>, bet_up: bool, amount: u64) acquires Market {
        let signer_address = signer::address_of(account);
        let market_ref = borrow_global_mut<Market>(object::object_address(&market_obj));

        // assert!(amount >= market_ref.min_bet, E_BET_TOO_LOW);
        // let cur_time = timestamp::now_seconds(); // TODO: enable again
        // assert!(market_ref.end_time > cur_time, E_MARKET_CLOSED);

        let has_betted_down = simple_map::contains_key(&market_ref.down_bets, &signer_address);
        let has_betted_up = simple_map::contains_key(&market_ref.up_bets, &signer_address);
        // assert!(has_betted_down && bet_up, E_ALREADY_BETTED_DOWN);
        // assert!(has_betted_up && !bet_up, E_ALREADY_BETTED_UP);

        let bets = if (bet_up) &mut market_ref.up_bets else &mut market_ref.down_bets;

        if (!simple_map::contains_key(bets, &signer_address)) {
            simple_map::add(bets, signer_address, BetInfo {
                amount,
                bet_up,
            });
        } else {
            let bet_info = simple_map::borrow_mut(bets, &signer_address);
            bet_info.amount = bet_info.amount + amount;
        };

        let marketplace_addr = object::owner(market_obj);

        // Transfer amount to this contract as a bet deposit
        aptos_account::transfer(account, object::object_address(&market_obj), amount);
        // Send Fees to marketplace
        aptos_account::transfer(account, object::owner(market_obj), amount * market_ref.fee.nominator / market_ref.fee.denominator);
        if (bet_up) {
            market_ref.up_bets_sum = market_ref.up_bets_sum + amount;
        } else {
            market_ref.down_bets_sum = market_ref.down_bets_sum + amount;
        };
    }

    public fun is_market_open(market_ref: &Market): bool {
        let cur_time = timestamp::now_seconds();
        market_ref.end_time < cur_time
    }

    #[view]
    public fun get_owner(): address {
        @owner
    }

    public entry fun payout_marketplace<C>(account: &signer, marketplace: Object<Marketplace<C>>, recipient: address) acquires ObjectController {
        let owner_addr = utils::owner();
        let account_addr = signer::address_of(account);
        assert!(account_addr == owner_addr, E_UNAUTHORIZED); // ensure only owner can create markets

        let marketplace_addr = object::object_address(&marketplace);
        let marketplace_extend_ref = &borrow_global<ObjectController>(marketplace_addr).extend_ref;
        let marketplace_signer = object::generate_signer_for_extending(marketplace_extend_ref);

        let balance = coin::balance<AptosCoin>(marketplace_addr);
        coin::transfer<AptosCoin>(&marketplace_signer, recipient, balance);
    }

    public entry fun resolve_market<C>(account: &signer, market_obj: Object<Market>) acquires Market, ObjectController {
        let owner_addr = utils::owner();
        let account_addr = signer::address_of(account);
        assert!(account_addr == owner_addr, E_UNAUTHORIZED); // ensure only owner can create markets

        let market_addr = object::object_address(&market_obj);
        let market_ref = borrow_global<Market>(market_addr);

        // Ensure the market's end time has passed
        // assert!(is_market_open(market_ref), E_MARKET_STILL_OPEN);

        // Get the end price from the oracle
        let (end_price, _) = price_oracle::price<C>(account);

        // Calculate winners based on price change
        let price_up = end_price > market_ref.start_price;
        let winners = if (price_up) {
            &market_ref.up_bets
        } else {
            &market_ref.down_bets
        };

        // Distribute rewards
        let total_bets = market_ref.down_bets_sum + market_ref.up_bets_sum;

        distribute_rewards(market_addr, winners, total_bets);

        // TODO: decide if we want to keep the old markets or delete them
        // Destroy the market
        // move_from<Market>();
    }

    fun distribute_rewards(market_addr: address, winners: &simple_map::SimpleMap<address, BetInfo>, total_bets: u64) acquires ObjectController {
        let keys = simple_map::keys(winners);
        let len = vector::length(&keys);
        let i = 0;

        // Reward each winner proportionally to their bet
        while (i < len) {
            let winner_addr = *vector::borrow(&keys, i);
            let bet_info = simple_map::borrow(winners, &winner_addr);
            let reward = bet_info.amount * total_bets / bet_info.amount;

            let market_extend_ref = &borrow_global<ObjectController>(market_addr).extend_ref;
            let market_signer = object::generate_signer_for_extending(market_extend_ref);
            coin::transfer<AptosCoin>(&market_signer, winner_addr, reward);
            i = i + 1;
        }
    }

    #[test_only]
    use aptos_framework::account;
    #[test_only]
    use aptos_framework::aptos_coin::initialize_for_test;
    #[test_only]
    use aptos_framework::block;
    #[test_only]
    use aptos_framework::resource_account;
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
        price_oracle::add_aggregator<APT>(owner, signer::address_of(aggregator));

        initialize_marketplace<APT>(owner);

        object::create_object_address(
            &signer::address_of(owner),
            utils::type_of<Marketplace<APT>>()
        )
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_marketplace(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) acquires Marketplace {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let apt_marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let open_markets = open_markets<APT>(apt_marketplace_address);
        assert!(vector::is_empty(&open_markets), 0);
    }

    #[expected_failure(abort_code = E_MARKETPLACE_ALREADY_EXISTS)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_marketplace_double_creation(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        aggregator::new_test(apt_aggr, 100, 9, false);

        price_oracle::initialize(owner);
        price_oracle::add_aggregator<APT>(owner, signer::address_of(apt_aggr));

        initialize_marketplace<APT>(owner);
        initialize_marketplace<APT>(owner);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) acquires Marketplace, Market {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let end_time = MIN_OPEN_DURATION_SEC + 1;
        let fee_nominator = 10;
        let fee_denominator = 100;
        initialize_market<APT>(owner, end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = open_markets<APT>(marketplace_address);
        assert!(vector::length(&open_markets) == 1, 1);
        let created_market_address = vector::borrow(&open_markets, 0);
        let created_market = borrow_global<Market>(*created_market_address);

        assert!(created_market.min_bet == min_bet, 2);
        assert!(created_market.end_time == end_time, 3);
        assert!(created_market.up_bets_sum == 0, 4);
        assert!(created_market.down_bets_sum == 0, 5);
        assert!(simple_map::length(&created_market.up_bets) == 0, 6);
        assert!(simple_map::length(&created_market.down_bets) == 0, 7);
        assert!(created_market.fee.nominator == fee_nominator, 8);
        assert!(created_market.fee.denominator == fee_denominator, 9);
        assert!(created_market.start_time == 0, 10);
        assert!(created_market.start_price == start_price, 11);
    }

    #[expected_failure(abort_code = E_MARKETPLACE_DOES_NOT_EXIST)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100)]
    fun test_initialize_market_nonexisting_marketplace(owner: &signer, aptos_framework: &signer) acquires Marketplace {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let min_bet = 2000;
        let end_time = 123;
        let fee_nominator = 10;
        let fee_denominator = 100;
        initialize_market<APT>(owner, end_time, min_bet, fee_nominator, fee_denominator);
    }

    #[expected_failure(abort_code = E_INVALID_MARKET_CLOSING_TIME)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market_invalid_closing_time(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) acquires Marketplace {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let end_time = MIN_OPEN_DURATION_SEC;
        let fee_nominator = 10;
        let fee_denominator = 100;
        initialize_market<APT>(owner, end_time, min_bet, fee_nominator, fee_denominator);
    }

    #[expected_failure(abort_code = E_FEE_DENOMINATOR_NULL)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, apt_aggr = @0x111AAA)]
    fun test_initialize_market_invalid_fee_denominator(owner: &signer, aptos_framework: &signer, apt_aggr: &signer) acquires Marketplace {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        init_marketplace<APT>(owner, apt_aggr, 100);

        let min_bet = 2000;
        let end_time = MIN_OPEN_DURATION_SEC + 1;
        let fee_nominator = 10;
        let fee_denominator = 0;
        initialize_market<APT>(owner, end_time, min_bet, fee_nominator, fee_denominator);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, apt_aggr = @0x111AAA)]
    fun test_market_bet(owner: &signer, aptos_framework: &signer, user: &signer, apt_aggr: &signer) acquires Marketplace, Market {
        account::create_account_for_test(signer::address_of(aptos_framework));
        block::initialize_for_test(aptos_framework, 1);
        timestamp::set_time_has_started_for_testing(aptos_framework);

        let start_price = 100;
        let marketplace_address = init_marketplace<APT>(owner, apt_aggr, start_price);

        let min_bet = 2000;
        let end_time = MIN_OPEN_DURATION_SEC + 1;
        let fee_nominator = 10;
        let fee_denominator = 100;
        initialize_market<APT>(owner, end_time, min_bet, fee_nominator, fee_denominator);

        let open_markets = open_markets<APT>(marketplace_address);
        let created_market_address = vector::borrow(&open_markets, 0);
        let market_object = object::address_to_object<Market>(*created_market_address);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);

        aptos_account::deposit_coins(signer::address_of(user), coins);
        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        place_bet(user, market_object, true, min_bet);
        let created_market = borrow_global<Market>(*created_market_address);
        let bet = simple_map::borrow(&created_market.up_bets, &signer::address_of(user));
        assert!(bet.amount == min_bet, 0);
        assert!(bet.bet_up, 1);
        assert!(created_market.up_bets_sum == min_bet, 0);
    }
}
