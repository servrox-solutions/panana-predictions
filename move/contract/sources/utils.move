module panana::utils {
    use aptos_framework::type_info;
    use std::string::String;

    public fun key<C>(): String {
        type_info::type_name<C>()
    }

    // use this function for unique representation of type as vec<u8>
    // e.g. vector<vector<0x1::type_info::TypeInfo>>
    public fun type_of<C>(): vector<u8> {
        type_info::struct_name(&type_info::type_of<C>())
    }
}