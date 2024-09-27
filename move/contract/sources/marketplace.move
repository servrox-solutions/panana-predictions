module panana::marketplace {

    use std::signer;
    use aptos_std::coin;
    use std::vector;
    use std::object::{ObjectCore, Self};
    use std::string::String;
    use aptos_std::simple_map;
    use aptos_framework::object::{Object};
    use aptos_framework::aptos_coin::AptosCoin;
    use panana::utils;
    use switchboard::math;
    use switchboard::aggregator;
    use panana::switchboard_asset;

    friend panana::market;
    #[test_only]
    friend panana::market_test;
    #[test_only]
    friend panana::marketplace_test;

    const E_MARKETPLACE_ALREADY_EXISTS: u64 = 0;
    // Error when the marketplace already exists
    const E_UNAUTHORIZED: u64 = 1;
    // Error when the user is not authorized to perform an action
    const E_MARKET_ALREADY_EXISTS: u64 = 2; // Error when an existing market tries to register again

    struct Marketplace<phantom C> has key {
        available_markets: vector<address>,
        // contains all addresses of running and open markets
        switchboard_feed: address,
        // switchboard asset feed for market resolution
        all_time_volume: u256,
        // total volume that was traded on this marketplace
    }

    struct MarketplaceList has key {
        marketplaces: simple_map::SimpleMap<address, String>,
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ObjectController has key {
        extend_ref: object::ExtendRef,
    }

    fun init_module(sender: &signer) acquires MarketplaceList {
        create_marketplace<switchboard_asset::APT>(sender, @switchbaord_feed_apt);
        create_marketplace<switchboard_asset::BTC>(sender, @switchbaord_feed_btc);
        create_marketplace<switchboard_asset::SOL>(sender, @switchbaord_feed_sol);
        create_marketplace<switchboard_asset::USDC>(sender, @switchbaord_feed_usdc);
        create_marketplace<switchboard_asset::ETH>(sender, @switchbaord_feed_eth);
    }

    #[view]
    public fun available_marketplaces(
        account_address: address
    ): simple_map::SimpleMap<address, String> acquires MarketplaceList {
        borrow_global<MarketplaceList>(account_address).marketplaces
    }

    #[view]
    public fun available_markets<C>(marketplace_address: address): vector<address> acquires Marketplace {
        borrow_global<Marketplace<C>>(marketplace_address).available_markets
    }

    #[view]
    public fun marketplace_address<C>(account: address): address {
        object::create_object_address(&account, utils::type_of<Marketplace<C>>())
    }

    public(friend) fun add_open_market<C>(marketplace_address: address, market_address: address) acquires Marketplace {
        let open_markets = &mut borrow_global_mut<Marketplace<C>>(marketplace_address).available_markets;
        assert!(!vector::contains(open_markets, &market_address), E_MARKET_ALREADY_EXISTS); // Should never happen
        vector::push_back(open_markets, market_address);
    }

    public(friend) fun remove_open_market<C>(
        marketplace_address: address,
        market_address: address,
        volume: u128
    ) acquires Marketplace {
        let marketplace_ref = borrow_global_mut<Marketplace<C>>(marketplace_address);
        let open_markets = &mut marketplace_ref.available_markets;
        vector::remove_value(open_markets, &market_address);
        marketplace_ref.all_time_volume = marketplace_ref.all_time_volume + (volume as u256);
    }

    public(friend) fun latest_price<C>(marketplace_address: address): u128 acquires Marketplace {
        let switchboard_feed = &mut borrow_global_mut<Marketplace<C>>(marketplace_address).switchboard_feed;
        let latest_value = aggregator::latest_value(*switchboard_feed);
        let (value, _, _) = math::unpack(latest_value);
        value
    }

    public entry fun create_marketplace<C>(account: &signer, feed: address) acquires MarketplaceList {
        let account_address = signer::address_of(account);
        let marketplace_address = marketplace_address<C>(account_address);

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
                available_markets: vector::empty<address>(),
                switchboard_feed: feed,
                all_time_volume: 0,
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
            account_address
        );


        if (!exists<MarketplaceList>(account_address)) {
            move_to(account, MarketplaceList {
                marketplaces: simple_map::new<address, String>()
            });
        };
        let marketplaces = &mut borrow_global_mut<MarketplaceList>(account_address).marketplaces;
        simple_map::add(marketplaces, object::object_address(&marketplace_object), utils::key<C>());
    }

    public entry fun payout_marketplace<C>(
        account: &signer,
        marketplace: Object<Marketplace<C>>,
        recipient: address
    ) acquires ObjectController {
        let owner_addr = object::owner(marketplace);
        let account_addr = signer::address_of(account);
        assert!(account_addr == owner_addr, E_UNAUTHORIZED); // ensure only owner can create markets

        let marketplace_addr = object::object_address(&marketplace);
        let marketplace_extend_ref = &borrow_global<ObjectController>(marketplace_addr).extend_ref;
        let marketplace_signer = object::generate_signer_for_extending(marketplace_extend_ref);

        let balance = coin::balance<AptosCoin>(marketplace_addr);
        coin::transfer<AptosCoin>(&marketplace_signer, recipient, balance);
    }
}
