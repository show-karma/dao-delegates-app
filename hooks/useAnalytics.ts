import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IDaoStats } from 'types/analytics';

/**
 * Custom hook to fetch DAO analytics data
 *
 * @param daoName - The name of the DAO to fetch analytics for
 * @returns Query result containing the DAO analytics data
 */
export const useAnalytics = (daoName: string) =>
  useQuery<IDaoStats>(
    ['daoAnalytics', daoName],
    async () => {
      const { data } = await axios.get<IDaoStats>(
        `/api/dao/${daoName}/analytics`
      );
      return data;
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    }
  );
