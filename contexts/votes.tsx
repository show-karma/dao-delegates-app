import { useOffChainVotes, useOnChainVotes } from 'hooks';
import React, { useContext, createContext, useMemo, useState } from 'react';
import { IChainRow, IProfile, IVoteBreakdown } from 'types';
import debounce from 'lodash.debounce';
import moment from 'moment';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { checkDecision } from 'utils';
import { useDelegates } from './delegates';
import { useDAO } from './dao';

interface IVotesProps {
  isLoading: boolean;
  offChainVotes: IChainRow[] | undefined;
  onChainVotes: IChainRow[] | undefined;
  searchProposal: (partialText: string) => void;
  resetProposal: () => void;
  showingVotes: IChainRow[];
  allVotes: IChainRow[];
  limit: number;
  offset: number;
  changeOffset: (newOffset: number) => void;
  isOffChainVoteBreakdownLoading: boolean;
  isOffChainVoteBreakdownError: boolean;
  offChainVoteBreakdown: IVoteBreakdown;
  changeSort: (newSort: 'Date' | 'Choice') => void;
  sortby: 'Date' | 'Choice';
  onChainVoteBreakdown: IVoteBreakdown | undefined;
  isOnChainVoteBreakdownLoading: boolean;
  isOnChainVoteBreakdownError: boolean;
}

export const VotesContext = createContext({} as IVotesProps);

interface ProviderProps {
  children: React.ReactNode;
  profile: IProfile;
  selectedTimeframe?: {
    from: number;
    to: number;
  };
}

