import { DelegateStatsFromAPI } from 'types';
import { compensation } from '../compensation';
import { getDelegateInfo } from './getDelegateInfo';

/**
 * Generates an array of month/year pairs between two dates
 * @param startDate The start date
 * @param endDate The end date (defaults to current date if not provided)
 * @returns Array of {month, year} objects representing each month in the range
 */
function getMonthsInRange(
  startDate: Date,
  endDate: Date = new Date()
): Array<{ month: string; year: string }> {
  const months: Array<{ month: string; year: string }> = [];
  const currentDate = new Date(startDate);

  // Set to first day of month to ensure we get full months
  currentDate.setDate(1);

  while (currentDate <= endDate) {
    // Month is 0-indexed in JS Date, so add 1 and pad with leading zero if needed
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = String(currentDate.getFullYear());

    months.push({ month, year });

    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
}

/**
 * Fetches delegate data for a specific month/year
 * @param daoId The DAO identifier (e.g., 'arbitrum', 'zksync')
 * @param month The month (01-12)
 * @param year The year (e.g., '2024')
 * @returns Array of delegate addresses
 */
async function fetchDelegatesForMonth(
  daoId: string,
  month: string,
  year: string
): Promise<string[]> {
  try {
    // Use the existing getDelegateInfo function to fetch delegate data
    const delegates: DelegateStatsFromAPI[] = await getDelegateInfo(
      daoId,
      month,
      year
    );

    // Extract and return delegate addresses
    return delegates
      .filter(delegate => !!delegate.publicAddress)
      .map(delegate => delegate.publicAddress);
  } catch (error) {
    console.error(
      `Error fetching delegates for ${daoId} - ${month}/${year}:`,
      error
    );
    return [];
  }
}

/**
 * Gets all unique delegate addresses for a specific DAO across all months
 * based on the compensation date range defined in compensation.ts
 *
 * @param daoId The DAO identifier (e.g., 'arbitrum', 'zksync')
 * @returns Promise resolving to an array of unique delegate addresses
 */
export async function getAllDelegates(daoId: string): Promise<string[]> {
  // Check if the DAO exists in our configuration
  if (!compensation.daos.includes(daoId)) {
    throw new Error(`DAO '${daoId}' not found in compensation configuration`);
  }

  const daoConfig = compensation.compensationDates[daoId];

  // Get the earliest start date from all versions
  const startDate = daoConfig.versions.reduce(
    (earliest, version) =>
      version.startDate < earliest ? version.startDate : earliest,
    daoConfig.versions[0].startDate
  );

  // Get the latest end date (or current date if not specified)
  const endDate = new Date();

  // Get all months between start and end dates
  const monthsToFetch = getMonthsInRange(startDate, endDate);

  // Fetch delegates for each month and flatten the results
  const delegateAddressesByMonth = await Promise.all(
    monthsToFetch.map(({ month, year }) =>
      fetchDelegatesForMonth(daoId, month, year)
    )
  );

  // Flatten the array and remove duplicates
  const uniqueDelegateAddresses = [...new Set(delegateAddressesByMonth.flat())];

  return uniqueDelegateAddresses;
}

/**
 * Gets all unique delegate addresses for all DAOs across all months
 * @returns Promise resolving to an array of unique delegate addresses
 */
export async function getAllDelegatesForAllDAOs(): Promise<string[]> {
  const delegatesByDAO = await Promise.all(
    compensation.daos.map(daoId =>
      getAllDelegates(daoId).catch(error => {
        console.error(`Error fetching delegates for DAO ${daoId}:`, error);
        return [];
      })
    )
  );

  // Flatten the array and remove duplicates
  const uniqueDelegateAddresses = [...new Set(delegatesByDAO.flat())];

  return uniqueDelegateAddresses;
}
