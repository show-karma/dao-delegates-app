// RARI Mainnet Contract Addresses
export const RARI_MAINNET_CONTRACTS = {
  RARI_TOKEN: '0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF',
  VE_RARI_TOKEN: '0x096Bd9a7a2e703670088C05035e23c7a9F428496',
} as const;

// RARI operates on Ethereum Mainnet
export const RARI_TARGET_CHAIN_ID = 1; // Ethereum Mainnet

// Week in seconds (as used by the veRARI contract)
export const WEEK_IN_SECONDS = 604800;

// Timeframe options for locking RARI (in weeks)
export const RARI_LOCK_TIMEFRAMES = {
  '1 month': 4,
  '3 months': 12,
  '6 months': 24,
  '1 year': 48,
  '2 years': 96,
} as const;

// Type for timeframe keys
export type RariLockTimeframe = keyof typeof RARI_LOCK_TIMEFRAMES;

// Helper function to convert weeks to seconds for contract calls
export const weeksToSeconds = (weeks: number): number =>
  weeks * WEEK_IN_SECONDS;

// Helper function to get timeframe in seconds from timeframe key
export const getTimeframeInSeconds = (timeframe: RariLockTimeframe): number => {
  const weeks = RARI_LOCK_TIMEFRAMES[timeframe];
  return weeksToSeconds(weeks);
};

// Minimum periods as per RRC-1 specification
export const RARI_LOCK_MINIMUMS = {
  CLIFF_MIN_WEEKS: 3,
  SLOPE_MIN_WEEKS: 1,
} as const;
