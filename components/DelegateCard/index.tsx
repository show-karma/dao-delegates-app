/* eslint-disable no-nested-ternary */
/* eslint-disable react/jsx-no-useless-fragment */
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Text,
  Tooltip,
  useClipboard,
} from '@chakra-ui/react';
import { FC, useMemo, useState } from 'react';
import { BsChat } from 'react-icons/bs';

import { GithubIcon } from 'components/Icons/GithubIcon';
import {
  DelegatedTokensByNetwork,
  DelegatedTokensByTrack,
} from 'components/Popovers';
import { useDAO, useDelegates } from 'contexts';
import { IBreakdownProps } from 'contexts/scoreBreakdown';
import { DELEGATOR_TRACKER_NOT_SUPPORTED_DAOS, LINKS } from 'helpers';
import { useToasty } from 'hooks';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import pluralize from 'pluralize';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { HiUserGroup } from 'react-icons/hi';
import { IoIosCheckboxOutline } from 'react-icons/io';
import { IoCopy, IoPersonOutline } from 'react-icons/io5';
import { ICardStat, ICustomFields, IDelegate } from 'types';
import {
  convertHexToRGBA,
  formatDate,
  formatNumber,
  formatNumberPercentage,
  truncateAddress,
} from 'utils';
import { ChakraLink } from 'components/ChakraLink';
import { HandlesTooltip } from 'components/HandlesTooltip';
import { DelegateButton } from '../DelegateButton';
import { ThreadIcon, WebsiteIcon } from '../Icons';
import { ImgWithFallback } from '../ImgWithFallback';
import { ExpandableCardText } from './ExpandableCardText';
import { StatsCarousel } from './StatsCarousel';

const DelegateStat = dynamic(() =>
  import('./DelegateStat').then(module => module.DelegateStat)
);

const ScoreStat = dynamic(() =>
  import('./ScoreStat').then(module => module.ScoreStat)
);

const StatPopover = dynamic(() =>
  import('./StatPopover').then(module => module.StatPopover)
);

const UserInfoButton = dynamic(() =>
  import('components/UserInfoButton').then(module => module.UserInfoButton)
);

interface IStatCasesProps {
  statItem: ICardStat;
  canShowBreakdown: boolean;
  daoName: string;
  delegateAddress: string;
}

const StatCases: FC<IStatCasesProps> = ({
  statItem,
  canShowBreakdown,
  daoName,
  delegateAddress,
}) => {
  const { daoInfo } = useDAO();
  const daoNotSupportDelegatorPage = DELEGATOR_TRACKER_NOT_SUPPORTED_DAOS.find(
    dao => dao === daoName
  );
  if (statItem.id === 'delegatorCount' && !daoNotSupportDelegatorPage)
    return (
      <Link
        background="transparent"
        href={`https://karmahq.xyz/dao/${daoName}/delegators/${delegateAddress}`}
        h="max-content"
        isExternal
        cursor="pointer"
        w="full"
        maxW="max-content"
        _hover={{
          opacity: 0.75,
        }}
      >
        <DelegateStat stat={statItem} />
      </Link>
    );
  if (
    statItem.id === 'delegatedVotes' &&
    daoInfo.config.DELEGATED_VOTES_BREAKDOWN_BY_NETWORK &&
    statItem.value !== '-' &&
    statItem.value !== '0'
  )
    return (
      <DelegatedTokensByNetwork delegateAddress={delegateAddress}>
        <DelegateStat stat={statItem} disableTooltip />
      </DelegatedTokensByNetwork>
    );
  if (
    statItem.id === 'delegatedVotes' &&
    daoInfo.config.DELEGATED_VOTES_BREAKDOWN_BY_TRACKS &&
    statItem.value !== '-' &&
    statItem.value !== '0'
  )
    return (
      <DelegatedTokensByTrack delegateAddress={delegateAddress}>
        <DelegateStat stat={statItem} disableTooltip />
      </DelegatedTokensByTrack>
    );
  if (
    (statItem.id === 'forumScore' && canShowBreakdown) ||
    (statItem.id !== 'forumScore' && statItem.statAction)
  )
    return (
      <Box
        role="button"
        background="transparent"
        onClick={() => statItem.statAction?.()}
        _hover={{}}
        h="max-content"
      >
        <DelegateStat stat={statItem} underline={canShowBreakdown} />
      </Box>
    );

  return <DelegateStat stat={statItem} />;
};