export const VotesProvider: React.FC<ProviderProps> = ({
  children,
  profile,
  selectedTimeframe,
}) => {
  const { daoInfo } = useDAO();
  const { voteInfos } = useDelegates();

  const { data: dataOffChainVotes } = useOffChainVotes(
    voteInfos.snapshotIds,
    profile.address
  );

  const { data: dataOnChainVotes } = useOnChainVotes(
    voteInfos.onChainId,
    profile.address
  );

  const [offChainVotes, setOffChainVotes] = useState<IChainRow[] | undefined>(
    undefined
  );
  const [onChainVotes, setOnChainVotes] = useState<IChainRow[] | undefined>(
    undefined
  );

  const timeframe = selectedTimeframe || {
    from: moment().subtract(40, 'year').unix(),
    to: moment().unix(),
  };
  const [isLoading, setIsLoading] = useState(true);
  const [sortby, setSortBy] = useState<'Date' | 'Choice'>('Date');
  const [offset, setOffset] = useState(0);
  const limit = 6;

  const [onChainVoteBreakdown, setOnChainVoteBreakdown] = useState<
    IVoteBreakdown | undefined
  >(undefined);
  const [isOnChainVoteBreakdownLoading, setOnChainVoteBreakdownLoading] =
    useState(true);
  const [isOnChainVoteBreakdownError, setOnChainVoteBreakdownError] =
    useState(false);

  const {
    isLoading: isOffChainVoteBreakdownLoading,
    isError: isOffChainVoteBreakdownError,
    data: offChainVoteBreakdown,
  } = useQuery({
    queryKey: ['vote-breakdown'],
    queryFn: async () => {
      const { breakdown } = (
        await axios.get(
          `${process.env.NEXT_PUBLIC_KARMA_API}/dao/${daoInfo.config.DAO_KARMA_ID}/delegates/${profile.address}/vote-breakdown`
        )
      ).data.data;
      return breakdown;
    },
    enabled: !!profile.address,
    cacheTime: 0,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const changeSort = (newSort: 'Date' | 'Choice') => setSortBy(newSort);
  const changeOffset = (newOffset: number) => setOffset(newOffset);

  const allVotes = useMemo(() => {
    const filteredOffChainVotes = offChainVotes?.filter(vote => {
      if (!selectedTimeframe) return true;
      return moment(vote.executed).isBetween(
        moment.unix(timeframe.from),
        moment.unix(timeframe.to)
      );
    });
    const filteredOnChainVotes = onChainVotes?.filter(vote => {
      if (!selectedTimeframe) return true;
      return moment(vote.executed).isBetween(
        moment.unix(timeframe.from),
        moment.unix(timeframe.to)
      );
    });

    if (sortby === 'Choice') {
      const concatenatedVotes = (filteredOffChainVotes || []).concat(
        filteredOnChainVotes || []
      );

      const forVotes = concatenatedVotes
        .filter(vote => checkDecision(vote) === 'FOR')
        .sort((voteA, voteB) =>
          moment(voteA.executed).isBefore(voteB.executed) ? 1 : -1
        );
      const againstVotes = concatenatedVotes
        .filter(vote => checkDecision(vote) === 'AGAINST')
        .sort((voteA, voteB) =>
          moment(voteA.executed).isBefore(voteB.executed) ? 1 : -1
        );
      const abstainVotes = concatenatedVotes
        .filter(vote => checkDecision(vote) === 'ABSTAIN')
        .sort((voteA, voteB) =>
          moment(voteA.executed).isBefore(voteB.executed) ? 1 : -1
        );

      const notVotedVotes = concatenatedVotes
        .filter(
          vote =>
            checkDecision(vote) === 'NOTVOTED' ||
            checkDecision(vote) === 'NOTYET'
        )
        .sort((voteA, voteB) =>
          moment(voteA.executed).isBefore(voteB.executed) ? 1 : -1
        );

      return forVotes.concat(againstVotes, abstainVotes, notVotedVotes);
    }

    return (
      (filteredOffChainVotes || [])
        .concat(filteredOnChainVotes || [])
        .sort((voteA, voteB) =>
          moment(voteA.executed).isBefore(voteB.executed) ? 1 : -1
        ) || []
    );
  }, [onChainVotes, offChainVotes, timeframe.from, timeframe.to, sortby]);

  const showingVotes = allVotes.slice(offset * limit, offset * limit + limit);

  const setupVotes = () => {
    setIsLoading(true);
    setOnChainVotes(dataOnChainVotes || []);
    setOffChainVotes(dataOffChainVotes || []);
    setIsLoading(false);
  };

  useMemo(() => {
    if (dataOffChainVotes && dataOnChainVotes) setupVotes();
  }, [dataOffChainVotes, dataOnChainVotes]);

  const searchProposal = debounce((partialText: string) => {
    setIsLoading(true);
    changeOffset(0);
    const filteredOffChain = dataOffChainVotes?.filter(vote =>
      vote.proposal.toLowerCase().includes(partialText.toLowerCase())
    );
    setOffChainVotes(filteredOffChain?.length ? filteredOffChain : []);
    const filteredOnChain = dataOnChainVotes?.filter(vote =>
      vote.proposal.toLowerCase().includes(partialText.toLowerCase())
    );
    setOnChainVotes(filteredOnChain?.length ? filteredOnChain : []);

    setIsLoading(false);
  }, 500);

  const setupOnChainVoteBreakdown = () => {
    if (!onChainVotes || onChainVotes.length === 0) {
      setOnChainVoteBreakdownError(true);
      setOnChainVoteBreakdown(undefined);
      setOnChainVoteBreakdownLoading(false);
      return;
    }

    setOnChainVoteBreakdownLoading(true);

    const breakdown: IVoteBreakdown = {
      positiveCount: 0,
      negativeCount: 0,
      other: 0,
      multiple: 0,
      abstainCount: 0,
      contrarionIndex: 0,
      totalVotes: 0,
    };

    onChainVotes.forEach(vote => {
      if (vote.choice === 1) {
        breakdown.positiveCount += 1;
      } else if (vote.choice === 0) {
        breakdown.negativeCount += 1;
      } else if (vote.choice !== -1) {
        breakdown.other += 1;
      }
    });

    breakdown.totalVotes =
      breakdown.positiveCount +
      breakdown.negativeCount +
      breakdown.other +
      breakdown.multiple +
      breakdown.abstainCount;

    setOnChainVoteBreakdown(breakdown);
    setOnChainVoteBreakdownLoading(false);
    setOnChainVoteBreakdownError(false);
  };

  useMemo(() => {
    if (onChainVotes) setupOnChainVoteBreakdown();
  }, [onChainVotes]);

  const resetProposal = () => {
    setOffChainVotes(dataOffChainVotes || []);
    setOnChainVotes(dataOnChainVotes || []);
  };

  const providerValue = useMemo(
    () => ({
      offChainVotes,
      onChainVotes,
      isLoading,
      searchProposal,
      resetProposal,
      showingVotes,
      changeOffset,
      allVotes,
      limit,
      offset,
      isOffChainVoteBreakdownLoading,
      isOffChainVoteBreakdownError,
      offChainVoteBreakdown,
      changeSort,
      sortby,
      onChainVoteBreakdown,
      isOnChainVoteBreakdownLoading,
      isOnChainVoteBreakdownError,
    }),
    [
      offChainVotes,
      onChainVotes,
      isLoading,
      showingVotes,
      changeOffset,
      allVotes,
      limit,
      offset,
      isOffChainVoteBreakdownLoading,
      isOffChainVoteBreakdownError,
      offChainVoteBreakdown,
      changeSort,
      sortby,
      onChainVoteBreakdown,
      isOnChainVoteBreakdownLoading,
      isOnChainVoteBreakdownError,
    ]
  );

  return (
    <VotesContext.Provider value={providerValue}>
      {children}
    </VotesContext.Provider>
  );
};

export const useVotes = () => useContext(VotesContext);
