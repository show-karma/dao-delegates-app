/* eslint-disable react/jsx-no-useless-fragment */
import {
  Divider,
  Flex,
  Grid,
  GridItem,
  Icon,
  Link,
  Skeleton,
  SkeletonCircle,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { FC, useState, useMemo, useCallback } from 'react';
import { BsCalendar4, BsChat, BsTwitter } from 'react-icons/bs';
import { IoPersonOutline } from 'react-icons/io5';
import { IoIosCheckboxOutline } from 'react-icons/io';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { FaDiscourse } from 'react-icons/fa';
import { BiPlanet } from 'react-icons/bi';
import { ICustomFields, IDelegate } from 'types';
import { useDAO, useDelegates } from 'contexts';
import {
  axiosInstance,
  formatDate,
  formatNumber,
  formatNumberPercentage,
  getUserForumUrl,
  truncateAddress,
} from 'utils';
import { useRouter } from 'next/router';
import { IconType } from 'react-icons/lib';
import { ImgWithFallback } from './ImgWithFallback';
import { DelegateButton } from './DelegateButton';
import { UserInfoButton } from './UserInfoButton';

interface IDelegateCardProps {
  data?: IDelegate;
}

interface IStat {
  title: string;
  icon: IconType;
  pct?: string;
  value: string;
  id: string;
}

const DelegateStat: FC<{ stat: IStat }> = ({ stat }) => {
  const { theme } = useDAO();
  return (
    <Flex gap="2" flexDir="row">
      <Icon as={stat.icon} h="6" w="6" color={theme.card.icon} />
      <Flex flexDir="column">
        <Text
          color={theme.card.text.secondary}
          fontSize="sm"
          fontWeight="light"
        >
          {stat.title}
        </Text>
        <Text
          color={theme.title}
          fontFamily="heading"
          fontSize={['md', 'lg']}
          fontWeight="bold"
          ml={stat.value === '-' ? '8' : '0'}
          textAlign="start"
          h="full"
          w="full"
        >
          {stat.value}
        </Text>
      </Flex>
    </Flex>
  );
};

export const DelegateCard: FC<IDelegateCardProps> = props => {
  const { data } = props;
  const { daoInfo, theme, daoData } = useDAO();
  const { DAO_KARMA_ID, DAO_DEFAULT_SETTINGS } = daoInfo.config;
  const { selectProfile } = useDelegates();

  const { config } = daoInfo;
  const isLoaded = !!data;
  const allStats: IStat[] = [
    {
      title: 'Voting weight',
      icon: IoIosCheckboxOutline,
      pct: data?.votingWeight ? formatNumberPercentage(data.votingWeight) : '-',
      value: data?.delegatedVotes ? formatNumber(data?.delegatedVotes) : '-',
      id: 'delegatedVotes',
    },
    {
      title: 'Snapshot votes',
      icon: AiOutlineThunderbolt,
      pct: data?.voteParticipation.offChain
        ? `${data.voteParticipation.offChain}%`
        : '-',
      value: data?.voteParticipation.offChain
        ? `${data.voteParticipation.offChain}%`
        : '-',
      id: 'offChainVotesPct',
    },
    {
      title: 'On-chain votes',
      icon: AiOutlineThunderbolt,
      pct: data?.voteParticipation.onChain
        ? `${data.voteParticipation.onChain}%`
        : '-',
      value: data?.voteParticipation.onChain
        ? `${data.voteParticipation.onChain}%`
        : '-',
      id: 'onChainVotesPct',
    },
    {
      title: 'Forum score',
      icon: BsChat,
      value: data?.forumActivity ? formatNumber(data.forumActivity) : '-',
      id: 'forumScore',
    },
    {
      title: 'Delegators',
      icon: IoPersonOutline,
      value: data?.delegators ? formatNumber(data.delegators) : '-',
      id: 'delegators',
    },
    {
      title: 'Delegate since',
      icon: BsCalendar4,
      value: data?.delegateSince ? formatDate(data.delegateSince) : '-',
      id: 'delegateSince',
    },
  ];

  const router = useRouter();

  const [isOverflowingInterest, setIsOverflowingInterest] = useState(false);
  const [stats, setStats] = useState<IStat[]>(allStats);
  const [featuredStats, setFeaturedStats] = useState([] as IStat[]);

  const {
    data: pitchData,
    isLoading: isLoadingPitchData,
    failureCount: pitchFailureCount,
  } = useQuery({
    queryKey: ['statement', data?.address],
    queryFn: () =>
      axiosInstance.get(
        `/forum-user/${DAO_KARMA_ID}/delegate-pitch/${data?.address}`
      ),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const customFields: ICustomFields[] =
    pitchData?.data.data.delegatePitch.customFields;
  const emptyField: ICustomFields = { label: '', value: [] };

  const interests =
    customFields?.find(
      item =>
        item.displayAs === 'interests' ||
        item.label.toLowerCase().includes('interests')
    ) || emptyField;

  useMemo(() => {
    if (!config) return;
    const featureds: IStat[] = [];
    const filtereds: IStat[] = [];

    allStats.forEach(stat => {
      if (config.FEATURED_CARD_FIELDS.includes(stat.id)) {
        featureds.push(stat);
        return;
      }
      if (config.EXCLUDED_CARD_FIELDS.includes(stat.id)) return;
      filtereds.push(stat);
    });
    if (router.query.site === 'op') {
      filtereds.push({
        title: 'Workstream',
        icon: BiPlanet,
        value: ['Tooling', 'DeFi', 'Governance', '-'][
          Math.floor(Math.random() * 4)
        ],
        id: 'workstream',
      });
    }
    if (DAO_KARMA_ID === 'gitcoin') {
      const gitcoinWorkstream = () => {
        if (!data?.workstreams?.length) return '-';
        if (data.workstreams[0]?.description.toLowerCase() === 'general') {
          if (data.workstreams.length === 1) return '';
          return data.workstreams[1]?.description || data.workstreams[1]?.name;
        }
        return data.workstreams[0]?.description || data.workstreams[0]?.name;
      };
      filtereds.push({
        title: 'Workstream',
        icon: BiPlanet,
        value: gitcoinWorkstream(),
        id: 'workstream',
      });
    }

    setFeaturedStats(featureds);
    setStats(filtereds);
  }, [config]);

  const renderPctCase = (stat: IStat) => {
    if (stat.pct !== '-' && stat.pct)
      return (
        <>
          <Text
            color={theme.card.text.primary}
            fontFamily="heading"
            fontSize={{ base: 'xl', lg: '2xl' }}
            fontWeight="bold"
            lineHeight="shorter"
          >
            {stat.pct}
          </Text>
          {stat.value && !stat.id.includes('Pct') && (
            <Text
              color={theme.card.text.primary}
              fontFamily="heading"
              fontSize={['md', 'lg']}
              fontWeight="semibold"
            >
              {stat.value}
            </Text>
          )}
        </>
      );

    return (
      <Text
        color={theme.card.text.primary}
        fontFamily="heading"
        fontSize={['xl', '2xl']}
        fontWeight="bold"
        lineHeight="shorter"
      >
        {stat.value}
      </Text>
    );
  };

  const shortAddress = data && truncateAddress(data.address);

  const checkIfDelegate = () => {
    if (daoInfo.config.DAO_DELEGATE_MODE === 'custom') {
      return !!daoInfo.ABI;
    }
    if (daoInfo.config.DAO_DELEGATE_MODE === 'snapshot') return true;
    return false;
  };

  const canDelegate = checkIfDelegate();

  const [interestsNumberToShow, setInterestsNumberToShow] = useState(4);
  const handleInterestOverflow = useCallback((ref: HTMLDivElement) => {
    if (ref?.clientHeight > 25 || ref?.scrollHeight > 25) {
      setIsOverflowingInterest(true);
      setInterestsNumberToShow(previous => previous - 1);
    }
  }, []);

  return (
    <Flex
      bgColor={theme.card.background}
      flexDir="column"
      px={{ base: '4', sm: '6' }}
      py={{ base: '4', sm: '6' }}
      borderRadius="16"
      flex="1"
      gap="2"
      justifyContent="space-between"
      boxShadow={theme.card.shadow}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={theme.card.border}
      w="full"
      minW="min-content"
      maxW="27rem"
      h="full"
      minH="max-content"
      maxH="600px"
    >
      <Flex flexDir="row" justify="space-between" w="full" align="center">
        <Flex flexDir="row" gap={['4']} w="full" align="flex-start">
          {data ? (
            <Flex
              minH={['48px', '64px']}
              minW={['48px', '64px']}
              h={['48px', '64px']}
              w={['48px', '64px']}
            >
              <ImgWithFallback
                h={['48px', '64px']}
                w={['48px', '64px']}
                borderRadius="full"
                src={
                  data.profilePicture ||
                  `${config.IMAGE_PREFIX_URL}${data.address}`
                }
                fallback={data.address}
                boxShadow="0px 0px 0px 2px white"
              />
            </Flex>
          ) : (
            <Flex
              minH={['48px', '64px']}
              minW={['48px', '64px']}
              h={['48px', '64px']}
              w={['48px', '64px']}
            >
              <SkeletonCircle
                h={['48px', '64px']}
                w={['48px', '64px']}
                borderRadius="full"
              />
            </Flex>
          )}
          <Flex
            flexDir="column"
            gap="0.5"
            justify="center"
            w="max-content"
            maxW={{ base: '160px', md: '190px' }}
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="break-spaces"
          >
            {data ? (
              <>
                <Text
                  color={theme.title}
                  fontSize={['lg', 'xl']}
                  fontWeight="medium"
                  maxH="30px"
                  maxW="full"
                  textOverflow="ellipsis"
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {data.realName || data.ensName || shortAddress}
                </Text>
                <Text
                  color={theme.subtitle}
                  fontSize={['md', 'lg']}
                  fontWeight="medium"
                >
                  {shortAddress}
                </Text>
                {data?.twitterHandle || data?.discourseHandle ? (
                  <Flex flexDir="row" gap="2">
                    {data?.twitterHandle && (
                      <Link
                        href={`https://twitter.com/${data.twitterHandle}`}
                        isExternal
                      >
                        <Icon
                          as={BsTwitter}
                          w="5"
                          h="5"
                          color={theme.card.icon}
                        />
                      </Link>
                    )}
                    {data?.discourseHandle &&
                      daoData?.socialLinks.forum &&
                      config.DAO_FORUM_TYPE && (
                        <Link
                          href={getUserForumUrl(
                            data.discourseHandle,
                            config.DAO_FORUM_TYPE,
                            daoData.socialLinks.forum
                          )}
                          isExternal
                        >
                          <Icon
                            as={FaDiscourse}
                            w="5"
                            h="5"
                            color={theme.card.icon}
                          />
                        </Link>
                      )}
                  </Flex>
                ) : (
                  <Flex w="5" h="5" />
                )}
              </>
            ) : (
              <>
                <Skeleton isLoaded={isLoaded}>SkeletonText</Skeleton>
                <Skeleton isLoaded={isLoaded}>SkeletonSubText</Skeleton>
              </>
            )}
          </Flex>
        </Flex>
        {DAO_DEFAULT_SETTINGS?.KARMA_SCORE && (
          <>
            {data ? (
              <Flex flexDir="column" align="end" w="max-content">
                <Text w="max-content" fontSize="2xl" lineHeight="shorter">
                  {config.DAO_KARMA_ID === 'gitcoin'
                    ? data?.gitcoinHealthScore
                    : data?.karmaScore}
                </Text>
                <Text
                  w="max-content"
                  fontSize="sm"
                  color={theme.card.text.secondary}
                >
                  {config.DAO_KARMA_ID === 'gitcoin'
                    ? 'Health Score'
                    : 'DAO Score'}
                </Text>
              </Flex>
            ) : (
              <Skeleton>Skeleton Text</Skeleton>
            )}
          </>
        )}
      </Flex>
      <Flex gap="4" flexDir="column">
        <Divider borderColor={theme.card.divider} w="full" />
        <Flex
          flexDir={['row']}
          justify={{ base: 'start', lg: 'space-between' }}
          gap="2"
          flexWrap="wrap"
        >
          {featuredStats.map((stat, index) => (
            <Flex
              key={+index}
              gap={['1', '2']}
              px="2"
              py="4"
              borderRadius="lg"
              bgColor={theme.card.featureStatBg}
              borderWidth="1px"
              borderStyle="solid"
              borderColor={
                theme.card.featureStatBg === 'transparent'
                  ? theme.card.border
                  : 'transparent'
              }
              w="full"
              flex="1"
              maxW="200"
            >
              {data ? (
                <Icon as={stat.icon} h="6" w="6" color={theme.card.icon} />
              ) : (
                <SkeletonCircle h="6" w="6" />
              )}
              <Flex flexDir="column">
                {data ? (
                  <>
                    <Text
                      color={theme.card.text.primary}
                      fontSize={['xs', 'sm']}
                      fontWeight="300"
                      width="full"
                    >
                      {stat.title}
                    </Text>
                    <Flex flexDir="column" color={theme.card.text.secondary}>
                      {renderPctCase(stat)}
                    </Flex>
                  </>
                ) : (
                  <>
                    <Skeleton isLoaded={isLoaded}>SkeletonText</Skeleton>
                    <Skeleton isLoaded={isLoaded}>SkeletonText</Skeleton>
                  </>
                )}
              </Flex>
            </Flex>
          ))}
        </Flex>
        <Divider borderColor={theme.card.divider} w="full" />
      </Flex>
      <Grid
        gridTemplateColumns={['1fr 1fr', '1fr 1fr']}
        w="full"
        gap="6"
        px={['0', '4']}
      >
        {stats.map((stat, index) =>
          isLoaded ? (
            <GridItem
              key={+index}
              alignContent="start"
              gap={['2', '4']}
              flexDir="column"
              w="max-content"
              maxW="180px"
            >
              {stat.id === 'forumScore' &&
              data?.discourseHandle &&
              daoData?.socialLinks.forum &&
              config.DAO_FORUM_TYPE ? (
                <Link
                  href={getUserForumUrl(
                    data.discourseHandle,
                    config.DAO_FORUM_TYPE,
                    daoData.socialLinks.forum
                  )}
                  isExternal
                  _hover={{}}
                >
                  <DelegateStat stat={stat} />
                </Link>
              ) : (
                <DelegateStat stat={stat} />
              )}
            </GridItem>
          ) : (
            <GridItem
              key={+index}
              alignContent="start"
              gap="4"
              flexDir="column"
              w="full"
            >
              <Flex gap="1" flexDir="column" w="full">
                <SkeletonCircle isLoaded={isLoaded} h="6" w="6">
                  SkeletonText
                </SkeletonCircle>
                <Skeleton isLoaded={isLoaded} w="full" h="6">
                  SkeletonText
                </Skeleton>
                <Skeleton isLoaded={isLoaded} w="full" h="6">
                  SkeletonText
                </Skeleton>
              </Flex>
            </GridItem>
          )
        )}
      </Grid>
      <Flex flexDir="column" gap="4">
        <Divider borderColor={theme.card.divider} w="full" />
        {isLoadingPitchData && !pitchFailureCount ? (
          <Skeleton w="full" h="1.5rem" />
        ) : (
          <>
            {interests.value.length > 0 ? (
              <Flex
                flexDir="row"
                flexWrap="wrap"
                rowGap="0"
                columnGap="2"
                textAlign="center"
                width="full"
                ref={handleInterestOverflow}
                maxH="21px"
                overflow="hidden"
              >
                <Text
                  color={theme.card.common}
                  fontSize="sm"
                  textAlign="center"
                >
                  Interests:
                </Text>
                {interests.value
                  .slice(0, interestsNumberToShow)
                  .map((interest, index) => {
                    const hasNext =
                      +index !== interests.value.length - 1 &&
                      index !== interestsNumberToShow - 1;
                    return (
                      <Flex
                        gap="2"
                        key={+index}
                        align-self="center"
                        align="center"
                        alignContent="center"
                      >
                        <Text color={theme.card.text.primary} fontSize="sm">
                          {interest[0].toUpperCase() + interest.substring(1)}
                        </Text>
                        {hasNext && (
                          <Text
                            color={theme.card.text.primary}
                            key={+index}
                            fontSize="0.4rem"
                            height="max-content"
                          >
                            -
                          </Text>
                        )}
                        {isOverflowingInterest}
                      </Flex>
                    );
                  })}
              </Flex>
            ) : (
              <Flex h="21px" />
            )}
          </>
        )}
        {canDelegate && (
          <Flex justify="left" align="center" gap="6">
            {isLoaded ? (
              <>
                <DelegateButton delegated={data.address} px={['4', '8']} />
                <UserInfoButton onOpen={selectProfile} profile={data} />
              </>
            ) : (
              <>
                <Skeleton isLoaded={isLoaded} w="36" h="12">
                  SkeletonText
                </Skeleton>
                <Skeleton isLoaded={isLoaded} w="36" h="12">
                  SkeletonText
                </Skeleton>
              </>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};
