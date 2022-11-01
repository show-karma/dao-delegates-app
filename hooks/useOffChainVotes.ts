/* eslint-disable no-useless-catch */
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';

import moment from 'moment';
import { IChainRow } from 'types';
import { VOTING_HISTORY } from 'utils';

const offChainClient = new ApolloClient({
  uri: 'https://hub.snapshot.org/graphql',
  cache: new InMemoryCache(),
});

const concatOffChainProposals = (proposals: any[], votes: any[]) => {
  const array: IChainRow[] = [];

  votes.forEach(vote => {
    const { proposal } = vote;
    array.push({
      voteMethod: 'Off-chain',
      proposal: proposal?.title,
      choice: Array.isArray(vote.choice)
        ? 'Multiple'
        : proposal.choices[vote.choice - 1],
      executed: moment.unix(proposal.end).format('MMMM D, YYYY'),
    });
  });

  proposals.forEach(proposal => {
    if (!votes.find(vote => vote.proposal.id === proposal.id))
      array.push({
        voteMethod: 'Off-chain',
        proposal: proposal?.title,
        choice: 'DID NOT VOTE',
        solution: null,
        executed: moment.unix(proposal.end).format('MMMM D, YYYY'),
      });
  });

  return array;
};

/**
 * Fetch proposals from the subgraph
 * @param daoName
 * @returns array of voted and not voted proposals (not sorted)
 */
async function fetchOffChainProposalVotes(
  daoName: string | string[],
  address: string
) {
  if (!daoName || !address) return [];
  try {
    const { data: votes } = await offChainClient.query({
      query: VOTING_HISTORY.offChainVotesReq,
      variables: {
        daoname: [daoName].flat(),
        address,
      },
    });
    if (votes && Array.isArray(votes.votes)) {
      const { data: proposals } = await offChainClient.query({
        query: VOTING_HISTORY.offChainProposalsReq,
        variables: {
          daoname: [daoName].flat(),
        },
      });
      return concatOffChainProposals(proposals.proposals, votes.votes);
    }
  } catch (error) {
    throw error;
    //
  }
  return [];
}

const useOffChainVotes = (daoName: string | string[], address: string) =>
  useQuery(['offChainVotes', daoName, address], async () =>
    fetchOffChainProposalVotes(daoName, address)
  );
export { useOffChainVotes };
