#[test_only]
module panana::marketplace_test {
    #[test_only]
    use aptos_framework::aptos_coin::AptosCoin;
    #[test_only]
    use aptos_framework::coin;
    #[test_only]
    use std::vector;
    #[test_only]
    use std::signer;
    #[test_only]
    use panana::marketplace;
    #[test_only]
    use panana::utils;
    #[test_only]
    use aptos_framework::object;
    #[test_only]
    use aptos_framework::aptos_account;
    #[test_only]
    use aptos_framework::aptos_coin::initialize_for_test;
    #[test_only]
    use panana::price_oracle::APT;

    #[test_only]
    fun init_marketplace<C>(owner: &signer): address {
        marketplace::create_marketplace<C>(owner);

        object::create_object_address(
            &signer::address_of(owner),
            utils::type_of<marketplace::Marketplace<C>>()
        )
    }

    #[test(owner = @0x100)]
    fun test_initialize_marketplace(owner: &signer) {
        let apt_marketplace_address = init_marketplace<APT>(owner);

        let open_markets = marketplace::available_markets<APT>(apt_marketplace_address);
        assert!(vector::is_empty(&open_markets), 0);
    }

    #[expected_failure(abort_code = marketplace::E_MARKETPLACE_ALREADY_EXISTS)]
    #[test(owner = @0x100)]
    fun test_initialize_marketplace_double_creation(owner: &signer) {
        marketplace::create_marketplace<APT>(owner);
        marketplace::create_marketplace<APT>(owner);
    }

    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200, user2 = @0x300)]
    fun test_marketplace_payout(owner: &signer, aptos_framework: &signer, user: &signer, user2: &signer) {
        let marketplace_address = init_marketplace<APT>(owner);

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

    #[expected_failure(abort_code = marketplace::E_UNAUTHORIZED)]
    #[test(aptos_framework = @aptos_framework, owner = @0x100, user = @0x200)]
    fun test_marketplace_payout_unauthorized(owner: &signer, aptos_framework: &signer, user: &signer) {
        let marketplace_address = init_marketplace<APT>(owner);

        let (burn, mint) = initialize_for_test(aptos_framework);
        let coins = coin::mint<AptosCoin>(1000000000, &mint);
        aptos_account::deposit_coins(signer::address_of(user), coins);

        coin::destroy_burn_cap(burn);
        coin::destroy_mint_cap(mint);

        aptos_account::transfer(user, marketplace_address, 1234);
        marketplace::payout_marketplace(user, object::address_to_object<marketplace::Marketplace<APT>>(marketplace_address), signer::address_of(user));
    }

    #[test(owner = @0x100, market = @0xCAFE, market2 = @0xBAAF)]
    fun test_initialize_marketplace_add_market(owner: &signer, market: &signer, market2: &signer) {
        let apt_marketplace_address = init_marketplace<APT>(owner);

        panana::marketplace::add_open_market<APT>(apt_marketplace_address, signer::address_of(market));
        panana::marketplace::add_open_market<APT>(apt_marketplace_address, signer::address_of(market2));
        let open_markets = marketplace::available_markets<APT>(apt_marketplace_address);
        assert!(vector::length(&open_markets) == 2, 0);
        let market_address = vector::borrow(&open_markets, 0);
        let market_address2 = vector::borrow(&open_markets, 1);
        assert!(*market_address == signer::address_of(market), 1);
        assert!(*market_address2 == signer::address_of(market2), 1);
    }

    #[test(owner = @0x100, market = @0xCAFE, market2 = @0xBAAF)]
    fun test_initialize_marketplace_remove_market(owner: &signer, market: &signer, market2: &signer) {
        let apt_marketplace_address = init_marketplace<APT>(owner);

        panana::marketplace::add_open_market<APT>(apt_marketplace_address, signer::address_of(market));
        panana::marketplace::add_open_market<APT>(apt_marketplace_address, signer::address_of(market2));

        let open_markets = marketplace::available_markets<APT>(apt_marketplace_address);
        assert!(vector::length(&open_markets) == 2, 0);

        panana::marketplace::remove_open_market<APT>(apt_marketplace_address, signer::address_of(market));
        let open_markets_after_remove = marketplace::available_markets<APT>(apt_marketplace_address);
        assert!(vector::length(&open_markets_after_remove) == 1, 1);

        let market_address_after_close = vector::borrow(&open_markets_after_remove, 0);
        assert!(*market_address_after_close == signer::address_of(market2), 2);
    }

    #[expected_failure(abort_code = marketplace::E_MARKET_ALREADY_EXISTS)]
    #[test(owner = @0x100, market = @0xCAFE)]
    fun test_initialize_marketplace_add_market_twice(owner: &signer, market: &signer) {
        let apt_marketplace_address = init_marketplace<APT>(owner);

        panana::marketplace::add_open_market<APT>(apt_marketplace_address, signer::address_of(market));
        panana::marketplace::add_open_market<APT>(apt_marketplace_address, signer::address_of(market));
    }
}
