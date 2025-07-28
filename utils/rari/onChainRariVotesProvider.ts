/* eslint-disable no-useless-catch */
import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import moment from 'moment';
import { IChainRow } from 'types';

// Define subgraph URLs for each chain
const RARI_GOVERNANCE_SUBGRAPH_URLS: Record<number, string> = {
  1: 'https://api.studio.thegraph.com/query/63515/onchain-voting-rari/version/latest', // Mainnet
  1380012617:
    'https://api.goldsky.com/api/public/project_cm8sydf8wvsad01ye3qsj9emk/subgraphs/goldsky-onchain-voting-rari/latest/gn', // RARI Chain
};

const VOTING_HISTORY = {
  onChainProposalsReq: gql`
    query Proposals($skipIds: [String!]!) {
      proposals(
        where: { organization: "rarifoundation.eth", id_not_in: $skipIds }
        orderBy: "timestamp"
        orderDirection: desc
      ) {
        id
        description
        timestamp
        status
      }
    }
  `,
  onChainVotesReq: gql`
    query Votes($address: String!) {
      votes(
        orderBy: timestamp
        orderDirection: desc
        where: { user: $address, organization: "rarifoundation.eth" }
        first: 1000
      ) {
        id
        proposal {
          id
          description
          timestamp
        }
        organization {
          id
        }
        solution
        timestamp
        support
      }
    }
  `,
};

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
      choice: -1, // Assuming -1 indicates a proposal without a vote from the user
      solution: null,
      executed: moment.unix(proposal.timestamp).format('MMMM D, YYYY'),
      executedTimestamp: proposal.timestamp,
      voteId: proposal?.id,
      finished: proposal?.status?.toLowerCase() !== 'active',
    });
  });

  return array;
}

/**
 * Fetch proposals from the subgraph for Rari DAO from all configured chains.
 * @param _daoName - DAO name, currently unused as subgraphs are Rari specific.
 * @param address - The user's wallet address.
 * @returns Array of voted and not voted proposals from all chains.
 */
export async function onChainRariVotesProvider(
  _daoName: string | string[], // Marked as unused with underscore
  address: string
) {
  if (!address) {
    return [];
  }

  const fetchPromises = Object.entries(RARI_GOVERNANCE_SUBGRAPH_URLS).map(
    async ([chainIdStr, subgraphUrl]) => {
      const chainId = Number(chainIdStr);
      try {
        const apolloClient = new ApolloClient({
          uri: subgraphUrl,
          cache: new InMemoryCache(),
        });

        const { data: votesData } = await apolloClient.query({
          query: VOTING_HISTORY.onChainVotesReq,
          variables: {
            address,
          },
        });

        const userVotesOnChain =
          votesData?.votes && Array.isArray(votesData.votes)
            ? votesData.votes
            : [];

        const skipIds = userVotesOnChain.map(
          (vote: { proposal: { id: string | number } }) => vote.proposal.id
        );

        const { data: proposalsData } = await apolloClient.query({
          query: VOTING_HISTORY.onChainProposalsReq,
          variables: {
            skipIds: skipIds.length ? skipIds : [''],
          },
        });

        const proposalsOnChain =
          proposalsData?.proposals && Array.isArray(proposalsData.proposals)
            ? proposalsData.proposals
            : [];

        return {
          chainId,
          proposals: proposalsOnChain,
          votes: userVotesOnChain,
          status: 'fulfilled' as const,
        };
      } catch (error) {
        console.error('Error fetching Rari on-chain votes from subgraph:', {
          chainId,
          address,
          error,
        });
        return {
          chainId,
          proposals: [],
          votes: [],
          status: 'rejected' as const,
          reason: error,
        };
      }
    }
  );

  const results = await Promise.allSettled(fetchPromises);

  let allProposals: any[] = [];
  let allVotes: any[] = [];
  let hasFulfilledResults = false;

  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
      allProposals = allProposals.concat(result.value.proposals);
      allVotes = allVotes.concat(result.value.votes);
      hasFulfilledResults = true;
    }
    // Errors are already logged in the mapping function
  });

  if (!hasFulfilledResults && results.length > 0) {
    // If all fetches failed (and there was at least one to attempt)
    throw new Error('Failed to fetch on-chain votes from all Rari sources.');
  }

  return concatOnChainProposals(allProposals, allVotes);
}
