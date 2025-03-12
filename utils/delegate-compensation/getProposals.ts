import { KARMA_API } from 'helpers/karma';
import { Proposal, ProposalsFromAPI } from 'types/proposals';

export const getProposals = async (
  daoName: string,
  month: string | number,
  year: string | number
): Promise<{
  proposals: Proposal[];
  finished?: boolean;
  monthlyCalls?: number;
  biweeklyCalls?: number;
}> => {
  try {
    const response = await fetch(
      `${KARMA_API.base_url}/incentive-settings/${daoName}/${month}/${year}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = (await response.json()) as { data: ProposalsFromAPI };
    const data = responseData?.data;

    if (!data) throw new Error('No data');
    const { proposals } = data;
    const fetchedProposalsArray = Object.entries(proposals);
    const onChainProposals = fetchedProposalsArray
      .filter(([key, value]) => value.type === 'onChain')
      .map(([key, value]) => ({
        id: key,
        name:
          value.title.slice(0, 2) === '# ' ? value.title.slice(2) : value.title,
        link: `https://www.tally.xyz/gov/${daoName}/proposal/${BigInt(
          key.split('-')[1]
        ).toString()}`,
        isValid: value.isValid,
        type: 'onChain',
      }));
    const snapshotProposals = fetchedProposalsArray
      .filter(([key, value]) => value.type === 'snapshot')
      .map(([key, value]) => ({
        id: key,
        name: value.title,
        link: `https://snapshot.org/#/arbitrumfoundation.eth/proposal/${key}`,
        isValid: value.isValid,
        type: 'snapshot',
      }));

    return {
      proposals: [
        {
          name: 'Onchain Proposals',
          items: onChainProposals,
        },
        {
          name: 'Snapshot Proposals',
          items: snapshotProposals,
        },
      ] as Proposal[],
      finished: data.finished,
      monthlyCalls: data?.additionalSettings?.monthlyCalls,
      biweeklyCalls: data?.additionalSettings?.biweeklyCalls,
    };
  } catch (error) {
    console.log(error);
    return {
      proposals: [],
      finished: false,
    };
  }
};
