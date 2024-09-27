module panana::market {

    use std::signer;
    use aptos_std::simple_map;
    use aptos_std::coin;
    use std::timestamp;
    use std::object;
    use std::option;
    use std::option::{is_some, Option, is_none};
    use std::vector;
    use aptos_framework::object::{Object};
    use aptos_framework::aptos_account::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::event;
    use panana::marketplace::{Marketplace, Self};

    // Error when the user is not authorized to perform an action
    const E_UNAUTHORIZED: u64 = 1;
    // Error if we try to create a marketplace with an invalid closing time
    const E_INVALID_MARKET_CLOSING_TIME: u64 = 2;
    // Error if we try to create a marketplace with an invalid closing time
    const E_INVALID_MARKET_OPENING_TIME: u64 = 3;
    // Error if user interacts with a market that is already closed
    const E_MARKET_CLOSED: u64 = 4;
    // Error if trying to perform an action on an open market which is inteded for closed markets only
    const E_CANNOT_RESOLVE_MARKET: u64 = 5;
    // Error if the placed bet is lower than the minimum requried amount
    const E_BET_TOO_LOW: u64 = 6;
    // Error if the fee denominator is 0
    const E_FEE_DENOMINATOR_NULL: u64 = 7;
    // Error if the resolved market type does not fit the market object
    const E_INVALID_MARKETPLACE_TYPE: u64 = 8;
    // Error if the user's vote is invalid
    const E_INVALID_VOTE: u64 = 9;
    // Error if user interacts with a market that is already closed
    const E_MARKET_RUNNING: u64 = 10;
    // Triggered whenever the user tries to do an action that is only allowed after a certain datetime
    const E_TOO_EARLY: u64 = 11;


    // minimum open duration for a market is 10 minutes
    const MIN_OPEN_DURATION_SEC: u64 = 60 * 10;
    // the earliest a merket can start (5 minutes from now)
    const EARLIEST_MARKET_OPENING_AFTER_SEC: u64 = 60 * 5;

    struct Percentage has store, drop {
        numerator: u64,
        denominator: u64,
    }

    struct Market<phantom C> has key, store {
        // creator address of the market
        creator: address,
        // timestamp of the market creation in seconds
        created_at_timestamp: u64,
        // initial price after the market was opened
        start_price: option::Option<u64>,
        // final price after closing the market
        end_price: option::Option<u64>,
        // timestamp in seconds after which no more bets are accepted
        start_time: u64,
        // timestamp in seconds at which the market is resolved
        end_time: u64,
        // minimum bet amount for each player
        min_bet: u64,
        // sum of all up bets
        up_bets_sum: u64,
        // sum of all down bets
        down_bets_sum: u64,
        // fee for the marketplace after the market has been resolved
        fee: Percentage,
        // map of users betting up
        up_bets: simple_map::SimpleMap<address, u64>,
        // map of users betting down
        down_bets: simple_map::SimpleMap<address, u64>,
        // timestamp when the market was resolved
        resolved_at: option::Option<u64>,
        // a list of users who upvoted the market
        user_votes: simple_map::SimpleMap<address, bool>,
        // sum of all up votes
        up_votes_sum: u64,
        // sum of all down votes
        down_votes_sum: u64,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ObjectController has key {
        extend_ref: object::ExtendRef,
    }

    // Emit whenever a new market is created
    #[event]
    struct CreateMarket<phantom C> has drop, store {
        creator: address,
        min_bet: u64,
        marketplace: Object<Marketplace<C>>,
        market: Object<Market<C>>,
        created_at_timestamp: u64,
        start_time_timestamp: u64,
        end_time_timestamp: u64,
    }

    // Emit whenever a user places a new bet
    #[event]
    struct PlaceBet<phantom C> has drop, store {
        account: address,
        bet: u64,
        marketplace: Object<Marketplace<C>>,
        market: Object<Market<C>>,
        betted_at_timestamp: u64,
        up: bool,
    }

    // Emit whenever a market is resolved
    #[event]
    struct ResolveMarket<phantom C> has drop, store {
        creator: address,
        min_bet: u64,
        marketplace: Object<Marketplace<C>>,
        market: Object<Market<C>>,
        created_at_timestamp: u64,
        start_time_timestamp: u64,
        end_time_timestamp: u64,
        start_price: u64,
        end_price: u64,
        market_cap: u64,
        dissolved: bool,
    }

    #[view]
    public fun min_open_duration(): u64 {
        MIN_OPEN_DURATION_SEC
    }

    #[view]
    public fun earliest_market_opening_after_sec(): u64 {
        EARLIEST_MARKET_OPENING_AFTER_SEC
    }

    #[view]
    public fun creator<C>(market_address: address): address acquires Market {
        borrow_global<Market<C>>(market_address).creator
    }

    #[view]
    public fun min_bet<C>(market_address: address): u64 acquires Market {
        borrow_global<Market<C>>(market_address).min_bet
    }

    #[view]
    public fun start_price<C>(market_address: address): Option<u64> acquires Market {
        borrow_global<Market<C>>(market_address).start_price
    }

    #[view]
    public fun created_at<C>(market_address: address): u64 acquires Market {
        borrow_global<Market<C>>(market_address).created_at_timestamp
    }

    #[view]
    public fun start_time<C>(market_address: address): u64 acquires Market {
        borrow_global<Market<C>>(market_address).start_time
    }

    #[view]
    public fun end_time<C>(market_address: address): u64 acquires Market {
        borrow_global<Market<C>>(market_address).end_time
    }

    #[view]
    public fun up_bets_sum<C>(market_address: address): u64 acquires Market {
        borrow_global<Market<C>>(market_address).up_bets_sum
    }

    #[view]
    public fun down_bets_sum<C>(market_address: address): u64 acquires Market {
        borrow_global<Market<C>>(market_address).down_bets_sum
    }

    #[view]
    public fun fee<C>(market_address: address): (u64, u64) acquires Market {
        let nominator = borrow_global<Market<C>>(market_address).fee.numerator;
        let denominator = borrow_global<Market<C>>(market_address).fee.denominator;
        (nominator, denominator)
    }

    #[view]
    public fun up_bet<C>(market_address: address, user_address: address): option::Option<u64> acquires Market {
        let up_bets = borrow_global<Market<C>>(market_address).up_bets;
        return if (!simple_map::contains_key(&up_bets, &user_address))
            option::none()
        else
            option::some(*simple_map::borrow(&up_bets, &user_address))
    }

    #[view]
    public fun down_bet<C>(market_address: address, user_address: address): option::Option<u64> acquires Market {
        let down_bets = borrow_global<Market<C>>(market_address).down_bets;
        return if (!simple_map::contains_key(&down_bets, &user_address))
            option::none()
        else
            option::some(*simple_map::borrow(&down_bets, &user_address))
    }

    #[view]
    public fun up_bets<C>(market_address: address): u64 acquires Market {
        let up_bets = borrow_global<Market<C>>(market_address).up_bets;
        simple_map::length(&up_bets)
    }

    #[view]
    public fun down_bets<C>(market_address: address): u64 acquires Market {
        let down_bets = borrow_global<Market<C>>(market_address).down_bets;
        simple_map::length(&down_bets)
    }


    #[view]
    public fun get_up_votes_sum<C>(market_address: address): u64 acquires Market {
        borrow_global<Market<C>>(market_address).up_votes_sum
    }

    #[view]
    public fun get_down_votes_sum<C>(market_address: address): u64 acquires Market {
        borrow_global<Market<C>>(market_address).down_votes_sum
    }

    #[view]
    public fun get_vote<C>(market_address: address, user_address: address): option::Option<bool> acquires Market {
        let user_votes = borrow_global<Market<C>>(market_address).user_votes;
        if (simple_map::contains_key(&user_votes, &user_address))
            option::some(*simple_map::borrow(&user_votes, &user_address))
        else
            option::none<bool>()
    }

    public entry fun vote<C>(account: &signer, market: Object<Market<C>>, vote_up: bool) acquires Market {
        let market_address = object::object_address(&market);
        let account_address = signer::address_of(account);
        let market = borrow_global_mut<Market<C>>(market_address);
        let user_votes = &mut market.user_votes;
        let down_votes_sum = &mut market.down_votes_sum;
        let up_votes_sum = &mut market.up_votes_sum;

        if (simple_map::contains_key(user_votes, &account_address)) {
            let user_vote = simple_map::borrow_mut(user_votes, &account_address);
            assert!(*user_vote != vote_up, E_INVALID_VOTE);
            *user_vote = vote_up;
            if (vote_up) *down_votes_sum = *down_votes_sum - 1 else *up_votes_sum = *up_votes_sum - 1;
        } else {
            simple_map::add(user_votes, account_address, vote_up);
        };

        if (vote_up) *up_votes_sum = *up_votes_sum + 1 else *down_votes_sum = *down_votes_sum + 1;
    }

    public entry fun create_market<C>(
        account: &signer,
        marketplace: Object<Marketplace<C>>,
        start_time_timestamp: u64,
        end_time_timestamp: u64,
        min_bet: u64,
        fee_numerator: u64,
        fee_denominator: u64,
    ) {
        assert!(fee_denominator != 0, E_FEE_DENOMINATOR_NULL);
        let marketplace_address = object::object_address(&marketplace);

        let current_timestamp = timestamp::now_seconds();
        assert!(
            start_time_timestamp >= current_timestamp + EARLIEST_MARKET_OPENING_AFTER_SEC,
            E_INVALID_MARKET_OPENING_TIME
        );
        assert!(end_time_timestamp >= start_time_timestamp + MIN_OPEN_DURATION_SEC, E_INVALID_MARKET_CLOSING_TIME);

        let account_address = signer::address_of(account);
        let market_constructor_ref = &object::create_object(account_address);
        let market_signer = object::generate_signer(market_constructor_ref);

        move_to(
            &market_signer,
            Market<C> {
                creator: signer::address_of(account),
                created_at_timestamp: current_timestamp,
                start_price: option::none(),
                end_price: option::none(),
                end_time: end_time_timestamp,
                start_time: start_time_timestamp,
                min_bet,
                fee: Percentage {
                    numerator: fee_numerator,
                    denominator: fee_denominator,
                },
                up_bets_sum: 0,
                down_bets_sum: 0,
                up_bets: simple_map::create<address, u64>(),
                down_bets: simple_map::create<address, u64>(),
                resolved_at: option::none(),
                up_votes_sum: 0,
                down_votes_sum: 0,
                user_votes: simple_map::new(),
            }
        );

        let market_object = object::object_from_constructor_ref<Market<C>>(market_constructor_ref);

        object::transfer(account, market_object, marketplace_address);

        let extend_ref = object::generate_extend_ref(market_constructor_ref);
        move_to(&market_signer, ObjectController { extend_ref });

        panana::marketplace::add_open_market<C>(marketplace_address, object::object_address(&market_object));

        event::emit(CreateMarket {
            creator: account_address,
            min_bet,
            marketplace,
            market: market_object,
            created_at_timestamp: current_timestamp,
            start_time_timestamp,
            end_time_timestamp,
        });
    }

    public entry fun start_market<C>(market_obj: Object<Market<C>>) acquires Market {
        let marketplace_address = object::owner(market_obj);
        assert!(// should never happen
            object::object_exists<Marketplace<C>>(marketplace_address),
            E_INVALID_MARKETPLACE_TYPE
        );
        let start_price = panana::marketplace::latest_price<C>(marketplace_address);
        let market_address = object::object_address(&market_obj);
        let market_ref = borrow_global_mut<Market<C>>(market_address);
        assert!(is_none(&market_ref.start_price), E_MARKET_RUNNING);
        let cur_time = timestamp::now_seconds();
        assert!(market_ref.start_time <= cur_time, E_TOO_EARLY);
        market_ref.start_price = option::some((start_price as u64));
    }

    public entry fun place_bet<C>(
        account: &signer,
        market_obj: Object<Market<C>>,
        bet_up: bool,
        amount: u64
    ) acquires Market {
        let signer_address = signer::address_of(account);
        let market_ref = borrow_global_mut<Market<C>>(object::object_address(&market_obj));

        assert!(amount >= market_ref.min_bet, E_BET_TOO_LOW);
        let cur_time = timestamp::now_seconds();
        assert!(market_ref.end_time > cur_time, E_MARKET_CLOSED);
        assert!(market_ref.start_time > cur_time, E_MARKET_RUNNING);

        let bets = if (bet_up) &mut market_ref.up_bets else &mut market_ref.down_bets;

        if (!simple_map::contains_key(bets, &signer_address)) {
            simple_map::add(bets, signer_address, amount);
        } else {
            let user_bet = simple_map::borrow_mut(bets, &signer_address);
            *user_bet = *user_bet + amount;
        };

        // Transfer amount to this contract as a bet deposit
        aptos_account::transfer(account, object::object_address(&market_obj), amount);
        if (bet_up) {
            market_ref.up_bets_sum = market_ref.up_bets_sum + amount;
        } else {
            market_ref.down_bets_sum = market_ref.down_bets_sum + amount;
        };

        event::emit(PlaceBet{
            account: signer_address,
            bet: amount,
            marketplace: object::address_to_object<Marketplace<C>>(object::owner(market_obj)),
            market: market_obj,
            betted_at_timestamp: timestamp::now_seconds(),
            up: bet_up,
        });
    }

    public fun can_resolve_market<C>(market_ref: &Market<C>): bool {
        let cur_time = timestamp::now_seconds();
        option::is_some(&market_ref.start_price) && market_ref.end_time < cur_time
    }

    public entry fun resolve_market<C>(market_obj: Object<Market<C>>) acquires Market, ObjectController {
        let marketplace_address = object::owner(market_obj);
        assert!(// should never happen
            object::object_exists<Marketplace<C>>(marketplace_address),
            E_INVALID_MARKETPLACE_TYPE
        );

        let market_address = object::object_address(&market_obj);
        let open_markets = marketplace::available_markets<C>(marketplace_address);
        assert!(vector::contains(&open_markets, &market_address), E_MARKET_CLOSED);

        let market_ref = borrow_global_mut<Market<C>>(market_address);

        // Ensure the market's end time has passed
        assert!(can_resolve_market(market_ref), E_CANNOT_RESOLVE_MARKET);
        let start_price = *option::borrow(&market_ref.start_price);

        // Get the end price from the oracle
        let end_price = panana::marketplace::latest_price<C>(marketplace_address);
        let end_price_u64 = (end_price as u64);
        let equal_price_outcome = end_price_u64 == start_price;

        // if true, the market should dissolve and all users get their bets back
        let should_dissolve = equal_price_outcome;

        if (should_dissolve) {
            // all betters get their money back (except marekt fees)
            dissolve_market(market_address, &market_ref.fee, &market_ref.up_bets, &market_ref.down_bets);
        } else {
            // Calculate winners based on price change
            let price_up_won = (end_price as u64) > start_price;

            let winners = if (price_up_won) {
                // price went up
                &market_ref.up_bets
            } else {
                // price went down
                &market_ref.down_bets
            };

            let total_pool = market_ref.up_bets_sum + market_ref.down_bets_sum;
            let winning_pool = if (price_up_won) market_ref.up_bets_sum else market_ref.down_bets_sum;

            distribute_rewards(market_address, winners, total_pool, winning_pool, &market_ref.fee);
        };

        // Send remaining balance (=fees) to marketplace
        let remaining_balance = coin::balance<AptosCoin>(market_address);
        let market_extend_ref = &borrow_global<ObjectController>(market_address).extend_ref;
        let market_signer = object::generate_signer_for_extending(market_extend_ref);
        aptos_account::transfer(&market_signer, object::owner(market_obj), remaining_balance);


        // validate if the resolve timespan is still open
        let current_timestamp = timestamp::now_seconds();
        market_ref.resolved_at = option::some(current_timestamp);
        market_ref.end_price = option::some(end_price_u64);

        panana::marketplace::remove_open_market<C>(
            marketplace_address,
            market_address,
            (market_ref.down_bets_sum as u128) + (market_ref.up_bets_sum as u128)
        );
        event::emit(ResolveMarket {
            creator: market_ref.creator,
            marketplace: object::address_to_object(marketplace_address),
            market: market_obj,
            min_bet: market_ref.min_bet,
            created_at_timestamp: market_ref.created_at_timestamp,
            start_time_timestamp: market_ref.start_time,
            end_time_timestamp: market_ref.end_time,
            start_price,
            end_price: end_price_u64,
            market_cap: market_ref.up_bets_sum + market_ref.down_bets_sum,
            dissolved: should_dissolve,
        });

        // TODO: decide if we want to keep the old markets or delete them
        // Destroy the market
        // move_from<Market>();
    }

    fun dissolve_market(
        market_address: address,
        fee: &Percentage,
        up_bets: &simple_map::SimpleMap<address, u64>,
        down_bets: &simple_map::SimpleMap<address, u64>
    ) acquires ObjectController {
        let market_extend_ref = &borrow_global<ObjectController>(market_address).extend_ref;
        let market_signer = object::generate_signer_for_extending(market_extend_ref);

        payout_bets(
            up_bets,
            fee,
            |payout_address, amount| coin::transfer<AptosCoin>(&market_signer, payout_address, amount)
        );
        payout_bets(
            down_bets,
            fee,
            |payout_address, amount| coin::transfer<AptosCoin>(&market_signer, payout_address, amount)
        );
    }

    inline fun payout_bets(bets: &simple_map::SimpleMap<address, u64>, fee: &Percentage, payout: |address, u64|) {
        let keys = simple_map::keys(bets);
        let len = vector::length(&keys);
        let i = 0;
        while (i < len) {
            let payout_addr = *vector::borrow(&keys, i);
            let user_bet = simple_map::borrow(bets, &payout_addr);
            let amount = *user_bet - (*user_bet * fee.numerator / fee.denominator);
            payout(payout_addr, amount);
            i = i + 1;
        };
    }


    fun distribute_rewards(
        market_address: address,
        winners: &simple_map::SimpleMap<address, u64>,
        total_pool: u64,
        winning_pool: u64,
        fee: &Percentage
    ) acquires ObjectController {
        let market_extend_ref = &borrow_global<ObjectController>(market_address).extend_ref;
        let market_signer = object::generate_signer_for_extending(market_extend_ref);

        calculate_and_send_rewards(
            winners,
            total_pool,
            winning_pool,
            fee,
            |winner, amount, _idx| coin::transfer<AptosCoin>(&market_signer, winner, amount)
        );
    }

    inline fun calculate_and_send_rewards(
        winners: &simple_map::SimpleMap<address, u64>,
        total_pool: u64,
        winning_pool: u64,
        fee: &Percentage,
        payout: |address, u64, u64|
    ) {
        let keys = simple_map::keys(winners);
        let len = vector::length(&keys);
        let i = 0;
        // Reward each winner proportionally to their bet
        while (i < len) {
            let winner_addr = *vector::borrow(&keys, i);
            let user_bet = simple_map::borrow(winners, &winner_addr);

            let scale: u256 = 100_000_000_000;
            let scaled_bet_amount = (*user_bet as u256) * scale;
            let fractional_reward = scaled_bet_amount / (winning_pool as u256);
            let reward_before_fee = ((fractional_reward * (total_pool as u256) / scale) as u64);

            let reward_after_fee = reward_before_fee - (reward_before_fee * fee.numerator / fee.denominator);

            payout(winner_addr, reward_after_fee, i);
            i = i + 1;
        };
    }

    #[test]
    fun test_calculate_and_send_rewards() {
        let winners = simple_map::create<address, u64>();
        simple_map::add(&mut winners, @0xA, 100000000);
        simple_map::add(&mut winners, @0xB, 200000000);
        simple_map::add(&mut winners, @0xC, 300000000);
        simple_map::add(&mut winners, @0xD, 400000000);
        simple_map::add(&mut winners, @0xE, 500000000);


        let winning_pool = 1500000000;
        let total_pool = 2400000000;


        let expected_winners = simple_map::keys(&winners);
        let expected_payout = &mut vector::empty<u64>();
        vector::push_back(expected_payout, 156800000);
        vector::push_back(expected_payout, 313600000);
        vector::push_back(expected_payout, 470400000);
        vector::push_back(expected_payout, 627200000);
        vector::push_back(expected_payout, 784000000);

        calculate_and_send_rewards(&winners, total_pool, winning_pool, &Percentage {
            numerator: 2,
            denominator: 100,
        }, |winner, payout, idx| {
            assert!(*vector::borrow(&expected_winners, idx) == winner, 0);
            assert!(*vector::borrow(expected_payout, idx) == payout, 1);
        });
    }

    #[test]
    fun test_calculate_and_send_rewards_no_opponent() {
        let winners = simple_map::create<address, u64>();
        simple_map::add(&mut winners, @0xA, 100000000000000);

        let winning_pool = 100000000000000;
        let total_pool = 100000000000000;

        let expected_winners = simple_map::keys(&winners);
        let expected_payout = &mut vector::empty<u64>();
        vector::push_back(expected_payout, 98000000000000);

        calculate_and_send_rewards(&winners, total_pool, winning_pool, &Percentage {
            numerator: 2,
            denominator: 100,
        }, |winner, payout, idx| {
            assert!(*vector::borrow(&expected_winners, idx) == winner, 0);
            assert!(*vector::borrow(expected_payout, idx) == payout, 1);
        });
    }

    #[test]
    fun test_calculate_and_send_rewards_no_opponent_two_players() {
        let winners = simple_map::create<address, u64>();
        simple_map::add(&mut winners, @0xA, 100000000000);
        simple_map::add(&mut winners, @0xB, 200000000000);

        let winning_pool = 300000000000;
        let total_pool = 300000000000;

        let expected_winners = simple_map::keys(&winners);
        let expected_payout = &mut vector::empty<u64>();
        vector::push_back(expected_payout, 98000000000);
        vector::push_back(expected_payout, 195999999999); // scaling floating point issue with big numbers

        calculate_and_send_rewards(&winners, total_pool, winning_pool, &Percentage {
            numerator: 2,
            denominator: 100,
        }, |winner, payout, idx| {
            assert!(*vector::borrow(&expected_winners, idx) == winner, 0);
            assert!(*vector::borrow(expected_payout, idx) == payout, 1);
        });
    }

    #[view]
    #[test_only]
    public fun test_create_market_event<C>(
        creator: address,
        min_bet: u64,
        marketplace: Object<Marketplace<C>>,
        market: Object<Market<C>>,
        created_at_timestamp: u64,
        start_time_timestamp: u64,
        end_time_timestamp: u64,
    ): CreateMarket<C> {
        CreateMarket<C> { creator, min_bet, marketplace, market, created_at_timestamp, start_time_timestamp, end_time_timestamp }
    }

    #[view]
    #[test_only]
    public fun test_resolve_market_event<C>(
        creator: address,
        min_bet: u64,
        marketplace: Object<Marketplace<C>>,
        market: Object<Market<C>>,
        created_at_timestamp: u64,
        start_time_timestamp: u64,
        end_time_timestamp: u64,
        start_price: u64,
        end_price: u64,
        market_cap: u64,
        dissolved: bool,
    ): ResolveMarket<C> {
        ResolveMarket<C> { creator, min_bet, marketplace, market, created_at_timestamp, start_time_timestamp, end_time_timestamp, start_price, end_price, market_cap, dissolved }
    }

    #[view]
    #[test_only]
    public fun test_place_bet_event<C>(
        account: address,
        bet: u64,
        marketplace: Object<Marketplace<C>>,
        market: Object<Market<C>>,
        betted_at_timestamp: u64,
        up: bool,
    ): PlaceBet<C> {
        PlaceBet<C> { account, bet, marketplace, market, betted_at_timestamp, up }
    }
}
