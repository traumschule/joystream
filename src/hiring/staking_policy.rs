use codec::{Decode, Encode};

#[cfg(feature = "std")]
use serde::{Deserialize, Serialize};


/// Constraints around staking amount
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[derive(Encode, Decode, Debug, Eq, PartialEq, Clone)]
pub enum StakingAmountLimitMode {
	AtLeast,
	Exact,
}

/// Policy for staking
#[cfg_attr(feature = "std", derive(Serialize, Deserialize))]
#[derive(Encode, Decode, Debug, Eq, PartialEq, Clone)]
pub struct StakingPolicy<Balance, BlockNumber> {
	// Staking amount
	pub amount: Balance,

	// How to interpret the amount requirement
	pub amount_mode: StakingAmountLimitMode,

	// The unstaking period length, if any, deactivation causes that are autonomous,
	// that is they are triggered internally to this module.
	pub crowded_out_unstaking_period_length: Option<BlockNumber>,
	pub review_period_expired_unstaking_period_length: Option<BlockNumber>,
}

impl<Balance: PartialOrd + Clone, BlockNumber> StakingPolicy<Balance, BlockNumber> {
	pub fn accepts_amount(&self, test_amount: &Balance) -> bool {
		match self.amount_mode {
			StakingAmountLimitMode::AtLeast => *test_amount >= self.amount,
			StakingAmountLimitMode::Exact => *test_amount == self.amount,
		}
	}
}
