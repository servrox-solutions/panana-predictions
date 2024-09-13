module panana::marketplace {

    use std::signer;
    use aptos_std::coin;
    use std::vector;
    use std::object::{ObjectCore, Self};
    use aptos_framework::object::{Object};
    use aptos_framework::aptos_coin::AptosCoin;
    use panana::utils;

    friend panana::market;
    #[test_only]
    friend panana::market_test;
    #[test_only]
    friend panana::marketplace_test;

    const E_MARKETPLACE_ALREADY_EXISTS: u64 = 0; // Error when the marketplace already exists
    const E_UNAUTHORIZED: u64 = 1; // Error when the user is not authorized to perform an action

    struct Marketplace<phantom C> has key {
        available_markets: vector<address> // contains all addresses of running and open markets
    }

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    struct ObjectController has key {
        extend_ref: object::ExtendRef,
    }

    #[view]
    public fun available_markets<C>(marketplace_address: address): vector<address> acquires Marketplace {
        borrow_global<Marketplace<C>>(marketplace_address).available_markets
    }

    #[view]
    public fun marketplace_address<C>(account: address): address {
        object::create_object_address(&account, utils::type_of<Marketplace<C>>())
    }

    public(friend) fun add_open_market<C>(marketplace_address: address, market_addres: address) acquires Marketplace {
        let open_markets = &mut borrow_global_mut<Marketplace<C>>(marketplace_address).available_markets;
        // TODO: check that every market exists only once and cannot be added multiple times
        vector::push_back(open_markets, market_addres);
    }

    public(friend) fun remove_open_market<C>(marketplace_address: address, market_address: address) acquires Marketplace {
        let open_markets = &mut borrow_global_mut<Marketplace<C>>(marketplace_address).available_markets;
        vector::remove_value(open_markets, &market_address);
    }

    public entry fun create_marketplace<C>(account: &signer) {
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
                available_markets: vector::empty<address>()
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
}
