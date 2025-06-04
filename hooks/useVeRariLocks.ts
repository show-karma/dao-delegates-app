import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from 'contexts';
import { formatEther } from 'viem';

// GraphQL query to fetch user data, stakes, and delegates
const RARI_USER_DATA_QUERY = gql`
  query RariUserData($account: String!) {
    users(where: { address: $account }) {
      id
      address
      lockedAmount
      delegates
      receivedDelegations
    }
    delegates(where: { account: $account }) {
      id
      lockId
      account
      delegate
      time
    }
    stakes(where: { account: $account }) {
      id
      status
      amount
      slopePeriod
      cliff
      time
    }
  }
`;

// Type definitions for the API response
interface RawUser {
  id: string;
  address: string;
  lockedAmount: string;
  delegates: string[];
  receivedDelegations: string[];
}

interface RawDelegate {
  id: string;
  lockId: string;
  account: string;
  delegate: string;
  time: string;
}

interface RawStake {
  id: string;
  status: string;
  amount: string;
  slopePeriod: string;
  cliff: string;
  time: string;
}

interface RariUserDataResponse {
  users: RawUser[];
  delegates: RawDelegate[];
  stakes: RawStake[];
}

// Transformed lock interface to match the expected format
export interface VeRariLock {
  id: string;
  hexId: string;
  amount: string; // Raw amount in wei
  formattedAmount: string; // Formatted amount for display
  veRariAmount: string; // Calculated veRARI amount
  currentDelegate: string;
  cliff: number; // in weeks
  slopePeriod: number; // in weeks
  lockTime: Date;
  status: string;
  delegationTime?: number; // When it was delegated
}

// Apollo client for the Rari Foundation subgraph
const createRariFoundationClient = () =>
  new ApolloClient({
    uri: 'https://gateway.thegraph.com/api/68547d6cffb193972c2dd3e28adeb4ba/subgraphs/id/2ZzskKNrzNaXF3dyLKGc8SSV9oSKZooNctxxvuLrRsLv',
    cache: new InMemoryCache(),
  });

// Function to calculate veRARI amount based on lock parameters
const calculateVeRariAmount = (
  amount: string,
  cliff: number,
  slopePeriod: number
): string => {
  try {
    const amountBN = BigInt(amount);
    const cliffWeeks = BigInt(cliff);
    const slopeWeeks = BigInt(slopePeriod);

    // veRARI calculation: amount * (cliff + slopePeriod) / maxTime
    // For simplicity, assuming maxTime is 2 years (104 weeks)
    const maxTimeWeeks = BigInt(104);
    const totalLockWeeks = cliffWeeks + slopeWeeks;

    // Calculate veRARI: (amount * totalLockWeeks) / maxTimeWeeks
    const veRariAmount = (amountBN * totalLockWeeks) / maxTimeWeeks;

    return formatEther(veRariAmount);
  } catch (error) {
    console.error('Error calculating veRARI amount:', error);
    return '0';
  }
};

// Convert hex stake ID to decimal for matching with delegate lockId
const hexToDecimal = (hexId: string): string => {
  try {
    // Remove 0x prefix if present
    const cleanHex = hexId.startsWith('0x') ? hexId.slice(2) : hexId;
    // Convert hex to decimal
    const decimal = parseInt(cleanHex, 16);
    return decimal.toString();
  } catch (error) {
    console.error('Error converting hex to decimal:', error);
    return hexId;
  }
};

// Find the current delegate for a stake
const findCurrentDelegate = (
  stakeId: string,
  delegates: RawDelegate[]
): { delegate: string; time?: number } => {
  // Convert stake hex ID to decimal for comparison with delegate lockId
  const decimalStakeId = hexToDecimal(stakeId);

  // Find delegation entries for this stake/lock
  const stakeDelegations = delegates.filter(d => d.lockId === decimalStakeId);

  if (stakeDelegations.length === 0) {
    // No delegation found, assume self-delegated (user's own address)
    return { delegate: '', time: undefined };
  }

  // Get the most recent delegation (highest time)
  const latestDelegation = stakeDelegations.reduce((latest, current) => {
    const currentTime = parseInt(current.time, 10);
    const latestTime = parseInt(latest.time, 10);
    return currentTime > latestTime ? current : latest;
  });

  return {
    delegate: latestDelegation.delegate,
    time: parseInt(latestDelegation.time, 10),
  };
};

// Transform raw stake data to VeRariLock format
const transformStakeToLock = (
  rawStake: RawStake,
  delegates: RawDelegate[]
): VeRariLock => {
  const cliff = parseInt(rawStake.cliff, 10);
  const slopePeriod = parseInt(rawStake.slopePeriod, 10);
  const lockTime = parseInt(rawStake.time, 10);

  // Find current delegate for this stake
  const { delegate: currentDelegate, time: delegationTime } =
    findCurrentDelegate(rawStake.id, delegates);

  // Convert hex ID to decimal for display
  const decimalId = hexToDecimal(rawStake.id);

  return {
    id: decimalId, // Use decimal ID for display and delegation
    hexId: rawStake.id, // Keep original hex ID for reference
    amount: rawStake.amount,
    formattedAmount: formatEther(BigInt(rawStake.amount)),
    veRariAmount: calculateVeRariAmount(rawStake.amount, cliff, slopePeriod),
    currentDelegate,
    cliff,
    slopePeriod,
    lockTime: new Date(lockTime * 1000), // Keep for reference but won't use for expiry
    status: rawStake.status,
    delegationTime,
  };
};

// Fetch user data from the Rari Foundation subgraph
async function fetchVeRariLocks(account: string): Promise<VeRariLock[]> {
  if (!account) return [];

  try {
    const client = createRariFoundationClient();
    const { data } = await client.query<RariUserDataResponse>({
      query: RARI_USER_DATA_QUERY,
      variables: {
        account: account.toLowerCase(),
      },
      fetchPolicy: 'cache-first',
    });

    if (!data?.stakes || !Array.isArray(data.stakes)) {
      return [];
    }

    // Transform stakes to locks, combining with delegation data
    const locks = data.stakes
      .filter(stake => stake.status === 'created') // Only show active stakes
      .map(stake => transformStakeToLock(stake, data.delegates || []));

    return locks;
  } catch (error) {
    console.error('Error fetching veRARI locks:', error);
    throw error;
  }
}

/**
 * Hook to fetch veRARI locks for the connected wallet
 * @returns Query result with locks data, loading state, and error
 */
export const useVeRariLocks = () => {
  const { address } = useWallet();

  return useQuery({
    queryKey: ['veRariLocks', address],
    queryFn: () => fetchVeRariLocks(address?.toLowerCase() || ''),
    enabled: !!address,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      // Retry up to 3 times, but not for GraphQL errors
      if (failureCount >= 3) return false;
      return true;
    },
  });
};
