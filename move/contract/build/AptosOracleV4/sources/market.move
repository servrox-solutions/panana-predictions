module panana::market {

    use std::signer;
    use aptos_std::simple_map;
    use aptos_std::coin;
    use std::timestamp;
    use std::vector;
    use std::object::{ObjectCore, Self};
    use std::option;
    use std::option::Option;
    use aptos_std::debug;
    use aptos_framework::object::{Object};
    use aptos_framework::aptos_account::{Self};
    use aptos_framework::aptos_coin::AptosCoin;
    use panana::price_oracle;
    use panana::marketplace::{Marketplace, Self};


    const E_MARKETPLACE_ALREADY_EXISTS: u64 = 0; // Error when the marketplace already exists
    const E_UNAUTHORIZED: u64 = 1; // Error when the user is not authorized to perform an action
    const E_INVALID_MARKET_CLOSING_TIME: u64 = 3; // Error if we try to create a marketplace with an invalid closing time
    const E_ALREADY_BETTED_UP: u64 = 4; // Error if the user tries to bet down but has already betted up
    const E_ALREADY_BETTED_DOWN: u64 = 5; // Error if the user tries to bet up but has already betted down
    const E_MARKET_CLOSED: u64 = 6; // Error if user interacts with a market that is already closed
    const E_MARKET_STILL_OPEN: u64 = 7; // Error if trying to perform an action on an open market which is inteded for closed markets only
    const E_BET_TOO_LOW: u64 = 8; // Error if the placed bet is lower than the minimum requried amount
    const E_FEE_DENOMINATOR_NULL: u64 = 9; // Error if the fee denominator is 0
    const E_INVALID_RESOLVE_MARKET_TYPE: u64 = 10; // Error if the resolved market type does not fit the market object


    const MIN_OPEN_DURATION_SEC: u64 = 60 * 10; // minimum open duration for a market is 10 minutes

    struct BetInfo has store, drop, copy {
        amount: u64,
        bet_up: bool, // true if the user is betting that the price will go up
    }

    struct MarketFee has store, drop {
        nominator: u64,
        denominator: u64,
    }

    struct Market has key, store {
        start_price: u64,
        start_time: u64,
        end_time: u64,
        min_bet: u64,
        up_bets_sum: u64,
        down_bets_sum: u64,
        fee: MarketFee,
        up_bets: simple_map::SimpleMap<address, BetInfo>, // map of users betting up
        down_bets: simple_map::SimpleMap<address, BetInfo>, // map of users betting down
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ObjectController has key {
        extend_ref: object::ExtendRef,
    }

    #[view]
    public fun min_open_duration(): u64 {
        MIN_OPEN_DURATION_SEC
    }

    #[view]
    public fun min_bet(market_address: address): u64 acquires Market {
        borrow_global<Market>(market_address).min_bet
    }

    #[view]
    public fun start_price(market_address: address): u64 acquires Market {
        borrow_global<Market>(market_address).start_price
    }

    #[view]
    public fun start_time(market_address: address): u64 acquires Market {
        borrow_global<Market>(market_address).start_time
    }

    #[view]
    public fun end_time(market_address: address): u64 acquires Market {
        borrow_global<Market>(market_address).end_time
    }

    #[view]
    public fun up_bets_sum(market_address: address): u64 acquires Market {
        borrow_global<Market>(market_address).up_bets_sum
    }

    #[view]
    public fun down_bets_sum(market_address: address): u64 acquires Market {
        borrow_global<Market>(market_address).down_bets_sum
    }

    #[view]
    public fun fee(market_address: address): (u64, u64) acquires Market {
        let nominator = borrow_global<Market>(market_address).fee.nominator;
        let denominator= borrow_global<Market>(market_address).fee.denominator;
        (nominator, denominator)
    }

    #[view]
    public fun up_bet(market_address: address, user_address: address): option::Option<u64> acquires Market {
        let up_bets = borrow_global<Market>(market_address).up_bets;
        return if (!simple_map::contains_key(&up_bets, &user_address))
            option::none()
        else
            option::some(simple_map::borrow(&up_bets, &user_address).amount)
    }

    #[view]
    public fun down_bet(market_address: address, user_address: address): option::Option<u64> acquires Market {
        let down_bets  = borrow_global<Market>(market_address).down_bets;
        return if (!simple_map::contains_key(&down_bets, &user_address))
            option::none()
        else
            option::some(simple_map::borrow(&down_bets, &user_address).amount)
    }

    #[view]
    public fun up_bets(market_address: address): u64 acquires Market {
        let up_bets  = borrow_global<Market>(market_address).up_bets;
        simple_map::length(&up_bets)
    }

    #[view]
    public fun down_bets(market_address: address): u64 acquires Market {
        let down_bets  = borrow_global<Market>(market_address).down_bets;
        simple_map::length(&down_bets)
    }

    public entry fun create_market<C>(account: &signer, marketplace: Object<Marketplace<C>>, end_time: u64, min_bet: u64, fee_nominator: u64, fee_denominator: u64) {
        assert!(fee_denominator != 0, E_FEE_DENOMINATOR_NULL);
        let marketplace_address = object::object_address(&marketplace);

        let start_time = timestamp::now_seconds();
        assert!(end_time >= start_time + MIN_OPEN_DURATION_SEC, E_INVALID_MARKET_CLOSING_TIME);

        let market_constructor_ref = &object::create_object(marketplace_address);
        let market_signer = object::generate_signer(market_constructor_ref);

        let (start_price, _) = price_oracle::price<C>(account);

        move_to(
            &market_signer,
            Market {
                start_price: (start_price as u64),
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

        let market_object = object::object_from_constructor_ref<Market>(market_constructor_ref);

        object::transfer(account, market_object, marketplace_address);

        let extend_ref = object::generate_extend_ref(market_constructor_ref);
        move_to(&market_signer, ObjectController { extend_ref });

        panana::marketplace::add_open_market<C>(marketplace_address, object::object_address(&market_object));
    }

    public entry fun place_bet(account: &signer, market_obj: Object<Market>, bet_up: bool, amount: u64) acquires Market {
        let signer_address = signer::address_of(account);
        let market_ref = borrow_global_mut<Market>(object::object_address(&market_obj));

        assert!(amount >= market_ref.min_bet, E_BET_TOO_LOW);
        let cur_time = timestamp::now_seconds();
        assert!(market_ref.end_time > cur_time, E_MARKET_CLOSED);

        let has_betted_down = simple_map::contains_key(&market_ref.down_bets, &signer_address);
        let has_betted_up = simple_map::contains_key(&market_ref.up_bets, &signer_address);

        // user can either bet up or down and cannot change its decision afterwards
        assert!(!(has_betted_down && bet_up), E_ALREADY_BETTED_DOWN);
        assert!(!(has_betted_up && !bet_up), E_ALREADY_BETTED_UP);

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

        // Transfer amount to this contract as a bet deposit
        aptos_account::transfer(account, object::object_address(&market_obj), amount);
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

    public entry fun resolve_market<C>(account: &signer, market_obj: Object<Market>) acquires Market, ObjectController {
        let marketplace_address = object::owner(market_obj);
        assert!(
            object::object_exists<Marketplace<C>>(marketplace_address),
            E_INVALID_RESOLVE_MARKET_TYPE
        );

        let open_markets = marketplace::open_markets<C>(marketplace_address);

        assert!(vector::contains(&open_markets, &object::object_address(&market_obj)), E_MARKET_CLOSED);

        let market_addr = object::object_address(&market_obj);
        let market_ref = borrow_global<Market>(market_addr);

        // Ensure the market's end time has passed
        assert!(is_market_open(market_ref), E_MARKET_STILL_OPEN);

        // Get the end price from the oracle
        let (end_price, _) = price_oracle::price<C>(account);

        // Calculate winners based on price change
        let price_up = (end_price as u64) > market_ref.start_price;
        let winners  = if (price_up) { // TODO: handle equal distribution
            &market_ref.up_bets
        } else {
            &market_ref.down_bets
        };
        let total_pool = market_ref.up_bets_sum + market_ref.down_bets_sum;
        let winning_pool = if (price_up) market_ref.up_bets_sum else market_ref.down_bets_sum;

        distribute_rewards(market_addr, winners, total_pool, winning_pool, &market_ref.fee);

        // TODO: decide if we want to keep the old markets or delete them
        // Destroy the market
        // move_from<Market>();
    }

    fun distribute_rewards(market_addr: address, winners: &simple_map::SimpleMap<address, BetInfo>, total_pool: u64, winning_pool: u64, fee: &MarketFee) acquires ObjectController {
        let market_extend_ref = &borrow_global<ObjectController>(market_addr).extend_ref;
        let market_signer = object::generate_signer_for_extending(market_extend_ref);

        calculate_and_send_rewards(winners, total_pool, winning_pool, fee, |winner, amount, idx| coin::transfer<AptosCoin>(&market_signer, winner, amount));

        // Send remaining balance (=fees) to marketplace
        let remaining_balance = coin::balance<AptosCoin>(market_addr);
        let market_obj = object::address_to_object<ObjectCore>(market_addr);
        aptos_account::transfer(&market_signer, object::owner(market_obj), remaining_balance);
    }

    inline fun calculate_and_send_rewards(winners: &simple_map::SimpleMap<address, BetInfo>, total_pool: u64, winning_pool: u64, fee: &MarketFee, payout: |address, u64, u64|) {
        let keys = simple_map::keys(winners);
        let len = vector::length(&keys);
        let i = 0;
        // Reward each winner proportionally to their bet
        while (i < len) {
            let winner_addr = *vector::borrow(&keys, i);
            let bet_info = simple_map::borrow(winners, &winner_addr);

            let scale: u256 = 100_000_000_000;
            let scaled_bet_amount = (bet_info.amount as u256) * scale;
            let fractional_reward = scaled_bet_amount / (winning_pool as u256);
            let reward_before_fee = ((fractional_reward * (total_pool as u256) / scale) as u64);

            let reward_after_fee = reward_before_fee - (reward_before_fee * fee.nominator / fee.denominator);

            payout(winner_addr, reward_after_fee, i);
            i = i + 1;
        };
    }

    #[test]
    fun test_calculate_and_send_rewards() {
        let winners = simple_map::create<address, BetInfo>();
        simple_map::add(&mut winners, @0xA, BetInfo{amount: 100000000, bet_up: true});
        simple_map::add(&mut winners, @0xB, BetInfo{amount: 200000000, bet_up: true});
        simple_map::add(&mut winners, @0xC, BetInfo{amount: 300000000, bet_up: true});
        simple_map::add(&mut winners, @0xD, BetInfo{amount: 400000000, bet_up: true});
        simple_map::add(&mut winners, @0xE, BetInfo{amount: 500000000, bet_up: true});


        let winning_pool = 1500000000;
        let total_pool = 2400000000;


        let expected_winners  = simple_map::keys(&winners);
        let expected_payout  = &mut vector::empty<u64>();
        vector::push_back(expected_payout, 156800000);
        vector::push_back(expected_payout, 313600000);
        vector::push_back(expected_payout, 470400000);
        vector::push_back(expected_payout, 627200000);
        vector::push_back(expected_payout, 784000000);

        calculate_and_send_rewards(&winners, total_pool, winning_pool, &MarketFee {
            nominator: 2,
            denominator: 100,
        }, |winner, payout, idx| {
            assert!(*vector::borrow(&expected_winners, idx) == winner, 0);
            assert!(*vector::borrow(expected_payout, idx) == payout, 1);
        });
    }

    #[test]
    fun test_calculate_and_send_rewards_no_opponent() {
        let winners = simple_map::create<address, BetInfo>();
        simple_map::add(&mut winners, @0xA, BetInfo{amount: 100000000000000, bet_up: true});

        let winning_pool = 100000000000000;
        let total_pool = 100000000000000;

        let expected_winners  = simple_map::keys(&winners);
        let expected_payout  = &mut vector::empty<u64>();
        vector::push_back(expected_payout, 98000000000000);

        calculate_and_send_rewards(&winners, total_pool, winning_pool, &MarketFee {
            nominator: 2,
            denominator: 100,
        }, |winner, payout, idx| {
            assert!(*vector::borrow(&expected_winners, idx) == winner, 0);
            assert!(*vector::borrow(expected_payout, idx) == payout, 1);
        });
    }

    #[test]
    fun test_calculate_and_send_rewards_no_opponent_two_players() {
        let winners = simple_map::create<address, BetInfo>();
        simple_map::add(&mut winners, @0xA, BetInfo{amount: 100000000000, bet_up: true});
        simple_map::add(&mut winners, @0xB, BetInfo{amount: 200000000000, bet_up: true});

        let winning_pool = 300000000000;
        let total_pool = 300000000000;

        let expected_winners  = simple_map::keys(&winners);
        let expected_payout  = &mut vector::empty<u64>();
        vector::push_back(expected_payout, 98000000000);
        vector::push_back(expected_payout, 195999999999); // scaling floating point issue with big numbers

        calculate_and_send_rewards(&winners, total_pool, winning_pool, &MarketFee {
            nominator: 2,
            denominator: 100,
        }, |winner, payout, idx| {
            assert!(*vector::borrow(&expected_winners, idx) == winner, 0);
            assert!(*vector::borrow(expected_payout, idx) == payout, 1);
        });
    }
}
