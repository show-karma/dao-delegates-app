/* eslint-disable no-param-reassign */
import {
  ParticipationRateProposals,
  ParticipationRateRows,
  ParticipationRateVotes,
} from 'types/delegate-compensation/votingHistory';
import { KARMA_API } from 'helpers/karma';

export const getPRBreakdown = async (
  address?: string,
  daoName?: string,
  month?: string | number,
  year?: string | number,
  period = 'arbitrum-incentive'
) => {
  if (!address || !daoName) return { proposals: [], votes: [], rows: [] };
  try {
    // Using fetch instead of axios api
    const url = `${KARMA_API.base_url}/delegate/${daoName}/${address}/voting-history?period=${period}&month=${month}&year=${year}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();
    const proposals = responseData?.data
      ?.proposals as ParticipationRateProposals[];
    if (!proposals) throw new Error('No proposals');
    const votes = responseData?.data?.votes as ParticipationRateVotes[];
    const rows: ParticipationRateRows[] = [];
    proposals.forEach((proposal: ParticipationRateProposals) => {
      const voteFound = votes.find(
        (vote: ParticipationRateVotes) =>
          vote.proposal.id.toLowerCase() === proposal.id.toLowerCase()
      );
      rows.push({
        id: proposal.id,
        discussion:
          proposal.discussion.slice(0, 2) === '# '
            ? proposal.discussion.slice(2)
            : proposal.discussion,
        votedOn: voteFound?.timestamp || undefined,
        link: undefined,
      });
    });

    const orderRows = rows
      .sort((first, second) => {
        if (!first.votedOn) return 1;
        if (!second.votedOn) return -1;
        return +second.votedOn * 1000 - +first.votedOn * 1000;
      })
      .map(item => ({
        ...item,
        votedOn: item.votedOn
          ? new Date(+item.votedOn * 1000).toString()
          : undefined,
      }));
    return { proposals, votes, rows: orderRows };
  } catch (error) {
    console.error(error);
    return { proposals: [], votes: [], rows: [] };
  }
};
