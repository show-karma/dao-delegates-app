import axios from 'axios';

const chainsDelegatesData = {
  1: 'https://api.goldsky.com/api/public/project_cm8sydf8wvsad01ye3qsj9emk/subgraphs/dao-delegates/prod/gn',
  10: 'https://gateway-arbitrum.network.thegraph.com/api/e25da26d50f6fced18c2b28649290d0b/subgraphs/id/FbqvXdcPpy83YnvoKiQkZQFYWWapDqdJbU7DupMhqwd1?source=karma',
  137: 'https://gateway-arbitrum.network.thegraph.com/api/e25da26d50f6fced18c2b28649290d0b/subgraphs/id/9HtFUEhLZuAC88d226RN4W3ywRhFcvNP5yTBE11HkE8T?source=karma',
  42161:
    'https://gateway-arbitrum.network.thegraph.com/api/e25da26d50f6fced18c2b28649290d0b/subgraphs/id/F5aKKU4KhsqrVEQjaG4N6HFJrUrVv2wEzmgsJ3ZtWGQo?source=karma',
  100: 'https://gateway-arbitrum.network.thegraph.com/api/e25da26d50f6fced18c2b28649290d0b/subgraphs/id/EhdmbHnYsC8mM7mzYz4kCADT6GKdgwqGHjZULUcYcnxw?source=karma',
  56: 'https://gateway-arbitrum.network.thegraph.com/api/e25da26d50f6fced18c2b28649290d0b/subgraphs/id/F84LJ4zf8Cv9VRAp8Dc9FHcw9yYGJDADXRfdiqoR2izZ?source=karma',
};

type DelegatedVotes = { votes: number | string; chainId: number };

export const getDelegateVotesByNetwork = async (
  name: string,
  publicAddress: string
): Promise<{ votes: number | string; chainId: number }[]> => {
  const delegatedVotes: DelegatedVotes[] = [];

  if (name.toLowerCase() === 'everclear') {
    // eslint-disable-next-line no-param-reassign
    name = 'connext';
  }

  const urls = Object.values(chainsDelegatesData);
  const entries = Object.entries(chainsDelegatesData);
  const queries = urls.map(url => ({
    query: `{
      delegateOrganizations(where: {organization: "${name}", delegate: "${publicAddress}"}) {
          voteBalance
        }
      }
    `,
    url,
    chainId: Number(entries.find(([, value]) => value === url)?.[0]),
  }));

  const results = await Promise.all(
    queries.map(query =>
      axios
        .post(query.url, { query: query.query })
        .then(res => ({ ...res, chain: query.chainId }))
    )
  );

  results.forEach(result => {
    if (
      result.data.data?.delegateOrganizations[0] &&
      result.data.data.delegateOrganizations[0].voteBalance &&
      result.data.data.delegateOrganizations[0].voteBalance !== '0'
    ) {
      delegatedVotes.push({
        votes: Math.round(
          result.data.data.delegateOrganizations[0].voteBalance / 10 ** 18
        ),
        chainId: result.chain as number,
      });
    }
  });

  return delegatedVotes;
};
