module panana::market {

    use std::signer;
    use aptos_std::simple_map;
    use std::timestamp;
    use std::string::String;
    use panana::price_oracle;
    use aptos_framework::coin::{ Coin };
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::{ AptosCoin };

    struct BetInfo has key, store {
        amount: u64,
        bet_up: bool, // true if the user is betting that the price will go up
    }

    struct Market has key {
        start_price: u128,
        end_time: u64,
        up_bets: simple_map::SimpleMap<address, BetInfo>, // map of users betting up
        down_bets: simple_map::SimpleMap<address, BetInfo>, // map of users betting down
    }

    public entry fun initialize_market(account: &signer, end_time: u64) {
        let (start_price, _) = price_oracle::price<price_oracle::APT>(account);
        let signer_address = signer::address_of(account);

        assert!(!exists<Market>(signer_address), 1); // Ensure no existing market
        move_to(
            account,
            Market {
                start_price: start_price,
                end_time: end_time,
                up_bets: simple_map::create<address, BetInfo>(),
                down_bets: simple_map::create<address, BetInfo>(),
            }
        );
    }

    // public entry fun place_bet(account: &signer, bet_up: bool, amount: u64) acquires Market {
    //     let signer_address = signer::address_of(account);
    //     let market_ref = borrow_global_mut<Market>(signer_address);

    //     let bet_info = BetInfo {
    //         amount: amount,
    //         bet_up: bet_up,
    //     };

    //     if (bet_up) {
    //         simple_map::add(&mut market_ref.up_bets, signer_address, bet_info);
    //     } else {
    //         simple_map::add(&mut market_ref.down_bets, signer_address, bet_info);
    //     };

    //     // Transfer AptosCoin to this contract as a bet deposit
    //     aptos_coin::transfer(account, signer::address_of(account), amount);
    // }

    // public fun check_market_status(account: &signer): (u128, u64, u64) acquires Market {
    //     let signer_address = signer::address_of(account);
    //     let market_ref = borrow_global<Market>(signer_address);
    //     let (current_time, _) = timestamp::now_seconds();
    //     (market_ref.start_price, market_ref.end_time, current_time)
    // }

    // public entry fun resolve_market(account: &signer) acquires Market {
    //     let signer_address = signer::address_of(account);
    //     let market_ref = borrow_global_mut<Market>(signer_address);
    //     let (current_time, _) = timestamp::now_seconds();

    //     // Ensure the market's end time has passed
    //     assert!(current_time >= market_ref.end_time, 2);

    //     // Get the end price from the oracle
    //     let (end_price, _) = price_oracle::price<price_oracle::APT>(account);

    //     // Calculate winners based on price change
    //     let price_up = end_price > market_ref.start_price;
    //     let winners = if (price_up) {
    //         &market_ref.up_bets
    //     } else {
    //         &market_ref.down_bets
    //     };

    //     // Distribute rewards
    //     let total_bet_up = sum_bets(&market_ref.up_bets);
    //     let total_bet_down = sum_bets(&market_ref.down_bets);
    //     let total_bets = total_bet_up + total_bet_down;

    //     distribute_rewards(winners, total_bets);

    //     // Destroy the market
    //     move_from<Market>(signer_address);
    // }

    // fun sum_bets(bets: &simple_map::SimpleMap<address, BetInfo>): u64 {
    //     let total = 0;
    //     let keys = simple_map::keys(bets);
    //     let len = vector::length(&keys);

    //     let i = 0;
    //     while (i < len) {
    //         let key = *vector::borrow(&keys, i);
    //         let bet_info = simple_map::borrow(bets, &key);
    //         total = total + bet_info.amount;
    //         i = i + 1;
    //     };
    //     total
    // }

    // fun distribute_rewards(winners: &simple_map::SimpleMap<address, BetInfo>, total_bets: u64) {
    //     let keys = simple_map::keys(winners);
    //     let len = vector::length(&keys);
    //     let i = 0;

    //     // Reward each winner proportionally to their bet
    //     while (i < len) {
    //         let key = *vector::borrow(&keys, i);
    //         let bet_info = simple_map::borrow(winners, &key);
    //         let reward = bet_info.amount * total_bets / bet_info.amount;

    //         coin::transfer<AptosCoin>(&key, reward);
    //         i = i + 1;
    //     }
    // }
}