interface IDelegateCardProps {
  data?: IDelegate;
  onModalOpen?: (user: IBreakdownProps) => void;
}

export const DelegateCard: FC<IDelegateCardProps> = props => {
  const { data } = props;
  const { daoInfo, theme, daoData } = useDAO();
  const { selectProfile, period, setSelectedProfileData } = useDelegates();
  const { onCopy } = useClipboard(data?.address || '');
  const [isInterestsOpen, setIsInterestsOpen] = useState(false);

  const { config } = daoInfo;
  const isLoaded = !!data;

  const getScore = () => {
    if (data?.gitcoinHealthScore) return formatNumber(data.gitcoinHealthScore);
    if (data?.karmaScore && daoInfo.config.DAO_KARMA_ID !== 'gitcoin')
      return formatNumber(data?.karmaScore);
    return '-';
  };

  const karmaScoreType = (
    scoreType: IBreakdownProps['type']
  ): IBreakdownProps['type'] => {
    if (scoreType === 'forumScore') return scoreType;

    return daoInfo.config.DAO_KARMA_ID === 'gitcoin'
      ? 'gitcoinHealthScore'
      : 'karmaScore';
  };

  const openScoreBreakdown = (scoreType: IBreakdownProps['type']) => {
    const { onModalOpen } = props;
    if (data)
      onModalOpen?.({
        address: data.address,
        period,
        type: karmaScoreType(scoreType),
      });
  };

  const allStats: ICardStat[] = [
    {
      title: 'Total Delegators',
      icon: BsChat,
      value: data?.delegatorCount ? formatNumber(data.delegatorCount) : '-',
      id: 'delegatorCount',
      // tooltipText: 'Total of delegators for this delegate',
    },
    {
      title: 'Voting Power',
      icon: IoIosCheckboxOutline,
      value: data?.delegatedVotes ? formatNumber(data?.delegatedVotes) : '-',
      id: 'delegatedVotes',
      tooltipText: `Total voting power`,
    },
    {
      title: 'Snapshot pct.',
      icon: AiOutlineThunderbolt,
      pct: data?.voteParticipation.offChain
        ? `${data.voteParticipation.offChain}%`
        : '-',
      value: data?.voteParticipation.offChain
        ? `${data.voteParticipation.offChain}%`
        : '-',
      id: 'offChainVotesPct',
      tooltipText: `Contributor's voting % for off-chain (snapshot) proposals`,
    },
    {
      title: 'On-chain votes',
      icon: AiOutlineThunderbolt,
      value: data?.voteParticipation.onChain
        ? `${data.voteParticipation.onChain}%`
        : '-',
      id: 'onChainVotesPct',
      tooltipText: `Contributor's voting % for on-chain proposals`,
    },
    {
      title: 'Forum score',
      icon: BsChat,
      value: data?.forumActivity ? formatNumber(data.forumActivity) : '-',
      id: 'forumScore',
      tooltipText: 'Score based on their contribution in the forum',
      statAction: () => {
        openScoreBreakdown('forumScore');
      },
    },
    {
      title: 'Discord Score',
      icon: BsChat,
      value: data?.discordScore ? formatNumber(data.discordScore) : '-',
      id: 'discordScore',
      tooltipText: 'Score based on their contribution in the discord',
    },
  ];

  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleIsExpanded = () => setIsExpanded(!isExpanded);

  const [stats, setStats] = useState<ICardStat[]>(allStats);

  const customFields: ICustomFields[] = data?.delegatePitch?.customFields || [];

  const emptyField: ICustomFields = { label: '', value: [] };

  const score: ICardStat = {
    title: 'Score',
    icon: IoPersonOutline,
    value: getScore(),
    id: 'karmaScore',
  };

  const getInterests = () => {
    const foundInterests = customFields?.find(
      item =>
        item.label === 'interests' ||
        item.label.toLowerCase().includes('interests')
    );
    if (!foundInterests) return emptyField;
    if (Array.isArray(foundInterests.value)) return foundInterests;
    const { value } = foundInterests;
    if (!value) return emptyField;
    return {
      label: 'Interests',
      value: value?.split(',') || [],
      displayAs: 'interests',
    };
  };

  const interests = getInterests();

  useMemo(() => {
    if (!config) return;
    let filtereds: ICardStat[] = [];

    allStats.forEach(item => {
      if (config.EXCLUDED_CARD_FIELDS.includes(item.id)) return;
      filtereds.push(item);
    });
    if (
      filtereds.find(
        item => item.id === 'offChainVotesPct' || item.id === 'onChainVotesPct'
      ) &&
      !config.EXCLUDED_CARD_FIELDS.includes('delegatedVotes')
    )
      filtereds.push({
        title: 'Voting Weight',
        icon: IoPersonOutline,
        value: data?.votingWeight
          ? `${formatNumberPercentage(data?.votingWeight)}`
          : '-',
        id: 'votingWeight',
        tooltipText: `Based on ${formatNumber(
          data?.delegatorCount || 0
        )} delegators`,
      });

    const order = [
      'delegatedVotes',
      'votingWeight',
      'delegatorCount',
      'offChainVotesPct',
      'onChainVotesPct',
      'forumScore',
      'karmaScore',
      'discordScore',
    ];

    if (config.DAO_DEFAULT_SETTINGS?.SORT_ORDER) {
      const customOrder = config.DAO_DEFAULT_SETTINGS?.SORT_ORDER;
      filtereds.sort(
        (one, two) => customOrder.indexOf(one.id) - customOrder.indexOf(two.id)
      );
    } else {
      filtereds.sort(
        (one, two) => order.indexOf(one.id) - order.indexOf(two.id)
      );
    }

    if (router.query.site === 'op') {
      const randomId = Math.floor(Math.random() * 3);
      data?.workstreams?.push({
        id: randomId,
        name: ['Tooling', 'DeFi', 'Governance'][randomId],
        description: ['Tooling', 'DeFi', 'Governance'][randomId],
      });
    }

    if (config.SHOULD_NOT_SHOW?.includes('stats')) filtereds = [];

    setStats(filtereds);
  }, [config, data]);

  const renderCategory = () => {
    const workstreamsExist =
      data?.workstreams &&
      data.workstreams.length > 0 &&
      data.workstreams[0]?.description.toLowerCase() !== 'general';
    const tracksExist = data?.tracks && data.tracks.length > 0;

    if (!workstreamsExist && !tracksExist) {
      return undefined;
    }

    const type = daoInfo.config.DAO_CATEGORIES_TYPE;

    return (
      <Popover>
        <PopoverTrigger>
          <Button
            textDecoration="underline"
            color={theme.card.workstream.text}
            bgColor={theme.card.workstream.bg}
            px="2"
            py="1"
            borderRadius="md"
            fontSize="12px"
            fontWeight="medium"
            _hover={{
              backgroundColor: convertHexToRGBA(theme.title, 0.8),
            }}
            h="26px"
            w="full"
            maxW="max-content"
          >
            {data?.[type]?.length === 1
              ? data?.[type]?.[0]?.name
              : `${data?.[type]?.length}${' '}${pluralize(
                  type.slice(0, 1).toUpperCase() + type.slice(1),
                  data?.[type]?.length || 0
                )}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent bg={theme.card.background}>
          <PopoverArrow bg={theme.card.border} />
          <PopoverCloseButton color={theme.card.text.primary} />
          <Flex flexDir="row" gap="2" w="full">
            {type === 'tracks' ? (
              <StatsCarousel
                items={
                  data?.tracks?.map(track => ({
                    id: track.id.toString(),
                    component: (
                      <Flex flexDir="column" gap="2" w="full" key={track.id}>
                        <PopoverHeader
                          borderBottom="none"
                          color={theme.card.text.primary}
                          fontWeight={600}
                        >
                          {daoInfo.config.TRACKS_DICTIONARY &&
                          daoInfo.config.TRACKS_DICTIONARY[track.name]
                            ? daoInfo.config.TRACKS_DICTIONARY[track.name].emoji
                            : undefined}{' '}
                          {track.name}
                        </PopoverHeader>
                        <PopoverBody color={theme.card.text.primary}>
                          {daoInfo.config.TRACKS_DICTIONARY &&
                          daoInfo.config.TRACKS_DICTIONARY[track.name]
                            ? daoInfo.config.TRACKS_DICTIONARY[track.name]
                                .description
                            : undefined}
                        </PopoverBody>
                      </Flex>
                    ),
                  })) || []
                }
                controlStyle={{
                  marginTop: '16px',
                  marginBottom: '8px',
                }}
              />
            ) : (
              <StatsCarousel
                items={
                  data?.[type]?.map(item => ({
                    id: item.id.toString(),
                    component: (
                      <Flex flexDir="column" gap="2" w="full" key={item.id}>
                        <PopoverHeader
                          borderBottom="none"
                          color={theme.card.text.primary}
                        >
                          {item.name}
                        </PopoverHeader>
                        <PopoverBody color={theme.card.text.primary}>
                          {item.description}
                        </PopoverBody>
                      </Flex>
                    ),
                  })) || []
                }
                controlStyle={{
                  marginTop: '16px',
                  marginBottom: '8px',
                }}
              />
            )}
          </Flex>
        </PopoverContent>
      </Popover>
    );
  };

  const shortAddress = data && truncateAddress(data.address);

  const checkIfDelegate = () =>
    !!daoInfo.config.DAO_DELEGATE_CONTRACT ||
    daoInfo.config.ALLOW_BULK_DELEGATE;

  const canDelegate = checkIfDelegate();

  const findStatement = customFields.find(
    item =>
      item?.displayAs === 'headline' ||
      item?.label?.toLowerCase() === 'statement'
  )?.value;

  const userStatement = Array.isArray(findStatement)
    ? findStatement[0]
    : findStatement;

  const { toast } = useToasty();
  const copyText = () => {
    onCopy();
    toast({
      title: 'Copied to clipboard',
      description: 'Address copied',
      duration: 3000,
    });
  };
  const { rootPathname } = useDAO();

  const statRows = () => {
    const FIRST_ROW_LENGTH = 3;
    const SEQUENTIAL_ROWS_LENGTH = 3;

    const firstRow = stats.slice(0, FIRST_ROW_LENGTH);
    const rows = [firstRow];

    // split stats after FIRST_ROW_LENGTH
    const restStats = stats.slice(FIRST_ROW_LENGTH, stats.length);

    for (let i = 0; i < restStats.length; i += SEQUENTIAL_ROWS_LENGTH) {
      rows.push(restStats.slice(i, i + SEQUENTIAL_ROWS_LENGTH));
    }

    return rows;
  };

  const getDataStatusColor = (status: string) => {
    if (status === 'inactive' || status === 'withdrawn') return '#F4EB0F';
    return '#59CE7B';
  };

  const handleAddToDelegatePool = (delegate: IDelegate) => {
    setSelectedProfileData(delegate);
  };
  const shouldShowForumHandle =
    data?.discourseHandles &&
    data.discourseHandles.length > 0 &&
    daoData?.socialLinks.forum &&
    config.DAO_FORUM_TYPE;

  return (
    <Flex
      bg={theme.card.background}
      flexDir="column"
      borderRadius="16"
      flex="1"
      gap="2"
      justifyContent="space-between"
      boxShadow={theme.card.shadow}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={theme.card.border}
      w="full"
      minWidth="min-content"
      maxW={{ base: 'full', sm: '380px', lg: '460px' }}
      minH="full"
      h={{
        base: 'full',
        sm: 'full',
      }}
    >
      <Flex
        flexDir="row"
        gap={{ base: '2', md: '4' }}
        w="full"
        align="flex-start"
        px={{ base: '14px', lg: '5', xl: '4' }}
        pt={{ base: '5', lg: '5' }}
      >
        <Flex
          h={['42px', '48px', '54px']}
          w={['42px', '48px', '54px']}
          position="relative"
        >
          {isLoaded && data ? (
            <Flex
              minH={['42px', '48px', '54px']}
              minW={['42px', '48px', '54px']}
              h={['42px', '48px', '54px']}
              w={['42px', '48px', '54px']}
            >
              <ChakraLink
                href={LINKS.PROFILE(
                  rootPathname,
                  data.ensName || data.address,
                  'overview'
                )}
              >
                <ImgWithFallback
                  h={['42px', '48px', '54px']}
                  w={['42px', '48px', '54px']}
                  borderRadius="full"
                  src={
                    data.profilePicture ||
                    `${config.IMAGE_PREFIX_URL}${data.address}`
                  }
                  fallback={data.address}
                  cursor="pointer"
                />
              </ChakraLink>
            </Flex>
          ) : (
            <Flex
              minH={['48px', '54px']}
              minW={['48px', '54px']}
              h={['48px', '54px']}
              w={['48px', '54px']}
            >
              <SkeletonCircle
                h={['48px', '54px']}
                w={['48px', '54px']}
                borderRadius="full"
              />
            </Flex>
          )}
          <Tooltip
            label={
              data?.status ? (
                <Flex gap="1" align="center">
                  <Text fontWeight="400" fontSize="13px" color={theme.title}>
                    {data?.status
                      ? `${data?.status
                          .charAt(0)
                          .toUpperCase()}${data?.status.slice(1)}`
                      : 'Active'}
                  </Text>
                </Flex>
              ) : null
            }
            color={theme.card.interests.text}
            bg={theme.background}
            hasArrow
            placement="top"
            boxShadow="2xl"
            border="1px solid"
            borderColor={theme.card.border}
            arrowShadowColor={theme.card.border}
          >
            <Flex
              borderRadius="full"
              w="12px"
              h="12px"
              backgroundColor={getDataStatusColor(data?.status || 'active')}
              position="absolute"
              top={['4px']}
              right={{ base: '0px', md: '2px' }}
              border="2px solid white"
            />
          </Tooltip>
        </Flex>
        <Flex
          w="full"
          justifyContent="space-between"
          align="flex-start"
          position="relative"
        >
          <Flex
            flexDir="column"
            gap="1"
            justify="center"
            w="max-content"
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="break-spaces"
          >
            {isLoaded && data ? (
              <>
                <ChakraLink
                  isExternal
                  href={LINKS.PROFILE(
                    rootPathname,
                    data.ensName || data.address,
                    'overview'
                  )}
                >
                  <Text
                    color={theme.title}
                    fontSize="lg"
                    fontWeight="bold"
                    maxH="30px"
                    maxW={{ base: '200px', lg: '250px' }}
                    textOverflow="ellipsis"
                    overflow="hidden"
                    whiteSpace="nowrap"
                    cursor="pointer"
                  >
                    {data.realName || data.ensName || shortAddress}
                  </Text>
                </ChakraLink>
                <Flex flexDir="row" color={theme.subtitle} gap="1.5">
                  <Text fontSize="xs" fontWeight="medium">
                    {shortAddress}
                  </Text>
                  <Button
                    bg="transparent"
                    py="0"
                    px="0"
                    _hover={{
                      opacity: 0.7,
                    }}
                    _active={{}}
                    _focus={{}}
                    onClick={copyText}
                    h="max-content"
                    w="min-content"
                    minW="min-content"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={IoCopy} color={theme.subtitle} boxSize="4" />
                  </Button>
                  {data.delegateSince && (
                    <Flex flexDir="row" gap="1.5" alignItems="center">
                      <Flex
                        w="3px"
                        h="3px"
                        bgColor={theme.subtitle}
                        borderRadius="full"
                      />
                      <Text fontSize={{ base: 'xs' }} fontWeight="medium">
                        Joined {formatDate(data.delegateSince)}
                      </Text>
                    </Flex>
                  )}
                </Flex>

                <Flex
                  flexDir="row"
                  gap="1.5"
                  overflowX="hidden"
                  width="100%"
                  maxW={{ base: '280px' }}
                  w="full"
                  align="center"
                >
                  {renderCategory()}
                  {!isLoaded ? (
                    <Flex h="26px" w="full" />
                  ) : !interests.value.length ? (
                    <Flex h="26px" w="full" />
                  ) : (
                    <Flex
                      w="full"
                      gap="1"
                      overflowX="hidden"
                      width="100%"
                      flex="1"
                      minH="26px"
                      h="full"
                      cursor="pointer"
                    >
                      <Popover
                        isOpen={isInterestsOpen}
                        onOpen={() => setIsInterestsOpen(true)}
                        onClose={() => setIsInterestsOpen(false)}
                        closeOnEsc
                        closeOnBlur
                      >
                        <PopoverTrigger>
                          <Box
                            color={theme.card.text.primary}
                            bgColor={theme.card.background}
                            boxShadow="2xl"
                            pointerEvents="all"
                            onMouseEnter={() => setIsInterestsOpen(true)}
                            onMouseLeave={() => setIsInterestsOpen(false)}
                            transition="all 0.2s ease-in-out"
                            onClick={() => setIsInterestsOpen(true)}
                            userSelect="none"
                          >
                            <Text
                              color={theme.card.workstream.text}
                              bgColor={theme.card.workstream.bg}
                              px="2"
                              py="1"
                              borderRadius="md"
                              fontSize="12px"
                              fontWeight="medium"
                              h="full"
                              maxH="26px"
                              textOverflow="ellipsis"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              _hover={{
                                opacity: 0.8,
                              }}
                            >
                              {interests.value.length}{' '}
                              {pluralize('Interest', interests.value.length)}
                            </Text>
                          </Box>
                        </PopoverTrigger>
                        <PopoverContent w="max-content">
                          <PopoverArrow
                            color={theme.card.interests.text}
                            bg={theme.background}
                          />
                          <PopoverBody bg={theme.card.background}>
                            <Flex
                              flexDir="column"
                              gap="1"
                              py="1"
                              borderRadius="lg"
                              color={theme.card.text.primary}
                              bgColor={theme.card.background}
                            >
                              {typeof interests.value === 'string' ? (
                                <Text color={theme.card.text.primary}>
                                  {interests.value}
                                </Text>
                              ) : (
                                interests.value?.map?.(interest => (
                                  <Text
                                    key={interest}
                                    color={theme.card.text.primary}
                                  >
                                    {interest}
                                  </Text>
                                ))
                              )}
                            </Flex>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </Flex>
                  )}
                </Flex>
              </>
            ) : (
              <>
                <Skeleton isLoaded={isLoaded}>SkeletonText</Skeleton>
                <Skeleton isLoaded={isLoaded}>SkeletonSubText</Skeleton>
              </>
            )}
          </Flex>
          <Flex flexDir="column" gap="3" align="center">
            {!config.EXCLUDED_CARD_FIELDS.includes('karmaScore') &&
              !config.SHOULD_NOT_SHOW?.includes('stats') && (
                <>
                  {isLoaded ? (
                    <Flex
                      cursor="pointer"
                      onClick={() => {
                        openScoreBreakdown('karmaScore');
                      }}
                    >
                      <ScoreStat stat={score} />
                    </Flex>
                  ) : (
                    <Skeleton w="16" h="8" />
                  )}
                </>
              )}
            {data?.status.toLowerCase() === 'community' ? (
              <Tooltip
                label="Community Delegate"
                bg={theme.collapse.bg || theme.card.background}
                color={theme.collapse.text}
              >
                <Flex>
                  <HiUserGroup
                    style={{
                      width: '20px',
                      height: '20px',
                      color: theme.card.text.primary,
                    }}
                  />
                </Flex>
              </Tooltip>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
      <Flex flexDir="column" justifyContent="space-between" h="full">
        <Flex
          flexDir="column"
          align="flex-start"
          justify="space-between"
          h="full"
          px={{ base: '3', lg: '5', xl: '4' }}
          flex="1"
        >
          {isLoaded ? (
            <Flex mb="4" flex="1">
              {userStatement ? (
                <Flex h="full" align="flex-start">
                  <ExpandableCardText
                    text={userStatement}
                    isExpanded={isExpanded}
                    toggleIsExpanded={toggleIsExpanded}
                    address={data.address}
                    color={theme.card.text.primary}
                  />
                </Flex>
              ) : (
                <>
                  {!(config.SHOULD_NOT_SHOW === 'overview') && <Text>-</Text>}
                </>
              )}
            </Flex>
          ) : (
            <SkeletonText h="full" w="full" />
          )}
          {!isExpanded && (
            <>
              {isLoaded ? (
                <>
                  <Flex
                    flexDir="column"
                    w="full"
                    align="center"
                    overflowX="auto"
                    gap="1"
                  >
                    <StatsCarousel
                      controlStyle={{
                        marginTop: '12px',
                      }}
                      items={statRows()?.map((item, index) => ({
                        id: index.toString(),
                        component: (
                          <Flex
                            key={index}
                            flexDir="row"
                            w="full"
                            align="center"
                            justify="center"
                            gap="4"
                            bgColor={theme.card.statBg}
                            borderRadius="8px"
                            boxShadow="0px 0px 6px rgba(255, 255, 255, 0.03)"
                            py="2"
                            maxW="full"
                          >
                            {item.map((statItem, itemIndex) => (
                              <StatCases
                                key={itemIndex}
                                statItem={statItem}
                                canShowBreakdown={
                                  !!data?.forumActivity &&
                                  !!daoData?.socialLinks.forum &&
                                  !!config.DAO_FORUM_TYPE
                                }
                                daoName={config.DAO_KARMA_ID}
                                delegateAddress={data.address}
                              />
                            ))}
                          </Flex>
                        ),
                      }))}
                    />
                  </Flex>
                </>
              ) : (
                <Skeleton w="full" h="full" />
              )}
            </>
          )}
        </Flex>

        <Divider borderColor={theme.card.divider} w="full" mt={{ base: '3' }} />
        <Flex
          flexDir="row"
          gap="3"
          mt={{ base: '3' }}
          h="max-content"
          px={{ base: '14px', lg: '5', xl: '4' }}
          pb={{ base: '5', lg: '5' }}
          align="center"
          justify="space-between"
          w="full"
        >
          {isLoaded ? (
            <Flex flexDir="row" justifyContent="space-between" w="full" gap="3">
              <Flex flexDir="row" gap="3">
                {canDelegate &&
                  (data?.status === 'withdrawn' ? (
                    <Tooltip
                      label="This delegate has indicated that they are no longer accepting delegations."
                      bg={theme.collapse.bg || theme.card.background}
                      color={theme.collapse.text}
                    >
                      <Flex>
                        <DelegateButton
                          delegated={data.address}
                          disabled
                          isDisabled
                        />
                      </Flex>
                    </Tooltip>
                  ) : (
                    <DelegateButton
                      delegated={data.address}
                      px={['4', '8']}
                      beforeOnClick={() => {
                        if (config.ALLOW_BULK_DELEGATE) {
                          handleAddToDelegatePool(data);
                        } else {
                          setSelectedProfileData(data);
                        }
                      }}
                    />
                  ))}
                <UserInfoButton onOpen={selectProfile} profile={data} />
              </Flex>
              <Flex gap="4" align="center" justify="center">
                {data?.website &&
                  !(
                    data.twitterHandle &&
                    shouldShowForumHandle &&
                    data.discordUsername
                  ) && (
                    <Link
                      href={data.website}
                      isExternal
                      color={theme.card.socialMedia}
                      _hover={{
                        transform: 'scale(1.25)',
                      }}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      h="max-content"
                    >
                      <WebsiteIcon w="17px" h="17px" />
                    </Link>
                  )}
                {data?.githubHandle && (
                  <Link
                    href={`https://github.com/${data.githubHandle}`}
                    isExternal
                    color={theme.card.socialMedia}
                    _hover={{
                      transform: 'scale(1.25)',
                    }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="max-content"
                  >
                    <GithubIcon w="17px" h="17px" />
                  </Link>
                )}
                {/* {data?.twitterHandle && (
                  <Link
                    href={`https://twitter.com/${data.twitterHandle}`}
                    isExternal
                    color={theme.card.socialMedia}
                    _hover={{
                      transform: 'scale(1.25)',
                    }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="max-content"
                  >
                    <TwitterIcon w="17px" h="17px" />
                  </Link>
                )} */}
                {data?.discourseHandles &&
                  data?.discourseHandles?.length > 0 &&
                  daoData?.socialLinks.forum &&
                  config.DAO_FORUM_TYPE && (
                    <HandlesTooltip
                      handles={data.discourseHandles}
                      iconProps={{
                        boxSize: '17px',
                      }}
                    />
                  )}

                {data.discordUsername && (
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        color={theme.card.socialMedia}
                        _hover={{
                          transform: 'scale(1.25)',
                        }}
                        h="max-content"
                        w="min-content"
                        minW="min-content"
                        maxW="min-content"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        px="0"
                        bg="transparent"
                        _active={{}}
                        _focus={{}}
                        _focusWithin={{}}
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      w="max-content"
                      color={theme.card.interests.text}
                      bg={theme.background}
                    >
                      <PopoverArrow
                        color={theme.card.interests.text}
                        bg={theme.background}
                      />
                      <PopoverBody>{data.discordUsername}</PopoverBody>
                    </PopoverContent>
                  </Popover>
                )}
                {data?.discussionThread && (
                  <Link
                    href={data.discussionThread}
                    isExternal
                    color={theme.card.socialMedia}
                    _hover={{
                      transform: 'scale(1.25)',
                    }}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    h="max-content"
                  >
                    <ThreadIcon w="17px" h="17px" />
                  </Link>
                )}
              </Flex>
            </Flex>
          ) : (
            <>
              <Skeleton isLoaded={isLoaded} w="full" h="12">
                SkeletonText
              </Skeleton>
              <Skeleton isLoaded={isLoaded} w="full" h="12">
                SkeletonText
              </Skeleton>
              <Skeleton isLoaded={isLoaded} w="full" h="12">
                SkeletonText
              </Skeleton>
            </>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};
