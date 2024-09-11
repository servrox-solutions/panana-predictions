module switchboard::serialization {
    use switchboard::math::{Self, SwitchboardDecimal};
    use std::vector;
    use aptos_std::ed25519::{Self, Signature, UnvalidatedPublicKey};
    use aptos_std::from_bcs;    

    public fun validate(
        update_msg: vector<u8>, 
        signature: Signature, 
        public_key: UnvalidatedPublicKey
    ) {

        // validate signature
        assert!(ed25519::signature_verify_strict(
            &signature,
            &public_key,
            update_msg
        ), 0);
    }

    public fun read_update(attestation: &mut vector<u8>): (
        SwitchboardDecimal,    // value
        SwitchboardDecimal,    // min value
        SwitchboardDecimal,    // max value
        u64,                   // timestamp seconds
        address,               // aggregator address
        vector<u8>,            // jobs checksum
        address,               // oracle address
        vector<u8>,            // oracle public key (ed25519)
        Signature,             // message signature (ed25519)
        vector<u8>             // message
    ) {

        // extract last 64 bytes and create signature from them
        let signature_bytes = peel_from_vec_mut(attestation, 64);
        vector::reverse(&mut signature_bytes);
        let signature = ed25519::new_signature_from_bytes(signature_bytes);

        // get public key
        let oracle_public_key = peel_from_vec(attestation, 32);

        // grab raw message now that we've removed the signature
        let message_raw = *attestation;

        // extract data from attestation
        vector::reverse(attestation); // read in reverse

        // extract all the values
        let value = deserialize_switchboard_decimal(attestation);
        let min_value = deserialize_switchboard_decimal(attestation);
        let max_value = deserialize_switchboard_decimal(attestation);
        let timestamp_seconds = deserialize_u64(attestation);
        let aggregator_address = deserialize_address(attestation);
        let jobs_checksum = peel_from_vec_mut(attestation, 33);
        let oracle_address = deserialize_address(attestation);
        (
            value,
            min_value,
            max_value,
            timestamp_seconds,
            aggregator_address,
            jobs_checksum,
            oracle_address,
            oracle_public_key,
            signature,
            message_raw
        )
    }

    // slice fo the last <length> bytes, mutates array (cuts off last <length> bytes)
    fun peel_from_vec_mut(attestation: &mut vector<u8>, length: u64): vector<u8> {
        let data = vector::empty<u8>();
        let i = 0;
        while (i < length) {
            vector::push_back(&mut data, vector::pop_back(attestation));
            i = i + 1;
        };
        data
    }

    fun peel_from_vec(attestation: &vector<u8>, length: u64): vector<u8> {
        let data = vector::empty<u8>();
        let size = vector::length<u8>(attestation);
        let i = size - length;
        while (i < size) {
            vector::push_back(&mut data, *vector::borrow(attestation, i));
            i = i + 1;

        };
        data
    }

    fun deserialize_address(attestation_reversed: &mut vector<u8>): address {
        let value = peel_from_vec_mut(attestation_reversed, 32);
        from_bcs::to_address(value)
    }

    fun deserialize_bool(attestation_reversed: &mut vector<u8>): bool {
        vector::pop_back(attestation_reversed) == 1
    }

    fun deserialize_u8(attestation_reversed: &mut vector<u8>): u8 {
        vector::pop_back(attestation_reversed)
    }

    fun deserialize_u64(attestation_reversed: &mut vector<u8>): u64 {
        let i = 0;
        let value = 0;
        while (i < 8) {
            i = i + 1;
            let back = vector::pop_back(attestation_reversed);
            value = (value << 8) + (back as u64);
        };
        value
    }

    fun deserialize_u128(attestation_reversed: &mut vector<u8>): u128 {
        let i = 0;
        let value = 0;
        while (i < 16) {
            let back = vector::pop_back(attestation_reversed);
            value = (value << 8) + (back as u128);
            i = i + 1;
        };
        value
    }

    fun deserialize_switchboard_decimal(attestation_reversed: &mut vector<u8>): SwitchboardDecimal {
        let value = deserialize_u128(attestation_reversed);
        let dec = deserialize_u8(attestation_reversed);
        let neg = deserialize_bool(attestation_reversed);
        math::new(value, dec, neg)
    }

    #[test]
    fun test_deserialization_with_real_data() {
        let vec = x"000000000000000000000000000000640000000000000000000000000000000000010000000000000000000000000000000003e800000000000000000001b27f7bbf7caf2368b08032d005e8beab151a885054cdca55c4cc644f0a308d2b20b498003d9e279aab4029ffc50a772d354ee0dc0435708b3c740884dd69f43c6fb27f7bbf7caf2368b08032d005e8beab151a885054cdca55c4cc644f0a308d2b2037ebd603be33007ab8b92b4edbb803a6d815901d1b1b903f50c90c1306d0c0c15f9979b3ede960816af0dcbecf010de6f1bb4023abd16e596e3b4ab2685ebd481036e04ced0015ce7d112792c6c284b7389624ca49036462a075ff8bed2fbe06";
        let (
            value,             // SwitchboardDecimal
            min_value,         // SwitchboardDecimal
            max_value,         // SwitchboardDecimal
            timestamp_seconds, // u64,
            aggregator_addr,   // aggregator address
            jobs_checksum,
            oracle_addr,       // oracle address
            oracle_public_key,  // oracle public_key
            signature,          // message signature
            message,            // message
        ) = read_update(&mut vec);

        // get public key
        let public_key = ed25519::new_unvalidated_public_key_from_bytes(oracle_public_key);

        // verify signature
        assert!(ed25519::signature_verify_strict(
            &signature,
            &public_key,
            message
        ), 0);

        assert!(value == math::new(100, 0, false), 0);
        assert!(min_value == math::new(1, 0, false), 0);
        assert!(max_value == math::new(1000, 0, false), 0);
        assert!(timestamp_seconds == 1, 0);
        std::debug::print(&aggregator_addr);
        std::debug::print(&jobs_checksum);
        assert!(aggregator_addr == @0xb27f7bbf7caf2368b08032d005e8beab151a885054cdca55c4cc644f0a308d2b, 0);
        std::debug::print(&oracle_addr);
        assert!(oracle_addr == @0xb27f7bbf7caf2368b08032d005e8beab151a885054cdca55c4cc644f0a308d2b, 0);
        assert!(oracle_public_key == x"37ebd603be33007ab8b92b4edbb803a6d815901d1b1b903f50c90c1306d0c0c1", 0);
        assert!(jobs_checksum == x"20b498003d9e279aab4029ffc50a772d354ee0dc0435708b3c740884dd69f43c6f", 0)
    }

    #[test]
    fun test_deserialize_sb_decimal() {

        let value = math::new(2, 9, false);
        let vec = vector::empty<u8>();
        vector::append(&mut vec, x"00000000000000000000000000000002"); // not neg
        vector::push_back(&mut vec, 9); // not dec
        vector::push_back(&mut vec, 0); // not neg
        vector::reverse(&mut vec);
        let sb_decimal = deserialize_switchboard_decimal(&mut vec);
        assert!(value == sb_decimal, 0)
    }

    #[test]
    fun test_deserialize_u8() {
        let att = x"25";
        vector::reverse(&mut att);
        let dec = vector::pop_back(&mut att);
        assert!(dec == 0x25, 0);
    }

    #[test]
    fun test_deserialize_bool() {
        let vec = x"01";
        let b = deserialize_bool(&mut vec);
        assert!(b == true, 0);
    }

    #[test]
    fun test_deserialize_u64() {
        let ts = x"0000000000000001";
        vector::reverse(&mut ts);
        let sf = deserialize_u64(&mut ts);
        assert!(sf == 0x0000000000000001, 0);
    }

    #[test]
    fun test_deserialize_u128() {
        let val = x"00000000000000000000000000000001";
        vector::reverse(&mut val);
        let u = deserialize_u128(&mut val);
        assert!(u == 00000000000000000000000000000001, 0);
    }

    #[test]
    fun test_deserialize_address() {
        let val = x"0000000000000000000000000000000000000000000000000000000000000055";
        vector::reverse(&mut val);
        let u = deserialize_address(&mut val);
        assert!(u == @0x55, 0);
    }

    #[test]
    fun test_deserialize_checksum() {
        let val = x"b498003d9e279aab4029ffc50a772d354ee0dc0435708b3c740884dd69f43c6f";
        let len = vector::length(&val);
        std::debug::print(&len);
    }

    // DEPRECATED - missing checksum
    public fun deserialize_update(_attestation: &mut vector<u8>): (
        SwitchboardDecimal,    // value
        SwitchboardDecimal,    // min value
        SwitchboardDecimal,    // max value
        u64,                   // timestamp seconds
        address,               // aggregator address
        vector<u8>,            // other key
        address,               // oracle address
        vector<u8>,            // oracle public key (ed25519)
        Signature,             // message signature (ed25519)
        vector<u8>             // message
    ) {
        (
            math::zero(),
            math::zero(),
            math::zero(),
            0,
            @0x0,
            vector::empty<u8>(),
            @0x0,
            vector::empty<u8>(),
            ed25519::new_signature_from_bytes(x"01"),
            vector::empty<u8>(),
        )
    }
}