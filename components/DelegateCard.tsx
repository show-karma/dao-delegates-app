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
import { FC, useState, useMemo } from 'react';
import { BsCalendar4, BsChat, BsTwitter } from 'react-icons/bs';
import { IoPersonOutline } from 'react-icons/io5';
import { IoIosCheckboxOutline } from 'react-icons/io';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { IDelegate } from 'types';
import { useDAO, useDelegates } from 'contexts';
import { formatDate, formatNumber, truncateAddress } from 'utils';
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

export const DelegateCard: FC<IDelegateCardProps> = props => {
  const { data } = props;
  const { daoInfo, theme } = useDAO();
  const { selectProfile } = useDelegates();

  const { config } = daoInfo;
  const isLoaded = !!data;
  const allStats: IStat[] = [
    {
      title: 'Voting weight',
      icon: IoIosCheckboxOutline,
      value: data?.votingWeight ? formatNumber(data.votingWeight) : '-',
      id: 'delegatedVotes',
    },
    {
      title: 'Forum activity',
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
      title: 'Delegates since',
      icon: BsCalendar4,
      value: data?.delegateSince ? formatDate(data.delegateSince) : '-',
      id: 'delegateSince',
    },
    {
      title: 'Off-chain votes',
      icon: AiOutlineThunderbolt,
      pct: data?.voteParticipation.offChain
        ? `${data.voteParticipation.offChain}%`
        : '-',
      value: data?.voteParticipation.offChain
        ? data.voteParticipation.offChain.toString()
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
        ? data.voteParticipation.onChain.toString()
        : '-',
      id: 'onChainVotesPct',
    },
  ];

  const [stats, setStats] = useState(allStats);
  const [featuredStats, setFeaturedStats] = useState([] as IStat[]);

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

    setFeaturedStats(featureds);
    setStats(filtereds);
  }, [config]);

  const renderPctCase = (stat: IStat) => {
    if (stat.pct)
      return (
        <Text
          color={theme.card.text.primary}
          fontFamily="heading"
          fontSize={['xl', '3xl']}
          fontWeight="bold"
          lineHeight="shorter"
        >
          {stat.pct}
        </Text>
      );
    return (
      <Text
        color={theme.card.text.primary}
        fontFamily="heading"
        fontSize={['md', 'lg']}
        fontWeight="semibold"
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

  // console.log(data);

  return (
    <Flex
      bgColor={theme.card.background}
      flexDir="column"
      px={{ base: '4', sm: '6' }}
      py={{ base: '4', sm: '6' }}
      borderRadius="16"
      maxW={['full', '28rem']}
      flex="1"
      gap="8"
      boxShadow={theme.card.shadow}
      minH="max-content"
      borderWidth="1px"
      borderStyle="solid"
      borderColor={theme.card.border}
    >
      <Flex flexDir="row" gap={['4']} w="full" align="center">
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
              src={`${config.IMAGE_PREFIX_URL}${data.address}`}
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
              >
                {data.ensName || shortAddress}
              </Text>
              <Text
                color={theme.subtitle}
                fontSize={['md', 'lg']}
                fontWeight="medium"
              >
                {shortAddress}
              </Text>
            </>
          ) : (
            <>
              <Skeleton isLoaded={isLoaded}>SkeletonText</Skeleton>
              <Skeleton isLoaded={isLoaded}>SkeletonSubText</Skeleton>
            </>
          )}
        </Flex>
        {data?.twitterHandle && (
          <Link href={`https://twitter.com/${data.twitterHandle}`} isExternal>
            <Icon as={BsTwitter} w="5" h="5" color={theme.card.icon} />
          </Link>
        )}
      </Flex>
      <Flex gap="4" flexDir="column">
        <Divider borderColor={theme.card.divider} w="full" />
        <Flex flexDir={['row']} justify="space-between" gap="2">
          {featuredStats.map((stat, index) => (
            <Flex
              key={+index}
              gap={['1', '2']}
              pl="4"
              pr="4"
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
                    {renderPctCase(stat)}
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
            >
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
                  >
                    {stat.value}
                  </Text>
                </Flex>
              </Flex>
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
        {canDelegate && (
          <Flex justify="left" align="center" gap="6">
            {isLoaded ? (
              <>
                <DelegateButton delegated={data.address} />
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
