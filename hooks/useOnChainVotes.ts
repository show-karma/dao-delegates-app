/* eslint-disable no-useless-catch */
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useDAO } from 'contexts';

import moment from 'moment';
import { IChainRow } from 'types';
import { VOTING_HISTORY } from 'utils';

/**
 * Concat proposal and votes into a common interface
 * @param proposals
 * @param votes
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function concatOnChainProposals(proposals: any[], votes: any[]) {
  const array: IChainRow[] = [];
  votes.forEach(vote => {
    const { proposal } = vote;
    array.push({
      voteMethod: 'On-chain',
      proposal: proposal?.description,
      choice: vote?.support,
      solution: vote?.solution,
      reason: vote?.reason,
      executed: moment.unix(proposal.timestamp).format('MMMM D, YYYY'),
      executedTimestamp: proposal.timestamp,
      voteId: proposal?.id,
    });
  });

  proposals.forEach(proposal => {
    array.push({
      voteMethod: 'On-chain',
      proposal: proposal?.description,
      choice: -1,
      solution: null,
      executed: moment.unix(proposal.timestamp).format('MMMM D, YYYY'),
      executedTimestamp: proposal.timestamp,
      voteId: proposal?.id,
      finished: proposal?.status?.toLowerCase() !== 'active',
    });
  });

  return array;
}

async function fetchOnChainProposals(
  daoName: string | string[],
  skipIds: string[],
  clientUrl = 'https://api.goldsky.com/api/public/project_cm8sydf8wvsad01ye3qsj9emk/subgraphs/dao-on-chain-voting/prod/gn'
): Promise<any[]> {
  if (!daoName) return [];
  const onChainClient = new ApolloClient({
    uri: clientUrl,
    cache: new InMemoryCache(),
  });

  const { data } = await onChainClient.query({
    query: VOTING_HISTORY.onChainProposalsReq,
    variables: {
      daoname: [daoName].flat(),
      skipIds,
    },
  });
  return data.proposals || [];
}

/**
 * Fetch proposals from the subgraph
 * @param daoName
 * @returns array of voted and not voted proposals (not sorted)
 */
async function fetchOnChainProposalVotes(
  daoName: string | string[],
  address: string,
  clientUrl = 'https://api.goldsky.com/api/public/project_cm8sydf8wvsad01ye3qsj9emk/subgraphs/dao-on-chain-voting/prod/gn'
) {
  if (!daoName || !address) return [];
  try {
    const onChainClient = new ApolloClient({
      uri: clientUrl,
      cache: new InMemoryCache(),
    });
    const { data: votes } = await onChainClient.query({
      query: VOTING_HISTORY.onChainVotesReq,
      variables: {
        daoname: [daoName].flat(),
        address,
      },
    });

    if (votes && Array.isArray(votes.votes)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const skipIds = votes.votes.map((vote: any) => vote.proposal.id);
      const { data: proposals } = await axios.get(
        `/api/proposals?dao=${daoName}&skipIds=${skipIds.join(
          ','
        )}&source=on-chain`
      );
      return concatOnChainProposals(proposals, votes.votes);
    }
  } catch (error) {
    throw error;
  }
  return [];
}

const useOnChainVotes = (
  daoName: string | string[],
  address: string,
  clientUrl?: string
) => {
  const {
    daoInfo: {
      config: { DAO_EXT_VOTES_PROVIDER },
    },
  } = useDAO();
  return useQuery(['onChainVotes', daoName, address], async () => {
    if (DAO_EXT_VOTES_PROVIDER?.onChain) {
      return DAO_EXT_VOTES_PROVIDER.onChain(daoName, address);
    }
    return fetchOnChainProposalVotes(daoName, address, clientUrl);
  });
};

export { fetchOnChainProposals, fetchOnChainProposalVotes, useOnChainVotes };
