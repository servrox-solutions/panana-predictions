script {
    use std::signer;
    use aptos_framework::aptos_account;
    use aptos_framework::aptos_coin;
    use aptos_framework::coin;
 
    fun main(src: &signer, dest: address, desired_balance: u64) {
        let src_addr = signer::address_of(src);
 
        // addr::my_module::do_nothing();
 
        let balance = coin::balance<aptos_coin::AptosCoin>(src_addr);
        if (balance < desired_balance) {
            aptos_account::transfer(src, dest, desired_balance - balance);
        };
    }
}