/* eslint-disable no-useless-catch */
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';

import moment from 'moment';
import { IChainRow } from 'types';
import { VOTING_HISTORY } from 'utils';

const onChainClient = new ApolloClient({
  uri: 'https://api.thegraph.com/subgraphs/name/show-karma/dao-on-chain-voting',
  cache: new InMemoryCache(),
});

/**
 * Concat proposal and votes into a common interface
 * @param proposals
 * @param votes
 */
function concatOnChainProposals(proposals: any[], votes: any[]) {
  const array: IChainRow[] = [];

  votes.forEach((vote: any) => {
    const { proposal } = vote;
    array.push({
      voteMethod: 'On-chain',
      proposal: proposal?.description,
      choice: vote?.support,
      solution: vote?.solution,
      executed: moment.unix(proposal.timestamp).format('MMMM D, YYYY'),
    });
  });

  proposals.forEach(proposal => {
    array.push({
      voteMethod: 'On-chain',
      proposal: proposal?.description,
      choice: -1,
      solution: null,
      executed: moment.unix(proposal.timestamp).format('MMMM D, YYYY'),
    });
  });

  return array;
}

/**
 * Fetch proposals from the subgraph
 * @param daoName
 * @returns array of voted and not voted proposals (not sorted)
 */
async function fetchOnChainProposalVotes(
  daoName: string | string[],
  address: string
) {
  if (!daoName || !address) return [];
  try {
    const { data: votes } = await onChainClient.query({
      query: VOTING_HISTORY.onChainVotesReq,
      variables: {
        daoname: [daoName].flat(),
        address,
      },
    });
    if (votes && Array.isArray(votes.votes)) {
      const skipIds = votes.votes.map((vote: any) => vote.proposal.id);
      const { data: proposals } = await onChainClient.query({
        query: VOTING_HISTORY.onChainProposalsReq,
        variables: {
          daoname: [daoName].flat(),
          skipIds,
        },
      });
      return concatOnChainProposals(proposals.proposals, votes.votes);
    }
  } catch (error) {
    throw error;
    //
  }
  return [];
}

const useOnChainVotes = (daoName: string | string[], address: string) =>
  useQuery(['onChainVotes', daoName, address], async () =>
    fetchOnChainProposalVotes(daoName, address)
  );

export { useOnChainVotes };
