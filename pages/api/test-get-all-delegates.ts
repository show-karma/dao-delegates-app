import { NextApiRequest, NextApiResponse } from 'next';
import {
  getAllDelegates,
  getAllDelegatesForAllDAOs,
} from '../../utils/delegate-compensation/getAllDelegates';
import { compensation } from '../../utils/compensation';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the DAO ID from the query parameters, default to 'arbitrum'
    const daoId = (req.query.daoId as string) || 'arbitrum';
    const mode = (req.query.mode as string) || 'single'; // 'single' or 'all'

    // Prepare the response data
    const responseData: any = {
      availableDAOs: compensation.daos,
      dateRanges: {},
    };

    // Add date ranges for each DAO
    compensation.daos.forEach(id => {
      const daoConfig = compensation.compensationDates[id];
      responseData.dateRanges[id] = daoConfig.versions.map(version => ({
        version: version.version,
        startDate: version.startDate.toISOString().split('T')[0],
        endDate: version.endDate
          ? version.endDate.toISOString().split('T')[0]
          : 'present',
      }));
    });

    // Fetch delegates based on the mode
    if (mode === 'all') {
      console.log('Fetching all unique delegates across all DAOs...');
      const allDelegates = await getAllDelegatesForAllDAOs();
      responseData.delegates = allDelegates;
      responseData.count = allDelegates.length;
      responseData.mode = 'all';
    } else {
      console.log(`Fetching all unique delegates for ${daoId}...`);
      const delegates = await getAllDelegates(daoId);
      responseData.delegates = delegates;
      responseData.count = delegates.length;
      responseData.mode = 'single';
      responseData.daoId = daoId;
    }

    // Return the response
    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in API handler:', error);
    res.status(500).json({
      error: 'Failed to fetch delegates',
      message: (error as Error).message,
    });
  }
}
