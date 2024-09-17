export const ABI = {"address":"0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac","name":"market","friends":[],"exposed_functions":[{"name":"can_resolve_market","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[{"constraints":[]}],"params":["&0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Market<T0>"],"return":["bool"]},{"name":"create_market","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[{"constraints":[]}],"params":["&signer","0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::marketplace::Marketplace<T0>>","u64","u64","u64","0x1::option::Option<bool>","u64","u64","u64","u64"],"return":[]},{"name":"creator","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["address"]},{"name":"down_bet","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address","address"],"return":["0x1::option::Option<u64>"]},{"name":"down_bets","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"down_bets_sum","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"earliest_market_opening_after_sec","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":[],"return":["u64"]},{"name":"end_time","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"fee","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64","u64"]},{"name":"get_down_votes_sum","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"get_up_votes_sum","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"get_vote","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address","address"],"return":["0x1::option::Option<bool>"]},{"name":"max_resolve_market_timespan","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":[],"return":["u64"]},{"name":"min_bet","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"min_open_duration","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":[],"return":["u64"]},{"name":"place_bet","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[{"constraints":[]}],"params":["&signer","0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Market<T0>>","bool","u64"],"return":[]},{"name":"resolve_market","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[{"constraints":[]}],"params":["0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Market<T0>>"],"return":[]},{"name":"start_market","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[{"constraints":[]}],"params":["&signer","0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Market<T0>>"],"return":[]},{"name":"start_price","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["0x1::option::Option<u64>"]},{"name":"start_time","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"up_bet","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address","address"],"return":["0x1::option::Option<u64>"]},{"name":"up_bets","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"up_bets_sum","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[{"constraints":[]}],"params":["address"],"return":["u64"]},{"name":"vote","visibility":"public","is_entry":true,"is_view":false,"generic_type_params":[{"constraints":[]}],"params":["&signer","0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Market<T0>>","bool"],"return":[]}],"structs":[{"name":"CreateMarket","is_native":false,"abilities":["drop","store"],"generic_type_params":[{"constraints":[]}],"fields":[{"name":"marketplace","type":"0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::marketplace::Marketplace<T0>>"},{"name":"market","type":"0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Market<T0>>"},{"name":"start_time_timestamp","type":"u64"},{"name":"end_time_timestamp","type":"u64"}]},{"name":"Market","is_native":false,"abilities":["store","key"],"generic_type_params":[{"constraints":[]}],"fields":[{"name":"creator","type":"address"},{"name":"start_price","type":"0x1::option::Option<u64>"},{"name":"end_price","type":"0x1::option::Option<u64>"},{"name":"start_time","type":"u64"},{"name":"end_time","type":"u64"},{"name":"min_bet","type":"u64"},{"name":"up_bets_sum","type":"u64"},{"name":"down_bets_sum","type":"u64"},{"name":"fee","type":"0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Percentage"},{"name":"price_up","type":"0x1::option::Option<bool>"},{"name":"price_delta","type":"0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Percentage"},{"name":"up_bets","type":"0x1::simple_map::SimpleMap<address, u64>"},{"name":"down_bets","type":"0x1::simple_map::SimpleMap<address, u64>"},{"name":"resolved_at","type":"0x1::option::Option<u64>"},{"name":"user_votes","type":"0x1::simple_map::SimpleMap<address, bool>"},{"name":"up_votes_sum","type":"u64"},{"name":"down_votes_sum","type":"u64"}]},{"name":"ObjectController","is_native":false,"abilities":["key"],"generic_type_params":[],"fields":[{"name":"extend_ref","type":"0x1::object::ExtendRef"}]},{"name":"Percentage","is_native":false,"abilities":["drop","store"],"generic_type_params":[],"fields":[{"name":"numerator","type":"u64"},{"name":"denominator","type":"u64"}]},{"name":"ResolveMarket","is_native":false,"abilities":["drop","store"],"generic_type_params":[{"constraints":[]}],"fields":[{"name":"marketplace","type":"0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::marketplace::Marketplace<T0>>"},{"name":"market","type":"0x1::object::Object<0x91a6fb305a62b3cc1a8859b4336965dc22458a8c5f94064d2ea8c9d12584d3ac::market::Market<T0>>"},{"name":"start_time_timestamp","type":"u64"},{"name":"end_time_timestamp","type":"u64"},{"name":"market_cap","type":"u64"},{"name":"dissolved","type":"bool"}]}]} as const
