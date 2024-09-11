module panana::math128 {
    public fun pow_10(e: u128): u128 {
        pow(10, e)
    }

    public fun pow(n: u128, e: u128): u128 {
        if (e == 0) { 1 }
        else if (e == 1) { n }
        else {
            let p = pow(n, e / 2);
            p = p * p;
            if (e % 2 == 1) {
                p = p * n;
                p
            }
            else { p }
        }
    }

    #[test]
    public entry fun test_pow() {
        let result = pow(10, 18);
        assert!(result == 1000000000000000000, 0);

        let result = pow(10, 1);
        assert!(result == 10, 0);

        let result = pow(10, 0);
        assert!(result == 1, 0);
    }
}
