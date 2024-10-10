module panana::event_market {

    use std::signer;
    use aptos_std::simple_map;
    use aptos_std::coin;
    use std::timestamp;
    use std::object;
    use std::option;
    use std::option::{Option};
    use std::string;
    use std::string::String;
    use std::vector;
    use aptos_std::smart_table;
    use aptos_std::smart_table::SmartTable;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::object::{Object};
    use aptos_framework::aptos_account::{Self};
    use aptos_framework::event;
    use panana::marketplace::{Marketplace, Self};

    // Error when the user is not authorized to perform an action
    const E_UNAUTHORIZED: u64 = 1;
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
    // Rules text too short
    const E_RULES_TOO_SHORT: u64 = 12;
    // Question text too long
    const E_QUESTION_TOO_LONG: u64 = 13;
    // Question text too short
    const E_QUESTION_TOO_SHORT: u64 = 14;
    // If the user tries to create a market with too few answers
    const E_TOO_FEW_ANSWERS: u64 = 15;
    // User tries to bet on a non-existing answer
    const E_ANSWER_OUT_OF_RANGE: u64 = 16;
    // Answer text is too short
    const E_ANSWER_TOO_SHORT: u64 = 17;

    struct Percentage has store, drop {
        numerator: u64,
        denominator: u64,
    }

    struct EventMarket<phantom C> has key, store {
        // creator address of the market
        creator: address,
        // timestamp of the market creation in seconds
        created_at_timestamp: u64,
        // Question for the prediction market
        question: String,
        // Rules description
        rules: String,
        // Available answers
        answers: vector<String>,
        // Available bets
        bets: vector<SmartTable<address, u64>>,
        // Total bets
        total_bets: vector<u64>,
        // Winning answer (idx within the answers vector)
        winning_answer_idx: Option<u8>,
        // If not set, market is open for voting; if true, market is available, false if not accepted
        accepted: Option<bool>,
        // Timestamp the market was accepted or rejected
        accepted_or_rejected_at: Option<u64>,
        // Only set if accepted is false. Contains the reason why the market was rejected
        rejection_reason: Option<String>,
        // minimum bet amount for each player
        min_bet: u64,
        // fee for the marketplace after the market has been resolved
        fee: Percentage,
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
        market: Object<EventMarket<C>>,
        created_at_timestamp: u64,
    }

    // Emit whenever a user places a new bet
    #[event]
    struct PlaceBet<phantom C> has drop, store {
        account: address,
        bet: u64,
        marketplace: Object<Marketplace<C>>,
        market: Object<EventMarket<C>>,
        betted_at_timestamp: u64,
        answerIdx: u8,
    }

    // Emit whenever a market is resolved
    #[event]
    struct ResolveMarket<phantom C> has drop, store {
        creator: address,
        min_bet: u64,
        marketplace: Object<Marketplace<C>>,
        market: Object<EventMarket<C>>,
        created_at_timestamp: u64,
        resolved_at_timestamp: u64,
        winningAnswerIdx: u8,
        market_cap: u64,
    }

    #[view]
    public fun creator<C>(market_address: address): address acquires EventMarket {
        borrow_global<EventMarket<C>>(market_address).creator
    }

    #[view]
    public fun min_bet<C>(market_address: address): u64 acquires EventMarket {
        borrow_global<EventMarket<C>>(market_address).min_bet
    }

    #[view]
    public fun created_at<C>(market_address: address): u64 acquires EventMarket {
        borrow_global<EventMarket<C>>(market_address).created_at_timestamp
    }

    #[view]
    public fun accepted<C>(market_address: address): Option<bool> acquires EventMarket {
        borrow_global<EventMarket<C>>(market_address).accepted
    }

    #[view]
    public fun rejection_reason<C>(market_address: address): Option<String> acquires EventMarket {
        borrow_global<EventMarket<C>>(market_address).rejection_reason
    }


    #[view]
    public fun fee<C>(market_address: address): (u64, u64) acquires EventMarket {
        let nominator = borrow_global<EventMarket<C>>(market_address).fee.numerator;
        let denominator = borrow_global<EventMarket<C>>(market_address).fee.denominator;
        (nominator, denominator)
    }

    #[view]
    public fun get_up_votes_sum<C>(market_address: address): u64 acquires EventMarket {
        borrow_global<EventMarket<C>>(market_address).up_votes_sum
    }

    #[view]
    public fun get_down_votes_sum<C>(market_address: address): u64 acquires EventMarket {
        borrow_global<EventMarket<C>>(market_address).down_votes_sum
    }

    #[view]
    public fun get_vote<C>(market_address: address, user_address: address): option::Option<bool> acquires EventMarket {
        let user_votes = borrow_global<EventMarket<C>>(market_address).user_votes;
        if (simple_map::contains_key(&user_votes, &user_address))
            option::some(*simple_map::borrow(&user_votes, &user_address))
        else
            option::none<bool>()
    }

    public entry fun vote<C>(account: &signer, market: Object<EventMarket<C>>, vote_up: bool) acquires EventMarket {
        let market_address = object::object_address(&market);
        let account_address = signer::address_of(account);
        let market = borrow_global_mut<EventMarket<C>>(market_address);
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
        min_bet: u64,
        fee_numerator: u64,
        fee_denominator: u64,
        question: String,
        rules: String,
        answers: vector<String>,
    ) {
        assert!(fee_denominator != 0, E_FEE_DENOMINATOR_NULL);
        let marketplace_address = object::object_address(&marketplace);

        assert!(string::length(&rules) >= 100, E_RULES_TOO_SHORT);
        assert!(string::length(&question) >= 10, E_QUESTION_TOO_SHORT);
        assert!(string::length(&question) <= 100, E_QUESTION_TOO_LONG);
        assert!(vector::length(&answers) >= 2, E_TOO_FEW_ANSWERS);
        vector::for_each(answers, |el| assert!(string::length(&el) >= 2, E_ANSWER_TOO_SHORT));

        let current_timestamp = timestamp::now_seconds();
        let account_address = signer::address_of(account);
        let market_constructor_ref = &object::create_object(account_address);
        let market_signer = object::generate_signer(market_constructor_ref);

        // let answersMap = simple_map::new_from(answers, vector::map(answers, |_el| pool_u64_unbound::create()));
        let bets = vector::map(answers, |_el| smart_table::new<address, u64>());
        let total_bets = vector::map(answers, |_el| 0);

        move_to(
            &market_signer,
            EventMarket<C> {
                creator: signer::address_of(account),
                created_at_timestamp: current_timestamp,
                question,
                rules,
                answers,
                bets,
                total_bets,
                min_bet,
                fee: Percentage {
                    numerator: fee_numerator,
                    denominator: fee_denominator,
                },
                accepted: option::none(),
                accepted_or_rejected_at: option::none(),
                rejection_reason: option::none(),
                winning_answer_idx: option::none(),
                resolved_at: option::none(),
                up_votes_sum: 0,
                down_votes_sum: 0,
                user_votes: simple_map::new(),
            }
        );

        let market_object = object::object_from_constructor_ref<EventMarket<C>>(market_constructor_ref);

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
        });
    }

    public entry fun accept_market<C>(
        account: &signer,
        market_obj: Object<EventMarket<C>>,
    ) acquires EventMarket {
        let account_address = signer::address_of(account);
        assert!(account_address == @market_admin, E_UNAUTHORIZED);

        let market_ref = borrow_global_mut<EventMarket<C>>(object::object_address(&market_obj));
        market_ref.accepted = option::some(true);
        market_ref.accepted_or_rejected_at = option::some(timestamp::now_seconds());
    }

    public entry fun reject_market<C>(
        account: &signer,
        market_obj: Object<EventMarket<C>>,
        rejection_reason: String,
    ) acquires EventMarket {
        let account_address = signer::address_of(account);
        assert!(account_address == @market_admin, E_UNAUTHORIZED);

        let market_ref = borrow_global_mut<EventMarket<C>>(object::object_address(&market_obj));
        market_ref.accepted = option::some(false);
        market_ref.accepted_or_rejected_at = option::some(timestamp::now_seconds());
        market_ref.rejection_reason = option::some(rejection_reason);
    }

    public entry fun place_bet<C>(
        account: &signer,
        market_obj: Object<EventMarket<C>>,
        answerIdx: u8,
        amount: u64
    ) acquires EventMarket {
        let signer_address = signer::address_of(account);
        let market_ref = borrow_global_mut<EventMarket<C>>(object::object_address(&market_obj));

        assert!(amount >= market_ref.min_bet, E_BET_TOO_LOW);
        // betting only available for accepted markets
        assert!(*option::borrow_with_default(&market_ref.accepted, &false), E_MARKET_CLOSED);
        // betting only available if market was not resolved yet (=has no winning answer idx)
        assert!(option::is_none(&market_ref.winning_answer_idx), E_MARKET_CLOSED);
        assert!((answerIdx as u64) < vector::length(&market_ref.answers), E_ANSWER_OUT_OF_RANGE);

        let bets = vector::borrow_mut(&mut market_ref.bets, (answerIdx as u64));
        let old_amount = smart_table::borrow_with_default(bets, signer_address, &0);
        smart_table::upsert(bets, signer_address, *old_amount + amount);

        let bet_sum = vector::borrow_mut(&mut market_ref.total_bets, (answerIdx as u64));
        *bet_sum = *bet_sum + amount;

        // Transfer amount to this object as a bet deposit
        aptos_account::transfer(account, object::object_address(&market_obj), amount);

        event::emit(PlaceBet{
            account: signer_address,
            bet: amount,
            marketplace: object::address_to_object<Marketplace<C>>(object::owner(market_obj)),
            market: market_obj,
            betted_at_timestamp: timestamp::now_seconds(),
            answerIdx,
        });
    }

    public entry fun resolve_market<C>(
        account: &signer,
        market_obj: Object<EventMarket<C>>,
        winningAnswerIdx: u8,
    ) acquires EventMarket, ObjectController {
        let account_address = signer::address_of(account);
        assert!(account_address == @market_admin, E_UNAUTHORIZED);

        let marketplace_address = object::owner(market_obj);
        assert!(// should never happen
            object::object_exists<Marketplace<C>>(marketplace_address),
            E_INVALID_MARKETPLACE_TYPE
        );

        let market_address = object::object_address(&market_obj);
        let open_markets = marketplace::available_markets<C>(marketplace_address);
        assert!(vector::contains(&open_markets, &market_address), E_MARKET_CLOSED);

        let market_ref = borrow_global_mut<EventMarket<C>>(market_address);

        // Ensure the market's end time has passed
        assert!(option::is_none(&market_ref.winning_answer_idx), E_CANNOT_RESOLVE_MARKET);

        let total_pool = vector::fold(market_ref.total_bets, 0, |val, acc| acc + val);
        let winning_pool = *vector::borrow(&market_ref.total_bets, (winningAnswerIdx as u64));
        let winners = vector::borrow(&market_ref.bets, (winningAnswerIdx as u64));

        distribute_rewards(market_address, winners, winning_pool, total_pool, &market_ref.fee);

        // Send remaining balance (=fees) to marketplace
        let remaining_balance = coin::balance<AptosCoin>(market_address);
        let market_extend_ref = &borrow_global<ObjectController>(market_address).extend_ref;
        let market_signer = object::generate_signer_for_extending(market_extend_ref);
        aptos_account::transfer(&market_signer, object::owner(market_obj), remaining_balance);


        // validate if the resolve timespan is still open
        let current_timestamp = timestamp::now_seconds();
        market_ref.resolved_at = option::some(current_timestamp);
        market_ref.winning_answer_idx = option::some(winningAnswerIdx);

        panana::marketplace::remove_open_market<C>(
            marketplace_address,
            market_address,
            (total_pool as u128),
        );

        event::emit(ResolveMarket {
            creator: market_ref.creator,
            min_bet: market_ref.min_bet,
            marketplace: object::address_to_object(marketplace_address),
            market: market_obj,
            created_at_timestamp: market_ref.created_at_timestamp,
            resolved_at_timestamp: current_timestamp,
            winningAnswerIdx,
            market_cap: total_pool,
        });

        // TODO: decide if we want to keep the old markets or delete them
        // Destroy the market
        // move_from<Market>();
    }

    fun distribute_rewards(
        market_address: address,
        winners: &SmartTable<address, u64>,
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
        winners: &SmartTable<address, u64>,
        total_pool: u64,
        winning_pool: u64,
        fee: &Percentage,
        payout: |address, u64, u64|
    ) {
        let keys = smart_table::keys(winners);
        let len = vector::length(&keys);
        let i = 0;
        // Reward each winner proportionally to their bet
        while (i < len) {
            let winner_addr = *vector::borrow(&keys, i);
            let user_bet = smart_table::borrow(winners, winner_addr);

            let scale: u256 = 100_000_000_000;
            let scaled_bet_amount = (*user_bet as u256) * scale;
            let fractional_reward = scaled_bet_amount / (winning_pool as u256);
            let reward_before_fee = ((fractional_reward * (total_pool as u256) / scale) as u64);

            let reward_after_fee = reward_before_fee - (reward_before_fee * fee.numerator / fee.denominator);

            payout(winner_addr, reward_after_fee, i);
            i = i + 1;
        };
    }

    #[test_only]
    struct TableHolder<K: copy + drop, V: drop> has key {
        t: SmartTable<K, V>
    }

    #[test(account = @0x1)]
    fun test_calculate_and_send_rewards(account: &signer) {
        let winners = smart_table::new<address, u64>();
        smart_table::add(&mut winners, @0xA, 100000000);
        smart_table::add( &mut winners, @0xB, 200000000);
        smart_table::add( &mut winners, @0xC, 300000000);
        smart_table::add( &mut winners, @0xD, 400000000);
        smart_table::add( &mut winners, @0xE, 500000000);


        let winning_pool = 1500000000;
        let total_pool = 2400000000;


        let expected_winners = smart_table::keys(&winners);
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

        move_to(account, TableHolder {t: winners});
    }

    #[test(account = @0x1)]
    fun test_calculate_and_send_rewards_no_opponent(account: &signer) {
        let winners = smart_table::new<address, u64>();
        smart_table::add(&mut winners, @0xA, 100000000000000);

        let winning_pool = 100000000000000;
        let total_pool = 100000000000000;

        let expected_winners = smart_table::keys(&winners);
        let expected_payout = &mut vector::empty<u64>();
        vector::push_back(expected_payout, 98000000000000);

        calculate_and_send_rewards(&winners, total_pool, winning_pool, &Percentage {
            numerator: 2,
            denominator: 100,
        }, |winner, payout, idx| {
            assert!(*vector::borrow(&expected_winners, idx) == winner, 0);
            assert!(*vector::borrow(expected_payout, idx) == payout, 1);
        });

        move_to(account, TableHolder {t: winners});
    }

    #[test(account = @0x1)]
    fun test_calculate_and_send_rewards_no_opponent_two_players(account: &signer) {
        let winners = smart_table::new<address, u64>();
        smart_table::add(&mut winners, @0xA, 100000000000);
        smart_table::add(&mut winners, @0xB, 200000000000);

        let winning_pool = 300000000000;
        let total_pool = 300000000000;

        let expected_winners = smart_table::keys(&winners);
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

        move_to(account, TableHolder {t: winners});
    }
}
