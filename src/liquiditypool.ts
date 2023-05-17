import { StakeTotal, Stake as StakeEntity, Tier } from "../generated/schema";
import { Stake, Unstake } from "../generated/LiquidityPoolV0/LiquidityPoolV0";
import {
  Address,
  BigInt,
  BigDecimal,
  Bytes,
  dataSource,
  ethereum,
  log
} from "@graphprotocol/graph-ts";

/// @dev Emits when `stake` method has been called
/// @param staker Staker address
/// @param tier Staker's tier
/// @param honAmount Staked Hon token amount
/// @param hroId Staked Hro token's id
/// @param lpAmount Issued Worker token amount
//event Stake(address staker, uint256 tier, uint256 honAmount, uint256 hroId, uint256 lpAmount);
export function handleStake(event: Stake): void {
  const staker: Address = event.params.staker;
  const hroId: BigInt = event.params.hroId;
  const honAmount: BigInt = event.params.honAmount;
  const lpAmount: BigInt = event.params.lpAmount;
  const tierId: BigInt = event.params.tier;

  const stake: StakeEntity = new StakeEntity(`${staker.toHexString()}-${hroId.toString()}}`);

  stake.user = staker;
  stake.hroId = hroId;
  stake.honAmount = honAmount;
  stake.lpAmount = lpAmount;
  stake.tierId = tierId;
  stake.stakeTimestamp = event.block.timestamp;
  stake.unstakeTimestamp = BigInt.zero();
  stake.isStaked = true;

  const stakeTotal: StakeTotal = getStakeTotal(staker);
  if (stakeTotal !== null) {
    stakeTotal.hroAmount = stakeTotal.hroAmount.plus(BigInt.fromU32(1));
    stakeTotal.honAmount = stakeTotal.honAmount.plus(event.params.honAmount);
    stakeTotal.lpAmount = stakeTotal.lpAmount.plus(event.params.lpAmount);
    stakeTotal.user = staker;
    stakeTotal.save();
  }

  let tier = Tier.load(tierId.toString());
  if (!tier) {
    tier = new Tier(tierId.toString());
    tier.tierId = tierId;
    tier.hroAmount = BigInt.zero();
  }
  tier.hroAmount = tier.hroAmount.plus(BigInt.fromU32(1));

  tier.save();
  stake.save();
}

/// @dev Emits when `unstake` method has been called
/// @param staker Staker address
/// @param hroId Id of the Hro token
/// @param fee Hon token fee
// event Unstake(address staker, uint256 hroId, uint256 fee);
export function handleUnstake(event: Unstake): void {
  const staker = event.params.staker;
  const hroId = event.params.hroId;

  const stake = getStakeEntity(staker, hroId.toString());
  const honAmount = stake.honAmount;
  const lpAmount = stake.lpAmount;

  stake.unstakeTimestamp = event.block.timestamp;
  stake.isStaked = false;

  const stakeTotal = getStakeTotal(staker);
  if (stakeTotal !== null) {
    stakeTotal.hroAmount = stakeTotal.hroAmount.minus(BigInt.fromU32(1));
    stakeTotal.honAmount = stakeTotal.honAmount.minus(honAmount);
    stakeTotal.lpAmount = stakeTotal.lpAmount.minus(lpAmount);
    stakeTotal.save();
  }

  let tier = Tier.load(stake.tierId.toString());
  if (!tier) {
    tier = new Tier(stake.tierId.toString());
    tier.tierId = stake.tierId;
    tier.hroAmount = BigInt.zero();
  } else {
    tier.hroAmount = tier.hroAmount.minus(BigInt.fromU32(1));
  }

  tier.save();
  stake.save();
}

export function getStakeEntity(user: Address, id: string): StakeEntity {
  let record = StakeEntity.load(`${user.toHexString()}-${id}}`);

  if (!record) {
    record = new StakeEntity("none");
    return record as StakeEntity;
  }

  if (record.user.equals(user)) {
    return record as StakeEntity;
  } else {
    record = new StakeEntity("none");
    return record as StakeEntity;
  }
}

export function getStakeTotal(id: Address): StakeTotal {
  let stakeTotal = StakeTotal.load(id.toHexString());

  if (stakeTotal === null) {
    stakeTotal = new StakeTotal(id.toHexString());
    stakeTotal.hroAmount = BigInt.fromU32(0);
    stakeTotal.honAmount = BigInt.fromU32(0);
    stakeTotal.lpAmount = BigInt.fromU32(0);
    stakeTotal.user = id;
    stakeTotal.save();
  }
  return stakeTotal;
}
