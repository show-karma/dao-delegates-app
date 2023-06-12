// eslint-disable-next-line import/no-extraneous-dependencies
import { DebouncedFunc } from 'lodash';
import { useDisclosure } from '@chakra-ui/react';
import debounce from 'lodash.debounce';
import React, {
  useContext,
  createContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import { useRouter } from 'next/router';
import {
  IDelegate,
  IFilterOrder,
  IFilterPeriod,
  IDelegateFromAPI,
  IStatOptions,
  IVoteInfo,
  IActiveTab,
  IStatusOptions,
  IWorkstream,
  IStatsID,
  ITracks,
} from 'types';
import { useMixpanel, useToasty } from 'hooks';
import { api } from 'helpers';
import { useAccount } from 'wagmi';
import { IBulkDelegatePayload } from 'utils/moonriverDelegateAction';
import { ITrackBadgeProps } from 'components/DelegationPool/TrackBadge';
import { useDAO } from './dao';

interface IDelegateProps {
  delegates: IDelegate[];
  isLoading: boolean;
  userToFind: string;
  lastUpdate: Date;
  hasMore: boolean;
  fetchNextDelegates: () => Promise<void>;
  findDelegate: () => Promise<void>;
  fetchDelegates: (_offset?: number) => Promise<void>;
  handleSearch: DebouncedFunc<(text: any) => void>;
  isSearchDirty: boolean;
  selectStat: (_selectedStat: IStatsID) => void;
  selectOrder: (selectedOrder: IFilterOrder) => void;
  selectPeriod: (selectedPeriod: IFilterPeriod) => void;
  selectUserToFind: (selectedUserToFind: string) => void;
  statOptions: IStatOptions[];
  stat: IStatsID;
  order: IFilterOrder;
  period: IFilterPeriod;
  clearFilters: () => void;
  voteInfos: IVoteInfo;
  isOpenProfile: boolean;
  onCloseProfile: () => void;
  profileSelected?: IDelegate;
  selectProfile: (profile: IDelegate, tab?: IActiveTab) => void;
  selectedTab: IActiveTab;
  searchProfileModal: (
    userToSearch: string,
    defaultTab?: IActiveTab
  ) => Promise<void>;
  interests: string[];
  interestFilter: string[];
  selectInterests: (index: number) => void;
  delegateCount: number;
  selectStatus: (items: IStatusOptions[]) => void;
  statuses: IStatusOptions[];
  isFiltering: boolean;
  workstreams: IWorkstream[];
  workstreamsFilter: string[];
  selectWorkstream: (index: number) => void;
  tracks: ITracks[];
  tracksFilter: string[];
  selectTracks: (index: number) => void;
  statusesOptions: IStatusOptions[];
  setSelectedProfileData: (selected: IDelegate) => void;
  setupFilteringUrl: (
    paramToSetup: 'sortby' | 'order' | 'period' | 'statuses' | 'toa',
    paramValue: string
  ) => void;
  refreshProfileModal: (tab?: IActiveTab) => Promise<void>;
  handleAcceptedTermsOnly: (value: boolean) => void;
  acceptedTermsOnly: boolean;
  handleDelegateOffersToA: (value: boolean) => void;
  delegateOffersToA: boolean;
  delegatePoolList: IBulkDelegatePayload[];
  addToDelegatePool: (delegate: IDelegate, amount: string) => void;
  removeFromDelegatePool: (address: string) => void;
  addTrackToDelegateInPool: (
    track: ITrackBadgeProps['track'],
    address: string
  ) => void;
  removeTrackFromDelegateInPool: (trackId: number, address: string) => void;
  clearDelegationPool: () => void;
}

export const DelegatesContext = createContext({} as IDelegateProps);

interface ProviderProps {
  children: React.ReactNode;
  ignoreAutoFetch?: boolean;
}

const statDefaultOptions: IStatOptions[] = [
  { title: 'Voting weight', id: 'delegatedVotes', stat: 'delegatedVotes' },
  { title: 'Forum Activity', id: 'forumScore', stat: 'forumScore' },
  { title: 'Snapshot votes', id: 'offChainVotesPct', stat: 'offChainVotesPct' },
  { title: 'On-chain votes', id: 'onChainVotesPct', stat: 'onChainVotesPct' },
  { title: 'Score', id: 'score', stat: 'karmaScore' },
  { title: 'Health', id: 'healthScore', stat: 'healthScore' },
  { title: 'Discord Score', id: 'discordScore', stat: 'discordScore' },
];

const defaultStatuses: IStatusOptions[] = [
  'active',
  'inactive',
  'withdrawn',
  'recognized',
];

export const DelegatesProvider: React.FC<ProviderProps> = ({
  children,
  ignoreAutoFetch,
}) => {
  const { daoInfo } = useDAO();
  const { config } = daoInfo;

  const defaultTimePeriod =
    config.DAO_DEFAULT_SETTINGS?.TIMEPERIOD || 'lifetime';
  const [delegates, setDelegates] = useState<IDelegate[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [isFetchingMore, setFetchingMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [hasMore, setHasMore] = useState(false);
  const [hasInitiated, setInitiated] = useState(false);
  const [acceptedTermsOnly, setAcceptedTermsOnly] = useState(false);
  const [delegateOffersToA, setDelegateOffersToA] = useState(false);

  const [delegatePoolList, setDelegatePoolList] = useState<
    IBulkDelegatePayload[]
  >([]);

  const prepareStatOptions = () => {
    const sortedDefaultOptions = statDefaultOptions.sort(element =>
      element.stat === config.DAO_DEFAULT_SETTINGS?.ORDERSTAT ? -1 : 1
    );

    const filteredStats = sortedDefaultOptions.filter(
      option => !config.EXCLUDED_CARD_FIELDS.includes(option.stat)
    );

    const optionsStats = sortedDefaultOptions.filter(option =>
      config.SORT_OPTIONS?.includes(option.stat)
    );

    const statsToShow = filteredStats.concat(optionsStats);
    return statsToShow;
  };

  const [statuses, setStatuses] = useState<IStatusOptions[]>(
    config.DAO_DEFAULT_SETTINGS?.STATUS_FILTER?.DEFAULT_STATUSES ||
      defaultStatuses
  );

  const [statusesOptions] = useState<IStatusOptions[]>(defaultStatuses);

  const statOptions = prepareStatOptions();

  const [stat, setStat] = useState<IStatsID>(
    config.DAO_DEFAULT_SETTINGS?.SORT || statOptions[0].id
  );
  const [order, setOrder] = useState<IFilterOrder>('desc');
  const [period, setPeriod] = useState<IFilterPeriod>(defaultTimePeriod);
  const [interests, setInterests] = useState<string[]>([]);

  const [interestFilter, setInterestFilter] = useState<string[]>([]);
  const [userToFind, setUserToFind] = useState<string>('');
  const [voteInfos, setVoteInfos] = useState({} as IVoteInfo);
  const [selectedTab, setSelectedTab] = useState<IActiveTab>('statement');
  const [profileSelected, setProfileSelected] = useState<IDelegate | undefined>(
    {} as IDelegate
  );
  const [delegateCount, setDelegateCount] = useState(0);
  const [workstreams, setWorkstreams] = useState<IWorkstream[]>([]);
  const [workstreamsFilter, setWorkstreamsFilter] = useState<string[]>([]);
  const [tracks, setTracks] = useState<ITracks[]>([]);
  const [tracksFilter, setTracksFilter] = useState<string[]>([]);

  const { mixpanel } = useMixpanel();
  const { toast } = useToasty();
  const router = useRouter();
  const { asPath } = router;

  const {
    isOpen: isOpenProfile,
    onOpen: onOpenProfile,
    onClose: closeModalProfile,
  } = useDisclosure();

  const isSearchDirty = userToFind !== '';
  const isFiltering = interests.length > 0;

  const fetchDaoIds = async () => {
    try {
      const {
        data: { data },
      } = await api.get<{ data: { snapshotIds: string[]; onChainId: string } }>(
        `/dao/${config.DAO_KARMA_ID}`
      );

      setVoteInfos({ ...data });
    } catch (error) {
      console.error(error);
    }
  };

  const fetchInterests = async () => {
    try {
      const { data } = await api.get(`/dao/interests/${config.DAO_KARMA_ID}`);
      if (Array.isArray(data?.data?.interests)) {
        const orderedInterests = data.data.interests.sort(
          (interestA: string, interestB: string) =>
            interestA.toLowerCase() > interestB.toLowerCase() ? 1 : -1
        );
        setInterests(orderedInterests);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCategoryType = async () => {
    try {
      const type = daoInfo.config.DAO_CATEGORIES_TYPE;
      let data = [];

      if (type === 'workstreams') {
        data = (await api.get(`/workstream/list?dao=${config.DAO_KARMA_ID}`))
          .data.data;
      } else if (type === 'tracks') {
        data = (await api.get(`/dao/moonbeam/tracks`)).data.data; // this is hardcoded for now, while the boys are working on the API
        // data = (await api.get(`${config.DAO_KARMA_ID}/${type}`)).data.data;
      }

      const { tracks: dataTracks, workstreams: dataWorkstreams } = data;

      if (Array.isArray(dataTracks || dataWorkstreams)) {
        if (type === 'tracks') {
          setTracks(dataTracks);
        } else if (type === 'workstreams') {
          setWorkstreams(dataWorkstreams);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const setSelectedProfileData = (selected: IDelegate) => {
    setProfileSelected(selected);
  };

  const getWorkstreams = () => {
    if (workstreamsFilter.length === 0 && config.DAO_KARMA_ID === 'gitcoin')
      return '6,4,3,7,1,2,5,12';
    if (workstreamsFilter.length) return workstreamsFilter.join(',');
    return undefined;
  };

  const getTracks = () => {
    if (tracksFilter.length) return tracksFilter.join(',');
    return undefined;
  };

  const handleAcceptedTermsOnly = (value: boolean) => {
    setAcceptedTermsOnly(value);
  };
  const handleDelegateOffersToA = (value: boolean) => {
    setDelegateOffersToA(value);
  };

  const fetchDelegates = async (_offset = offset) => {
    setLoading(true);
    try {
      const axiosClient = await api.get(`/dao/delegates`, {
        params: {
          interests: interestFilter.length
            ? interestFilter.join(',')
            : undefined,
          name: config.DAO_KARMA_ID,
          offset: _offset,
          order,
          field: stat,
          period,
          pageSize: 10,
          tos: daoInfo.config.TOS_URL ? acceptedTermsOnly : undefined,
          toa: daoInfo.config.DAO_SUPPORTS_TOA ? delegateOffersToA : undefined,
          workstreamId: getWorkstreams(),
          tracks: getTracks(),
          statuses: statuses.length
            ? statuses.join(',')
            : config.DAO_DEFAULT_SETTINGS?.STATUS_FILTER?.DEFAULT_STATUSES?.join(
                ','
              ) || defaultStatuses.join(','),
        },
      });

      const { data } = axiosClient.data;
      const { delegates: fetchedDelegates, count } = data;

      if (fetchedDelegates.length)
        setLastUpdate(fetchedDelegates[0].stats[0].updatedAt);

      const delegatesList = fetchedDelegates.map((item: IDelegateFromAPI) => {
        const fetchedPeriod = item.stats.find(
          fetchedStat => fetchedStat.period === period
        );

        return {
          address: item.publicAddress,
          ensName: item.ensName,
          delegatorCount: item.delegatorCount || 0,
          forumActivity: fetchedPeriod?.forumActivityScore || 0,
          discordScore: fetchedPeriod?.discordScore || 0,
          delegateSince: item.joinDateAt || item.firstTokenDelegatedAt,
          voteParticipation: {
            onChain: fetchedPeriod?.onChainVotesPct || 0,
            offChain: fetchedPeriod?.offChainVotesPct || 0,
          },
          delegatePitch: item.delegatePitch,
          gitcoinHealthScore: fetchedPeriod?.gitcoinHealthScore || 0,
          votingWeight: item.voteWeight,
          delegatedVotes:
            +item.delegatedVotes || +(item?.snapshotDelegatedVotes || 0),
          twitterHandle: item.twitterHandle,
          discourseHandle: item.discourseHandle,
          discordHandle: item.discordHandle,
          discordUsername: item.discordUsername,
          updatedAt: fetchedPeriod?.updatedAt,
          karmaScore: fetchedPeriod?.karmaScore || 0,
          aboutMe: item.aboutMe,
          realName: item.realName,
          status: item.status,
          profilePicture: item.profilePicture,
          workstreams: item.workstreams,
          tracks: item.tracks,
          userCreatedAt: item.userCreatedAt,
        };
      });

      setDelegates(delegatesList);
      setDelegateCount(count || 0);
    } catch (error) {
      setDelegates([]);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setHasMore(delegates.length < delegateCount);
  }, [delegates.length, delegateCount]);

  const findDelegate = async () => {
    if (isFetchingMore) return;
    setFetchingMore(true);
    setLoading(true);
    try {
      const axiosClient = await api.get(`/dao/search-delegate`, {
        params: {
          user: userToFind,
          pageSize: 10,
          offset,
          period,
          order,
          dao: config.DAO_KARMA_ID,
        },
      });
      const { data } = axiosClient.data;

      const { delegates: fetchedDelegates, count } = data;

      if (!fetchedDelegates) {
        throw new Error('No delegates found');
      }
      const delegatesList = fetchedDelegates.map((item: IDelegateFromAPI) => {
        const fetchedPeriod = item.stats.find(
          fetchedStat => fetchedStat.period === period
        );

        return {
          address: item.publicAddress,
          ensName: item.ensName,
          delegatorCount: item.delegatorCount,
          forumActivity: fetchedPeriod?.forumActivityScore || 0,
          discordScore: fetchedPeriod?.discordScore || 0,
          delegateSince: item.joinDateAt || item.firstTokenDelegatedAt,
          voteParticipation: {
            onChain: fetchedPeriod?.onChainVotesPct || 0,
            offChain: fetchedPeriod?.offChainVotesPct || 0,
          },
          discourseHandle: item.discourseHandle,
          discordHandle: item.discordHandle,
          discordUsername: item.discordUsername,
          votingWeight: item.voteWeight,
          delegatePitch: item.delegatePitch,
          delegatedVotes: +item.delegatedVotes || item.snapshotDelegatedVotes,
          gitcoinHealthScore: fetchedPeriod?.gitcoinHealthScore || 0,
          twitterHandle: item.twitterHandle,
          updatedAt: fetchedPeriod?.updatedAt,
          karmaScore: fetchedPeriod?.karmaScore || 0,
          aboutMe: item.aboutMe,
          realName: item.realName,
          profilePicture: item.profilePicture,
          workstreams: item.workstreams,
          tracks: item.tracks,
          status: item.status,
          userCreatedAt: item.userCreatedAt,
        };
      });
      setDelegates(delegatesList);

      setDelegateCount(count || 0);
    } catch (error) {
      console.log(error);
      setDelegates([]);
      return;
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  };

  const selectProfile = (profile: IDelegate, tab: IActiveTab = 'statement') => {
    mixpanel.reportEvent({
      event: 'viewActivity',
      properties: {
        tab,
      },
    });
    setSelectedTab(tab);
    setProfileSelected(profile);
    onOpenProfile();
    router
      .push(
        {
          pathname: `/profile/${profile.ensName || profile.address}`,
          hash: tab,
        },
        undefined,
        { shallow: true }
      )
      .catch(error => {
        if (!error.cancelled) {
          throw error;
        }
      });
  };

  const { address: publicAddress, isConnected } = useAccount();

  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  const [profileSearching, setProfileSearching] = useState<string | undefined>(
    undefined
  );

  const checkIfUserNotFound = (
    error: string,
    userToSearch: string,
    defaultTab?: IActiveTab
  ) => {
    if (!publicAddress) {
      setProfileSearching(userToSearch);
      setShouldOpenModal(true);
      return;
    }

    if (
      error === 'Not Found' &&
      publicAddress?.toLowerCase() === userToSearch.toLowerCase() &&
      isConnected
    ) {
      const userWithoutDelegate: IDelegate = {
        address: userToSearch,
        forumActivity: 0,
        karmaScore: 0,
        discordScore: 0,
        voteParticipation: {
          onChain: 0,
          offChain: 0,
        },
        status: 'active',
      };
      const getTab = asPath.split('#');
      const tabs: IActiveTab[] = [
        'votinghistory',
        'statement',
        'handles',
        'withdraw',
      ];
      const checkTab = tabs.includes(getTab[1] as IActiveTab);
      const shouldOpenTab = defaultTab || (getTab[1] as IActiveTab);

      selectProfile(userWithoutDelegate, checkTab ? shouldOpenTab : undefined);
    } else {
      toast({
        title: `We couldn't find the contributor page`,
      });
    }
  };

  useEffect(() => {
    if (publicAddress && profileSearching && shouldOpenModal) {
      setShouldOpenModal(false);
      checkIfUserNotFound('Not Found', profileSearching);
    }
  }, [publicAddress, isConnected]);

  const searchProfileModal = async (
    userToSearch: string,
    defaultTab?: IActiveTab
  ) => {
    try {
      const axiosClient = await api.get(`/dao/find-delegate`, {
        params: {
          dao: config.DAO_KARMA_ID,
          user: userToSearch,
        },
      });
      const { data } = axiosClient.data;
      const { delegate: fetchedDelegate } = data;

      const fetchedPeriod = (fetchedDelegate as IDelegateFromAPI).stats.find(
        fetchedStat => fetchedStat.period === period
      );
      const userFound: IDelegate = {
        address: fetchedDelegate.publicAddress,
        ensName: fetchedDelegate.ensName,
        delegatorCount: fetchedDelegate.delegatorCount || 0,
        forumActivity: fetchedPeriod?.forumActivityScore || 0,
        discordScore: fetchedPeriod?.discordScore || 0,
        delegateSince:
          fetchedDelegate.joinDateAt || fetchedDelegate.firstTokenDelegatedAt,
        voteParticipation: {
          onChain: fetchedPeriod?.onChainVotesPct || 0,
          offChain: fetchedPeriod?.offChainVotesPct || 0,
        },
        votingWeight: fetchedDelegate.voteWeight,
        delegatedVotes:
          fetchedDelegate.delegatedVotes ||
          fetchedDelegate.snapshotDelegatedVotes,
        gitcoinHealthScore: fetchedPeriod?.gitcoinHealthScore || 0,
        twitterHandle: fetchedDelegate.twitterHandle,
        discourseHandle: fetchedDelegate.discourseHandle,
        discordHandle: fetchedDelegate.discordHandle,
        discordUsername: fetchedDelegate.discordUsername,
        updatedAt: fetchedPeriod?.updatedAt,
        karmaScore: fetchedPeriod?.karmaScore || 0,
        delegatePitch: fetchedDelegate.delegatePitch,
        aboutMe: fetchedDelegate.aboutMe,
        realName: fetchedDelegate.realName,
        profilePicture: fetchedDelegate.profilePicture,
        workstreams: fetchedDelegate.workstreams,
        tracks: fetchedDelegate.tracks,
        status: fetchedDelegate.status,
        userCreatedAt: fetchedDelegate.userCreatedAt,
        acceptedTOS: fetchedDelegate.acceptedTOS,
      };

      const getTab = asPath.split('#');
      const tabs: IActiveTab[] = [
        'votinghistory',
        'statement',
        'handles',
        'withdraw',
      ];
      if (userFound.aboutMe) tabs.push('aboutme');
      if (daoInfo.config.DAO_SUPPORTS_TOA) tabs.push('toa');
      const checkTab = tabs.includes(getTab[1] as IActiveTab);
      const shouldOpenTab = defaultTab || (getTab[1] as IActiveTab);

      selectProfile(userFound, checkTab ? shouldOpenTab : undefined);
    } catch (error: any) {
      checkIfUserNotFound(
        error?.response?.data.error.error,
        userToSearch,
        defaultTab
      );
    }
  };

  const refreshProfileModal = async (tab?: IActiveTab) => {
    try {
      const axiosClient = await api.get(`/dao/find-delegate`, {
        params: {
          dao: config.DAO_KARMA_ID,
          user: profileSelected?.address,
        },
      });
      const { data } = axiosClient.data;
      const { delegate: fetchedDelegate } = data;

      const fetchedPeriod = (fetchedDelegate as IDelegateFromAPI).stats.find(
        fetchedStat => fetchedStat.period === period
      );
      const userFound: IDelegate = {
        address: fetchedDelegate.publicAddress,
        ensName: fetchedDelegate.ensName,
        delegatorCount: fetchedDelegate.delegatorCount || 0,
        forumActivity: fetchedPeriod?.forumActivityScore || 0,
        discordScore: fetchedPeriod?.discordScore || 0,
        delegateSince:
          fetchedDelegate.joinDateAt || fetchedDelegate.firstTokenDelegatedAt,
        voteParticipation: {
          onChain: fetchedPeriod?.onChainVotesPct || 0,
          offChain: fetchedPeriod?.offChainVotesPct || 0,
        },
        votingWeight: fetchedDelegate.voteWeight,
        delegatedVotes:
          fetchedDelegate.delegatedVotes ||
          fetchedDelegate.snapshotDelegatedVotes,
        gitcoinHealthScore: fetchedPeriod?.gitcoinHealthScore || 0,
        twitterHandle: fetchedDelegate.twitterHandle,
        discourseHandle: fetchedDelegate.discourseHandle,
        discordHandle: fetchedDelegate.discordHandle,
        discordUsername: fetchedDelegate.discordUsername,
        updatedAt: fetchedPeriod?.updatedAt,
        karmaScore: fetchedPeriod?.karmaScore || 0,
        delegatePitch: fetchedDelegate.delegatePitch,
        aboutMe: fetchedDelegate.aboutMe,
        realName: fetchedDelegate.realName,
        profilePicture: fetchedDelegate.profilePicture,
        workstreams: fetchedDelegate.workstreams,
        tracks: fetchedDelegate.tracks,
        status: fetchedDelegate.status,
        userCreatedAt: fetchedDelegate.userCreatedAt,
      };

      setProfileSelected(userFound);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchNextDelegates = async () => {
    if (isSearchDirty) {
      findDelegate();
      return;
    }

    if (isFetchingMore || !hasMore) return;
    const newOffset = offset + 1;

    if (delegates.length) {
      setOffset(newOffset);
    }

    setLoading(true);
    setFetchingMore(true);
    try {
      const axiosClient = await api.get(`/dao/delegates`, {
        params: {
          interests: interestFilter.length
            ? interestFilter.join(',')
            : undefined,
          name: config.DAO_KARMA_ID,
          offset: newOffset,
          order,
          field: stat,
          period,
          pageSize: 10,
          tos: daoInfo.config.TOS_URL ? acceptedTermsOnly : undefined,
          toa: daoInfo.config.DAO_SUPPORTS_TOA ? delegateOffersToA : undefined,
          workstreamId: getWorkstreams(),
          statuses: statuses.length
            ? statuses.join(',')
            : config.DAO_DEFAULT_SETTINGS?.STATUS_FILTER?.DEFAULT_STATUSES?.join(
                ','
              ) || defaultStatuses.join(','),
        },
      });
      const { data } = axiosClient.data;
      const { delegates: fetchedDelegates } = data;
      if (fetchedDelegates.length) {
        setLastUpdate(fetchedDelegates[0].stats[0].updatedAt);
      }
      fetchedDelegates.forEach((item: IDelegateFromAPI) => {
        const fetchedPeriod = item.stats.find(
          fetchedStat => fetchedStat.period === period
        );

        delegates.push({
          address: item.publicAddress,
          ensName: item.ensName,
          delegatorCount: item.delegatorCount || 0,
          forumActivity: fetchedPeriod?.forumActivityScore || 0,
          discordScore: fetchedPeriod?.discordScore || 0,
          delegateSince: item.joinDateAt || item.firstTokenDelegatedAt,
          voteParticipation: {
            onChain: fetchedPeriod?.onChainVotesPct || 0,
            offChain: fetchedPeriod?.offChainVotesPct || 0,
          },
          votingWeight: item?.voteWeight,
          delegatedVotes: +item.delegatedVotes || item.snapshotDelegatedVotes,
          twitterHandle: item.twitterHandle,
          discourseHandle: item.discourseHandle,
          discordHandle: item.discordHandle,
          discordUsername: item.discordUsername,
          delegatePitch: item.delegatePitch,
          updatedAt: fetchedPeriod?.updatedAt || '-',
          karmaScore: fetchedPeriod?.karmaScore || 0,
          aboutMe: item.aboutMe,
          realName: item.realName,
          profilePicture: item.profilePicture,
          workstreams: item.workstreams,
          tracks: item.tracks,
          gitcoinHealthScore: fetchedPeriod?.gitcoinHealthScore || 0,
          userCreatedAt: item.userCreatedAt,
          status: item.status,
        });
      });
    } catch (error) {
      setDelegates([]);
      console.log(error);
    } finally {
      setFetchingMore(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!ignoreAutoFetch) {
      fetchInterests();
      fetchCategoryType();
    }
    fetchDaoIds();
  }, []);

  // Fetch vote infos
  const getVoteInfos = async () => {
    try {
      const axiosClient = await api.get(`/dao/delegates`, {
        params: {
          name: config.DAO_KARMA_ID,
          pageSize: 10,
          offset: 0,
          order: 'desc',
          field: 'score',
          period: 'lifetime',
        },
      });
      const { onChainId, snapshotIds } = axiosClient.data.data;
      setVoteInfos({
        onChainId,
        snapshotIds,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch vote infos if there are delegates
  useMemo(() => {
    if (
      delegates.length &&
      !voteInfos?.onChainId &&
      !voteInfos?.snapshotIds?.length
    ) {
      getVoteInfos();
    }
  }, [delegates]);

  const setupFilteringUrl = (
    paramToSetup: 'sortby' | 'order' | 'period' | 'statuses' | 'toa',
    paramValue: string
  ) => {
    const queries = router.query;
    delete queries.site;

    const filters = {
      sortby: paramValue,
      order: paramValue,
      period: paramValue,
      statuses: paramValue,
      toa: paramValue,
    };

    const query = {
      ...queries,
      [paramToSetup]: filters[paramToSetup],
    };

    router.push(
      {
        pathname: '/',
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const selectStat = (_selectedStat: IStatsID) => {
    setStat(_selectedStat);
  };
  const selectOrder = (selectedOrder: IFilterOrder) => {
    setOrder(selectedOrder);
  };
  const selectPeriod = (selectedPeriod: IFilterPeriod) =>
    setPeriod(selectedPeriod);

  const selectUserToFind = (selectedUser: string) => {
    setOffset(0);
    setUserToFind(selectedUser);
  };

  const selectInterests = (index: number) => {
    if (!interests[index]) return;

    // search for the interest in the interestFilter array
    const filterIdx = interestFilter.findIndex(
      filter => filter === interests[index]
    );

    // clone the interestFilter array
    const items = [...interestFilter];

    // if the interest is already in the interestFilter array, remove it
    if (filterIdx >= 0) {
      items.splice(filterIdx, 1);
    } else {
      items.push(interests[index]);
    }

    // set the new interestFilter array
    setInterestFilter(items);
  };

  const selectWorkstream = (index: number) => {
    if (!workstreams[index]) return;

    // search for the index in the workstreamsFilter array
    const filterIdx = workstreamsFilter.findIndex(
      filter => filter === workstreams[index].id.toString()
    );

    // clone the workstreamsFilter array
    const items = [...workstreamsFilter];

    // if the workstreams is already in the workstreamsFilter array, remove it
    if (filterIdx >= 0) {
      items.splice(filterIdx, 1);
    } else {
      items.push(workstreams[index].id.toString());
    }

    // set the new workstreamsFilter array
    setWorkstreamsFilter(items);
  };

  const selectTracks = (index: number) => {
    if (!tracks[index]) return;

    // search for the index in the tracksFilter array
    const filterIdx = tracksFilter.findIndex(
      filter => filter === tracks[index].id.toString()
    );

    // clone the tracksFilter array
    const items = [...tracksFilter];

    // if the tracks is already in the tracksFilter array, remove it
    if (filterIdx >= 0) {
      items.splice(filterIdx, 1);
    } else {
      items.push(tracks[index].id.toString());
    }

    // set the new tracksFilter array
    setTracksFilter(items);
  };

  const selectStatus = (items: IStatusOptions[]) => {
    setStatuses(items);
  };

  const setupQueryParams = () => {
    // We will use asPath method instead of using router.query because router.query is some seconds slower than router.asPath
    const queryString = router.asPath.split('?')[1];
    if (!queryString) {
      setInitiated(true);
      return;
    }
    const querySortby = queryString?.match(/(?<=sortby=)[^&]*/i)?.[0];
    const queryOrder = queryString?.match(/(?<=order=)[^&]*/i)?.[0];
    const queryPeriod = queryString?.match(/(?<=period=)[^&]*/i)?.[0];
    const queryStatuses = queryString?.match(/(?<=statuses=)[^&]*/i)?.[0];
    const queryTOS = queryString?.match(/(?<=tos=)[^&]*/i)?.[0];
    if (queryTOS) {
      setAcceptedTermsOnly(queryTOS === 'true');
    }
    if (querySortby) {
      const isStatValid = statOptions.find(item => item.id === querySortby);
      if (isStatValid) setStat(querySortby as IStatsID);
    }
    if (queryOrder) {
      const isOrderValid = queryOrder === 'asc' || queryOrder === 'desc';
      if (isOrderValid) setOrder(queryOrder as IFilterOrder);
    }
    if (queryPeriod) {
      const isPeriodValid = (
        ['lifetime', '180d', '30d'] as IFilterPeriod[]
      ).find(item => item === queryPeriod);

      if (isPeriodValid) setPeriod(queryPeriod as IFilterPeriod);
    }
    if (queryStatuses) {
      const validStatuses = queryStatuses
        .split(/(%2C|,)/)
        .filter(item => statusesOptions.includes(item as IStatusOptions));
      if (validStatuses.length > 0)
        setStatuses(validStatuses as IStatusOptions[]);
    }
    setInitiated(true);
  };

  const addToDelegatePool = (delegate: IDelegate, amount = '0.1') => {
    const newDelegates = [...delegatePoolList];
    const delegateIndex = newDelegates.findIndex(
      item => item.delegate.address === delegate.address
    );
    if (!~delegateIndex) {
      newDelegates.push({ delegate, tracks: [], amount: '0.1' });
    }
    setDelegatePoolList(newDelegates);
  };

  const clearDelegationPool = () => {
    setDelegatePoolList([]);
  };

  const removeFromDelegatePool = (address: string) => {
    const newDelegates = [...delegatePoolList];
    const delegateIndex = newDelegates.findIndex(
      item => item.delegate.address === address
    );
    if (~delegateIndex) {
      newDelegates.splice(delegateIndex, 1);
    }
    setDelegatePoolList(newDelegates);
  };

  const removeTrackFromDelegateInPool = (trackId: number, address: string) => {
    const newDelegates = [...delegatePoolList];
    const delegateIndex = newDelegates.findIndex(
      item => item.delegate.address === address
    );
    if (~delegateIndex) {
      const newTracks = [...newDelegates[delegateIndex].tracks];
      const trackIndex = newTracks.findIndex(item => item.id === trackId);
      if (~trackIndex) {
        newTracks.splice(trackIndex, 1);
      }
      newDelegates[delegateIndex].tracks = newTracks;
    }
    setDelegatePoolList(newDelegates);
  };

  const addTrackToDelegateInPool = (
    track: ITrackBadgeProps['track'],
    address: string
  ) => {
    const newDelegates = [...delegatePoolList];

    const delegateIndex = newDelegates.findIndex(
      item => item.delegate.address === address
    );

    if (~delegateIndex) {
      const newTracks = [...newDelegates[delegateIndex].tracks];
      const trackIndex = newTracks.findIndex(item => item.id === track.id);
      if (!~trackIndex) {
        newTracks.push(track);
      }
      newDelegates[delegateIndex].tracks = newTracks;
    }
    setDelegatePoolList(newDelegates);
  };

  useMemo(() => {
    if (!hasInitiated) return;
    setOffset(0);
    if (userToFind) {
      findDelegate();
    } else if (!ignoreAutoFetch) fetchDelegates(0);
  }, [
    acceptedTermsOnly,
    stat,
    order,
    period,
    userToFind,
    statuses,
    interestFilter,
    workstreamsFilter,
    tracksFilter,
    hasInitiated,
    delegateOffersToA,
  ]);

  useEffect(() => {
    setupQueryParams();
  }, []);

  const handleSearch = debounce(text => {
    selectUserToFind(text);
  }, 250);

  /**
   * @description This function is used to clear all filters
   */
  const clearFilters = () => {
    setStat(statOptions[0].id);
    setOrder('desc');
    setPeriod(defaultTimePeriod);
    setUserToFind('');
  };

  const onCloseProfile = () => {
    closeModalProfile();
    setProfileSelected(undefined);
  };

  const providerValue = useMemo(
    () => ({
      delegates,
      isLoading,
      lastUpdate,
      hasMore,
      fetchNextDelegates,
      findDelegate,
      fetchDelegates,
      handleSearch,
      isSearchDirty,
      statOptions,
      stat,
      order,
      period,
      selectStat,
      selectOrder,
      selectPeriod,
      selectUserToFind,
      userToFind,
      clearFilters,
      voteInfos,
      isOpenProfile,
      onCloseProfile,
      profileSelected,
      selectProfile,
      selectedTab,
      searchProfileModal,
      interests,
      interestFilter,
      selectInterests,
      delegateCount,
      selectStatus,
      statuses,
      isFiltering,
      workstreams,
      selectWorkstream,
      workstreamsFilter,
      statusesOptions,
      setSelectedProfileData,
      setupFilteringUrl,
      refreshProfileModal,
      acceptedTermsOnly,
      handleAcceptedTermsOnly,
      delegateOffersToA,
      handleDelegateOffersToA,
      tracks,
      tracksFilter,
      selectTracks,
      delegatePoolList,
      addToDelegatePool,
      removeFromDelegatePool,
      addTrackToDelegateInPool,
      removeTrackFromDelegateInPool,
      clearDelegationPool,
    }),
    [
      profileSelected,
      isOpenProfile,
      delegates,
      isLoading,
      lastUpdate,
      hasMore,
      isFetchingMore,
      offset,
      isSearchDirty,
      statOptions,
      stat,
      order,
      period,
      userToFind,
      voteInfos,
      selectedTab,
      interests,
      statuses,
      isFiltering,
      workstreams,
      workstreamsFilter,
      statusesOptions,
      setSelectedProfileData,
      setupFilteringUrl,
      refreshProfileModal,
      acceptedTermsOnly,
      handleAcceptedTermsOnly,
      delegateOffersToA,
      handleDelegateOffersToA,
      tracks,
      tracksFilter,
      selectTracks,
      delegatePoolList,
      addToDelegatePool,
      removeFromDelegatePool,
      addTrackToDelegateInPool,
      removeTrackFromDelegateInPool,
      clearDelegationPool,
    ]
  );

  return (
    <DelegatesContext.Provider value={providerValue}>
      {children}
    </DelegatesContext.Provider>
  );
};

export const useDelegates = () => useContext(DelegatesContext);
