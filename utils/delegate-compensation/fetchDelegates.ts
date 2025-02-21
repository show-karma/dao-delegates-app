import { api } from 'helpers';
import { DelegateCompensationStats, DelegateStatsFromAPI } from 'types';
import { formatSimpleNumber } from 'utils/formatNumber';

export const fetchDelegates = async (
  daoId: string,
  onlyOptIn: boolean,
  month: number,
  year: number,
  version?: string
): Promise<DelegateCompensationStats[]> => {
  try {
    if (!daoId || !month || !year) {
      console.error('Missing required parameters:', { daoId, month, year });
      return [];
    }

    const response = await api.get(
      `/delegate/${daoId}/incentive-programs-stats`,
      {
        params: {
          incentiveOptedIn: onlyOptIn || undefined,
          month,
          year,
          version,
        },
      }
    );

    if (!response?.data?.data?.delegates) {
      console.error('Invalid response format:', response);
      return [];
    }

    const responseDelegates = response.data.data.delegates;

    if (!Array.isArray(responseDelegates) || responseDelegates.length === 0) {
      return [];
    }

    const orderDelegates = responseDelegates.sort(
      (itemA: DelegateStatsFromAPI, itemB: DelegateStatsFromAPI) =>
        +itemB.stats.totalParticipation - +itemA.stats.totalParticipation
    );

    const parsedDelegates: DelegateCompensationStats[] = orderDelegates
      .map((delegate: DelegateStatsFromAPI, index: number) => {
        try {
          const snapshotVoting = {
            rn: formatSimpleNumber(delegate.stats.snapshotVoting.rn.toString()),
            tn: formatSimpleNumber(delegate.stats.snapshotVoting.tn.toString()),
            score: formatSimpleNumber(
              delegate.stats.snapshotVoting.score.toString()
            ),
          };
          const onChainVoting = {
            rn: formatSimpleNumber(delegate.stats.onChainVoting.rn.toString()),
            tn: formatSimpleNumber(delegate.stats.onChainVoting.tn.toString()),
            score: formatSimpleNumber(
              delegate.stats.onChainVoting.score.toString()
            ),
          };
          const communicatingRationale = {
            rn: formatSimpleNumber(
              delegate.stats.communicatingRationale.rn.toString()
            ),
            tn: formatSimpleNumber(
              delegate.stats.communicatingRationale.tn.toString()
            ),
            score: formatSimpleNumber(
              delegate.stats.communicatingRationale.score.toString()
            ),
            breakdown: delegate.stats.communicatingRationale.breakdown,
          };

          const commentingProposal = {
            rn: formatSimpleNumber(
              delegate.stats.commentingProposal.rn.toString()
            ),
            tn: formatSimpleNumber(
              delegate.stats.commentingProposal.tn.toString()
            ),
            score: formatSimpleNumber(
              delegate.stats.commentingProposal.score.toString()
            ),
          };

          const delegateFeedback = {
            score: formatSimpleNumber(
              delegate.stats?.delegateFeedback?.finalScore?.toString() || '0'
            ),
          };

          return {
            id: delegate.id,
            delegate: {
              publicAddress: delegate.publicAddress as `0x${string}`,
              name: delegate.name,
              profilePicture: delegate.profilePicture,
              shouldUse:
                delegate.name || delegate.ensName || delegate.publicAddress,
            },
            incentiveOptedIn: delegate.incentiveOptedIn,
            delegateImage: delegate.profilePicture,
            ranking: index + 1 <= 50 ? index + 1 : null,
            participationRatePercent: +delegate.stats.participationRatePercent,
            fundsARB: 5000,
            votingPower: +delegate.votingPower,
            votingPowerAverage: delegate.stats.votingPowerAverage
              ? +delegate.stats.votingPowerAverage
              : undefined,
            participationRate: delegate.stats.participationRate,
            snapshotVoting,
            onChainVoting,
            communicatingRationale,
            commentingProposal,
            delegateFeedback,
            totalParticipation: delegate.stats.totalParticipation,
            payment: formatSimpleNumber(delegate.stats.payment),
            bonusPoint: delegate.stats.bonusPoint.toString(),
            stats: delegate.stats,
            version,
          } as DelegateCompensationStats;
        } catch (error) {
          console.error('Error parsing delegate:', delegate, error);
          return null;
        }
      })
      .filter(Boolean) as DelegateCompensationStats[];

    return parsedDelegates;
  } catch (error) {
    console.error('Error fetching delegates:', error);
    return [];
  }
};
