import { useQuery } from '@tanstack/react-query';
import { api } from 'helpers';
import { useDAO } from 'contexts';

interface ParticipationItem {
  proposalId: string;
  title: string;
  votedAt: string | null;
  voted: boolean;
}

interface OracleBreakdownData {
  onChainData: {
    proposals: number;
    votes: number;
    votedPct: number;
    participation: ParticipationItem[];
  };
  offChainData: {
    proposals: number;
    votes: number;
    votedPct: number;
    participation: ParticipationItem[];
  };
  formula: string;
  formulaBreakdown: {
    formula: string;
    onChainVotes: string;
    offChainVotes: string;
    calculation: string;
    finalScore: number;
  };
}

interface OracleBreakdownResponse {
  responseTime: number;
  data: OracleBreakdownData;
}

export const useOracleBreakdown = (publicAddress: string) => {
  const { daoInfo } = useDAO();

  return useQuery({
    queryKey: ['oracle-breakdown', daoInfo.config.DAO_KARMA_ID, publicAddress],
    queryFn: async (): Promise<OracleBreakdownResponse> => {
      const response = await api.get(
        `/delegate/${daoInfo.config.DAO_KARMA_ID}/${publicAddress}/oracle-breakdown`
      );
      return response.data;
    },
    enabled: !!publicAddress && !!daoInfo.config.DAO_KARMA_ID,
    refetchOnWindowFocus: false,
  });
};
