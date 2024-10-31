import { aptos } from "./aptos";
import { getLogger } from "./logger";

export interface PlainTransaction {
  version: string;
  hash: string;
  state_change_hash: string;
  event_root_hash: string;
  state_checkpoint_hash: any;
  gas_used: string;
  success: boolean;
  vm_status: string;
  accumulator_root_hash: string;
  changes: Change[];
  sender: string;
  sequence_number: string;
  max_gas_amount: string;
  gas_unit_price: string;
  expiration_timestamp_secs: string;
  payload: Payload;
  signature: Signature;
  events: Event[];
  timestamp: string;
  type: string;
}

export interface Change {
  address?: string;
  state_key_hash: string;
  data?: Data;
  type: string;
  handle?: string;
  key?: string;
  value?: string;
}

export interface Data {
  type: string;
  data: Data2;
}

export interface Data2 {
  coin?: Coin;
  deposit_events?: DepositEvents;
  frozen?: boolean;
  withdraw_events?: WithdrawEvents;
  authentication_key?: string;
  coin_register_events?: CoinRegisterEvents;
  guid_creation_num?: string;
  key_rotation_events?: KeyRotationEvents;
  rotation_capability_offer?: RotationCapabilityOffer;
  sequence_number?: string;
  signer_capability_offer?: SignerCapabilityOffer;
}

export interface Coin {
  value: string;
}

export interface DepositEvents {
  counter: string;
  guid: Guid;
}

export interface Guid {
  id: Id;
}

export interface Id {
  addr: string;
  creation_num: string;
}

export interface WithdrawEvents {
  counter: string;
  guid: Guid2;
}

export interface Guid2 {
  id: Id2;
}

export interface Id2 {
  addr: string;
  creation_num: string;
}

export interface CoinRegisterEvents {
  counter: string;
  guid: Guid3;
}

export interface Guid3 {
  id: Id3;
}

export interface Id3 {
  addr: string;
  creation_num: string;
}

export interface KeyRotationEvents {
  counter: string;
  guid: Guid4;
}

export interface Guid4 {
  id: Id4;
}

export interface Id4 {
  addr: string;
  creation_num: string;
}

export interface RotationCapabilityOffer {
  for: For;
}

export interface For {
  vec: any[];
}

export interface SignerCapabilityOffer {
  for: For2;
}

export interface For2 {
  vec: any[];
}

export interface Payload {
  function: string;
  type_arguments: string[];
  arguments: Argument[];
  type: string;
}

export interface Argument {
  inner: string;
}

export interface Signature {
  public_key: string;
  signature: string;
  type: string;
}

export interface Event {
  guid: Guid5;
  sequence_number: string;
  type: string;
  data: Data3;
}

export interface Guid5 {
  creation_number: string;
  account_address: string;
}

export interface Data3 {
  execution_gas_units: string;
  io_gas_units: string;
  storage_fee_octas: string;
  storage_fee_refund_octas: string;
  total_charge_gas_units: string;
}

export const getUnlimitedAccountTransactions = async (
  accountAddress: string,
  fromOffset: number,
  amount: number
): Promise<PlainTransaction[]> => {
  const logger = getLogger();
  const maxLimit = 25; // This restriction comes from the official API

  const promises = new Array(Math.ceil(amount / maxLimit))
    .fill(0)
    .map((_, idx) => {
      return (
        aptos.getAccountTransactions({
          accountAddress,
          options: {
            offset: fromOffset + idx * maxLimit,
            limit:
              amount - idx * maxLimit >= maxLimit
                ? maxLimit
                : amount % maxLimit,
          },
        }) as Promise<PlainTransaction[]>
      ).catch((error) => {
        logger.error(error);
        throw error;
      });
    });

  return (await Promise.all(promises)).flat();
};

export const getTotalTransactionCount = (accountAddress: string) => {
  const logger = getLogger();
  return aptos
    .getAccountTransactionsCount({ accountAddress })
    .catch((error) => {
      logger.error(error);
      throw error;
    });
};

export const getLatestNAccountTransactions = async (
  accountAddress: string,
  maxTransactions: number,
  accountTransactionNumber?: number
): Promise<PlainTransaction[]> => {
  if (!accountTransactionNumber) {
    accountTransactionNumber = await getTotalTransactionCount(accountAddress);
  }

  const fromOffset = accountTransactionNumber - maxTransactions;
  return await getUnlimitedAccountTransactions(
    accountAddress,
    fromOffset >= 0 ? fromOffset : 0,
    maxTransactions
  );
};
