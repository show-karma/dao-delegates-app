/* eslint-disable no-nested-ternary */
import {
  Box,
  Button,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Heading,
  Icon,
  Input,
  Skeleton,
  Spinner,
  Switch,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChakraLink } from 'components/ChakraLink';
import { FalseIcon } from 'components/Icons/Compensation/FalseIcon';
import { TrueIcon } from 'components/Icons/Compensation/TrueIcon';
import { useAuth, useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { API_ROUTES, KARMA_API } from 'helpers';
import { useToasty } from 'hooks';
import { DelegateCompensationAdminLayout } from 'layouts/delegateCompensationAdmin';
import dynamic from 'next/dynamic';
import { queryClient } from 'pages/_app';
import { useEffect, useState } from 'react';
import { HiExternalLink } from 'react-icons/hi';
import {
  ForumActivityBreakdown,
  ForumPosts,
} from 'types/delegate-compensation/forumActivity';
import { formatDate, formatNumber, formatSimpleNumber } from 'utils';
import { compensation } from 'utils/compensation';
import { getForumActivity } from 'utils/delegate-compensation/getForumActivity';
import { getProposals } from 'utils/delegate-compensation/getProposals';
import { DelegatePeriod } from '../DelegatePeriod';

type FeedbackRow = ForumActivityBreakdown & ForumPosts;

// eslint-disable-next-line import/no-extraneous-dependencies
const MDPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
});
export const DelegateCompensationAdminForumActivity = ({
  delegateAddress,
  isPublic = false,
}: {
  delegateAddress: string;
  isPublic?: boolean;
}) => {
  const { delegateInfo, refreshDelegateInfo } = useDelegateCompensation();
  const { selectedDate } = useDelegateCompensation();
  const { theme, daoInfo } = useDAO();
  const { isDaoAdmin: isAuthorized, authToken } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const { toast } = useToasty();

  const [rows, setRows] = useState<FeedbackRow[]>([]);

  const delegateFeedback = delegateInfo?.stats?.delegateFeedback;
  const forumPosts = delegateFeedback?.posts || [];
  const COMPENSATION_DATES =
    compensation.compensationDates[
      daoInfo.config.DAO_KARMA_ID as keyof typeof compensation.compensationDates
    ];

  const { data: proposalsData } = useQuery(
    [
      'delegate-compensation-proposals',
      selectedDate?.value.month,
      selectedDate?.value.year,
    ],
    () =>
      getProposals(
        daoInfo.config.DAO_KARMA_ID,
        selectedDate?.value.month as string | number,
        selectedDate?.value.year as string | number
      ),
    {
      initialData: {
        proposals: [],
        finished: false,
      },
      enabled:
        !!selectedDate?.value.month &&
        !!selectedDate?.value.year &&
        !!daoInfo.config.DAO_KARMA_ID,
    }
  );

  const isMonthFinished = proposalsData?.finished || false;

  const {
    data: posts,
    isLoading,
    isFetching,
    refetch,
  } = useQuery(
    [
      'delegate-compensation-forum-activity',
      delegateInfo?.publicAddress,
      daoInfo.config.DAO_KARMA_ID,
      selectedDate?.value.month,
      selectedDate?.value.year,
    ],
    () =>
      getForumActivity(
        delegateInfo?.publicAddress as string,
        daoInfo.config.DAO_KARMA_ID as string,
        selectedDate?.value.month,
        selectedDate?.value.year
      ),
    {
      enabled:
        !!selectedDate?.value.year &&
        !!selectedDate?.value.month &&
        !!delegateInfo?.publicAddress &&
        !!daoInfo.config.DAO_KARMA_ID,
      refetchOnWindowFocus: false,
    }
  );

  useEffect(() => {
    if (!posts?.length) return;
    const checkIfCommunicationThread = (postTitle: string) =>
      postTitle.toLowerCase().includes('communication thread');
    const setupRows = () => {
      const newRows =
        posts?.map((item: ForumPosts) => {
          const post = forumPosts.find(forumPost => forumPost.id === item.id);
          return {
            id: item.id,
            status:
              post?.status ||
              (checkIfCommunicationThread(item?.topic) ? 'invalid' : 'valid'),
            relevance: post?.relevance || 0,
            depthOfAnalysis: post?.depthOfAnalysis || 0,
            timing: post?.timing || 0,
            clarityAndCommunication: post?.clarityAndCommunication || 0,
            impactOnDecisionMaking: post?.impactOnDecisionMaking || 0,
            totalScore: post?.totalScore || 0,
            comment: item.comment,
            link: item.link,
            topic: item.topic,
            insight: item.insight,
            createdAt: item.createdAt,
          } as FeedbackRow;
        }) || [];
      setRows(newRows);
    };
    setupRows();
  }, [posts, delegateInfo]);

  const [presenceMultiplier, setPresenceMultiplier] = useState(
    delegateFeedback?.presenceMultiplier || 1
  );

  const columns = [
    { title: 'Relevance', id: 'relevance' },
    { title: 'Depth of Analysis', id: 'depthOfAnalysis' },
    { title: 'Timing', id: 'timing' },
    { title: 'Clarity & Communication', id: 'clarityAndCommunication' },
    { title: 'Impact', id: 'impactOnDecisionMaking' },
    { title: 'Valid', id: 'status', type: 'boolean' },
  ];

  const calculateFinalScore = (
    currentScores: Omit<ForumActivityBreakdown, 'id' | 'status' | 'totalScore'>,
    multiplier = presenceMultiplier
  ) => {
    // Calculate final scores
    const initialScore = Number(
      (
        currentScores.relevance +
        currentScores.depthOfAnalysis +
        currentScores.timing +
        currentScores.clarityAndCommunication +
        currentScores.impactOnDecisionMaking
      ).toFixed(1)
    );
    const finalScore = 1.5 * multiplier * initialScore;
    return finalScore > 30 ? 30 : Number(finalScore.toFixed(2));
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    let newValue = +value >= 5 ? 4 : +value || 0;
    if (newValue <= 0 || value === '') {
      newValue = 0;
    }
    if (Number.isNaN(newValue)) {
      newValue = 0;
    }
    const newArray = [...rows];
    if (field === 'status') {
      newArray[index].status = value as 'valid' | 'invalid';
    } else {
      const numericField = field as Exclude<
        keyof ForumActivityBreakdown,
        'id' | 'status'
      >;

      newArray[index][numericField] = newValue;
    }
    newArray[index].totalScore = calculateFinalScore(newArray[index]);

    setRows(newArray);
    setIsModified(true);
  };

  const changePresenceMultiplier = (value: string) => {
    let newValue = +value >= 2 ? 2 : +value || 0;
    if (newValue <= 0 || !newValue || Number.isNaN(newValue)) {
      newValue = 0;
    }
    setPresenceMultiplier(+value);
    setIsModified(true);
    const newArray = [...rows];
    newArray.forEach(post => {
      // eslint-disable-next-line no-param-reassign
      post.totalScore = calculateFinalScore(post, newValue);
    });
    setRows(newArray);
    setIsModified(true);
  };

  const saveFeedback = async () => {
    setIsSaving(true);
    try {
      const authorizedAPI = axios.create({
        timeout: 30000,
        baseURL: KARMA_API.base_url,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });

      const typedRows: ForumActivityBreakdown[] = rows.map(item => ({
        clarityAndCommunication: item.clarityAndCommunication,
        depthOfAnalysis: item.depthOfAnalysis,
        impactOnDecisionMaking: item.impactOnDecisionMaking,
        relevance: item.relevance,
        timing: item.timing,
        id: item.id,
        status: item.status,
        totalScore: item.totalScore,
      }));
      await authorizedAPI
        .put(
          API_ROUTES.DELEGATE.CHANGE_INCENTIVE_PROGRAM_STATS(
            daoInfo.config.DAO_KARMA_ID,
            delegateInfo?.id || ''
          ),
          {
            stats: {
              delegateFeedback: {
                ...delegateInfo?.stats.delegateFeedback,
                presenceMultiplier:
                  presenceMultiplier <= 0
                    ? 0
                    : presenceMultiplier >= 2
                    ? 2
                    : presenceMultiplier,
                posts: typedRows,
              },
            },
          }
        )
        .then(() => {
          toast({
            title: 'Success',
            description: 'Delegate feedback saved successfully',
          });
          refreshDelegateInfo();
          refetch();
          queryClient.invalidateQueries({
            queryKey: [
              'delegate-compensation-forum-activity',
              delegateInfo?.discourseHandles &&
              delegateInfo?.discourseHandles.length > 0
                ? delegateInfo?.discourseHandles[0]
                : delegateInfo?.publicAddress,
              selectedDate?.value.month,
              selectedDate?.value.year,
            ],
          });
        });
    } catch (error) {
      console.log(error);
      toast({
        title: 'Error',
        description: 'Failed to save delegate feedback',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const validRows = rows.filter(row => row.status === 'valid');
  const invalidRows = rows.filter(row => row.status !== 'valid');

  const averages = {
    relevance:
      +formatNumber(
        validRows.reduce((acc, curr) => acc + curr.relevance, 0) /
          validRows.length
      ) || 0,
    depthOfAnalysis:
      +formatNumber(
        validRows.reduce((acc, curr) => acc + curr.depthOfAnalysis, 0) /
          validRows.length
      ) || 0,
    timing:
      +formatNumber(
        validRows.reduce((acc, curr) => acc + curr.timing, 0) / validRows.length
      ) || 0,
    clarityAndCommunication:
      +formatNumber(
        validRows.reduce((acc, curr) => acc + curr.clarityAndCommunication, 0) /
          validRows.length
      ) || 0,
    impactOnDecisionMaking:
      +formatNumber(
        validRows.reduce((acc, curr) => acc + curr.impactOnDecisionMaking, 0) /
          validRows.length
      ) || 0,
  };

  const sumAverages = Object.values(averages)
    .reduce((acc, curr) => acc + curr, 0)
    .toFixed(2);

  return (
    <DelegateCompensationAdminLayout>
      <Box w="full">
        <Flex flexDir="column" gap="4">
          <Heading fontSize="xl" fontWeight="bold" color={theme.text} mb="4">
            Forum activity
          </Heading>
        </Flex>
        <DelegatePeriod
          delegate="block"
          period
          minimumPeriod={COMPENSATION_DATES.versions[1].startDate}
          maximumPeriod={
            isPublic ? new Date(COMPENSATION_DATES.AVAILABLE_MAX) : new Date()
          }
        />
        <Flex
          flexDir="row"
          gap="4"
          alignItems="center"
          justify="flex-start"
          my="4"
          flexWrap="wrap"
        >
          <Flex flexDir="column" gap="1" align="flex-start">
            <Text fontSize="18px" fontWeight={400}>
              Total posts
            </Text>
            <Skeleton isLoaded={!isLoading || !isFetching} w="64px" h="24px">
              <Text fontSize="16px" fontWeight={600}>
                {formatSimpleNumber(rows.length)}
              </Text>
            </Skeleton>
          </Flex>
          <Flex flexDir="column" gap="1" align="flex-start">
            <Text fontSize="18px" fontWeight={400}>
              Valid posts
            </Text>
            <Skeleton isLoaded={!isLoading || !isFetching} w="64px" h="24px">
              <Text fontSize="16px" fontWeight={600}>
                {formatSimpleNumber(validRows.length)}
              </Text>
            </Skeleton>
          </Flex>
          <Flex flexDir="column" gap="1" align="flex-start">
            <Text fontSize="18px" fontWeight={400}>
              Ignored posts
            </Text>
            <Skeleton isLoaded={!isLoading || !isFetching} w="64px" h="24px">
              <Text fontSize="16px" fontWeight={600}>
                {formatSimpleNumber(invalidRows.length)}
              </Text>
            </Skeleton>
          </Flex>
        </Flex>
        {isLoading || isFetching ? (
          <Flex py="4">
            <Spinner />
          </Flex>
        ) : rows?.length ? (
          <Flex flexDir="column" gap="4" w="full">
            <Flex w="full" overflowX="auto">
              <Table variant="simple" w="full">
                <Thead w="full">
                  <Tr
                    w="full"
                    borderBottom="1px solid"
                    borderBottomColor={theme.compensation?.card.dropdown}
                  >
                    <Th
                      borderBottom="1px solid"
                      borderBottomColor={theme.compensation?.card.dropdown}
                    >
                      Topic
                    </Th>
                    <Th
                      borderBottom="1px solid"
                      borderBottomColor={theme.compensation?.card.dropdown}
                    >
                      Comment
                    </Th>
                    <Th
                      borderBottom="1px solid"
                      borderBottomColor={theme.compensation?.card.dropdown}
                    >
                      Date
                    </Th>
                    {isAuthorized || isMonthFinished
                      ? columns.map(item => (
                          <Th
                            borderBottom="1px solid"
                            borderBottomColor={
                              theme.compensation?.card.dropdown
                            }
                            key={item.id}
                          >
                            {item.title}
                          </Th>
                        ))
                      : null}
                  </Tr>
                </Thead>

                <Tbody w="full">
                  {rows?.map((post, index) => {
                    const topicLink = `${post.link
                      .split('/')
                      .slice(0, -1)
                      .join('/')}/`;

                    const isValid = post.status === 'valid';

                    return (
                      <Tr
                        key={index}
                        w="full"
                        opacity={
                          isAuthorized || isMonthFinished
                            ? isValid
                              ? 1
                              : 0.75
                            : 1
                        }
                      >
                        <Td
                          borderBottom="1px solid"
                          borderBottomColor={theme.compensation?.card.dropdown}
                        >
                          <ChakraLink
                            isExternal
                            href={topicLink}
                            w="max-content"
                            color="blue.500"
                            textDecor="underline"
                            display="flex"
                            flexDir="row"
                            alignItems="center"
                            gap="2"
                            maxW={['240px', '400px']}
                            _hover={{
                              textDecoration: 'none',
                              borderColor: 'blue.400',
                            }}
                            noOfLines={2}
                          >
                            {post.topic}
                          </ChakraLink>
                        </Td>
                        <Td
                          borderBottom="1px solid"
                          borderBottomColor={theme.compensation?.card.dropdown}
                        >
                          <Flex flexDir="row" gap="2">
                            <Flex noOfLines={2} w="full">
                              <MDPreview
                                source={post.comment}
                                // disallowedElements={['a']}
                                components={{
                                  // eslint-disable-next-line id-length, react/no-unstable-nested-components
                                  a: ({ children }) => <Text>{children}</Text>,
                                }}
                              />
                            </Flex>
                            <ChakraLink
                              isExternal
                              href={post.link}
                              color="blue.500"
                              display="flex"
                              flexDir="row"
                              alignItems="center"
                              textDecor="underline"
                              gap="2"
                              _hover={{
                                borderColor: 'blue.300',
                              }}
                              w="max-content"
                              maxW="max-content"
                            >
                              <Icon as={HiExternalLink} boxSize="16px" />
                            </ChakraLink>
                          </Flex>
                        </Td>
                        <Td
                          w="200px"
                          minW="200px"
                          borderBottom="1px solid"
                          borderBottomColor={theme.compensation?.card.dropdown}
                        >
                          {formatDate(post?.createdAt, 'MMM D, YYYY')}
                        </Td>
                        {isAuthorized || isMonthFinished
                          ? columns.map(item => {
                              const stat =
                                post?.[item.id as keyof ForumActivityBreakdown];
                              if (item.type === 'read-only' || !isAuthorized) {
                                if (item.id === 'status') {
                                  return (
                                    <Td
                                      key={item.id + post.id}
                                      borderBottom="1px solid"
                                      borderBottomColor={
                                        theme.compensation?.card.dropdown
                                      }
                                    >
                                      {post.status === 'valid' ? (
                                        <TrueIcon
                                          w="24px"
                                          h="24px"
                                          color={
                                            theme.compensation?.card.success
                                          }
                                        />
                                      ) : (
                                        <FalseIcon
                                          w="24px"
                                          h="24px"
                                          color={theme.compensation?.card.error}
                                        />
                                      )}
                                    </Td>
                                  );
                                }

                                return (
                                  <Td
                                    key={item.id + post.id}
                                    borderBottom="1px solid"
                                    borderBottomColor={
                                      theme.compensation?.card.dropdown
                                    }
                                  >
                                    <Text
                                      fontSize="20px"
                                      fontWeight={700}
                                      color={
                                        theme.compensation?.card.secondaryText
                                      }
                                      lineHeight="32px"
                                      minW="60px"
                                      minH="32px"
                                      bg="transparent"
                                      textAlign="end"
                                      px="1"
                                    >
                                      {!isValid ? '-' : stat}
                                    </Text>
                                  </Td>
                                );
                              }
                              if (item.id === 'status') {
                                return (
                                  <Td
                                    key={item.id + post.id}
                                    borderBottom="1px solid"
                                    borderBottomColor={
                                      theme.compensation?.card.dropdown
                                    }
                                  >
                                    <Switch
                                      isChecked={post.status === 'valid'}
                                      defaultChecked={post.status === 'valid'}
                                      onChange={() => {
                                        const newArray = [...rows];
                                        newArray[index].status =
                                          newArray[index].status === 'valid'
                                            ? 'invalid'
                                            : 'valid';
                                        newArray[index].totalScore = 0;
                                        setRows(newArray);
                                        setIsModified(true);
                                      }}
                                      isDisabled={isSaving}
                                      disabled={isSaving}
                                    />
                                  </Td>
                                );
                              }
                              if (!isValid) {
                                return (
                                  <Td
                                    key={item.id + post.id}
                                    borderBottom="1px solid"
                                    borderBottomColor={
                                      theme.compensation?.card.dropdown
                                    }
                                  >
                                    <Flex align="center" justify="center">
                                      <Text
                                        fontSize="20px"
                                        fontWeight={700}
                                        color={
                                          theme.compensation?.card.secondaryText
                                        }
                                        lineHeight="32px"
                                        minW="60px"
                                        minH="32px"
                                        bg="transparent"
                                        textAlign="center"
                                        px="1"
                                      >
                                        {stat}
                                      </Text>
                                    </Flex>
                                  </Td>
                                );
                              }
                              return (
                                <Td
                                  key={item.id + post.id}
                                  borderBottom="1px solid"
                                  borderBottomColor={
                                    theme.compensation?.card.dropdown
                                  }
                                >
                                  <Flex align="center" justify="center">
                                    <Editable
                                      defaultValue={String(
                                        post?.[
                                          item.id as keyof ForumActivityBreakdown
                                        ]
                                      )}
                                      maxW="60px"
                                      w="60px"
                                    >
                                      <EditablePreview
                                        fontSize="20px"
                                        fontWeight={700}
                                        color={
                                          theme.compensation?.card.secondaryText
                                        }
                                        lineHeight="32px"
                                        cursor="pointer"
                                        textDecor="underline"
                                        minW="60px"
                                        minH="32px"
                                        bg="transparent"
                                        textAlign="center"
                                      />
                                      <EditableInput
                                        onChange={event => {
                                          handleInputChange(
                                            index,
                                            item.id,
                                            event.target.value
                                          );
                                        }}
                                        type="number"
                                        min={0}
                                        max={4}
                                        mr={2}
                                        bg={theme.compensation?.card.bg}
                                        w="full"
                                        fontSize="20px"
                                        fontWeight={700}
                                        color={
                                          theme.compensation?.card.secondaryText
                                        }
                                        lineHeight="32px"
                                        px="2"
                                        textAlign="center"
                                      />
                                    </Editable>
                                  </Flex>
                                </Td>
                              );
                            })
                          : null}
                      </Tr>
                    );
                  })}
                  {isAuthorized || isMonthFinished ? (
                    <Tr key="averages" w="full">
                      <Td border="none" />
                      <Td border="none" />
                      <Td border="none" />
                      {columns.map(item => {
                        const stat = averages[item.id as keyof typeof averages];
                        if (item.id === 'status') {
                          return (
                            <Td key={`${item.id}-total`} border="none">
                              <Flex
                                flexDir="column"
                                gap="0"
                                alignItems="center"
                              >
                                <Text
                                  fontSize="20px"
                                  fontWeight={700}
                                  color={theme.compensation?.card.secondaryText}
                                  lineHeight="32px"
                                  minH="32px"
                                  bg="transparent"
                                  textAlign="end"
                                  px="1"
                                >
                                  Total
                                </Text>
                                <Text
                                  fontSize="20px"
                                  fontWeight={700}
                                  color={theme.compensation?.card.secondaryText}
                                  lineHeight="32px"
                                  minH="32px"
                                  bg="transparent"
                                  textAlign="end"
                                  px="1"
                                >
                                  {sumAverages}
                                </Text>
                              </Flex>
                            </Td>
                          );
                        }
                        return (
                          <Td key={`${item.id}-average`} border="none">
                            <Text
                              fontSize="20px"
                              fontWeight={700}
                              color={theme.compensation?.card.secondaryText}
                              lineHeight="32px"
                              w="60px"
                              minH="32px"
                              bg="transparent"
                              textAlign="end"
                              px="1"
                            >
                              {stat || '-'}
                            </Text>
                          </Td>
                        );
                      })}
                    </Tr>
                  ) : null}
                </Tbody>
              </Table>
            </Flex>
            {isAuthorized || isMonthFinished ? (
              <Flex flexDir="column" gap="2" justify="center" alignItems="end">
                {proposalsData.finished ? null : (
                  <Flex w="full" justify="flex-end" align="flex-end">
                    <Text
                      fontSize="medium"
                      color={theme.compensation?.card.text}
                    >
                      ⚠️ These scores are subject to change and not finalized
                      yet.
                    </Text>
                  </Flex>
                )}

                <Flex flexDir="column" gap="1" alignItems="flex-end">
                  <Flex flexDir="row" gap="1" justify="flex-end">
                    <Tooltip
                      placement="top"
                      label={
                        <Text
                          fontSize="16px"
                          fontWeight={600}
                          color={theme.compensation?.card.secondaryText}
                        >
                          Final Score formula: Total * 30/20 * Presence
                          Multiplier
                        </Text>
                      }
                      hasArrow
                      bgColor={theme.compensation?.card.bg}
                      color={theme.compensation?.card.text}
                      fontWeight="normal"
                      fontSize="sm"
                      borderRadius={10}
                      p="3"
                    >
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        color={theme.compensation?.card.secondaryText}
                      >
                        Final score formula:
                      </Text>
                    </Tooltip>
                    <Tooltip
                      placement="top"
                      label="Total"
                      hasArrow
                      bgColor={theme.compensation?.card.bg}
                      color={theme.compensation?.card.text}
                      fontWeight="normal"
                      fontSize="sm"
                      borderRadius={10}
                      p="3"
                    >
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        color={theme.compensation?.card.secondaryText}
                      >
                        {sumAverages}
                      </Text>
                    </Tooltip>
                    <Text
                      fontSize="16px"
                      fontWeight={600}
                      color={theme.compensation?.card.secondaryText}
                    >
                      *
                    </Text>
                    <Tooltip
                      placement="top"
                      label={
                        <Flex flexDir="column" gap="2">
                          <Text
                            fontSize="14px"
                            fontWeight={400}
                            color={theme.compensation?.card.text}
                          >
                            Delegates Feedback (DF) - Weight 30
                          </Text>
                          <Text
                            fontSize="14px"
                            fontWeight={400}
                            color={theme.compensation?.card.text}
                          >
                            Max Initial Score - Weight 20
                          </Text>
                        </Flex>
                      }
                      hasArrow
                      bgColor={theme.compensation?.card.bg}
                      color={theme.compensation?.card.text}
                      fontWeight="normal"
                      fontSize="sm"
                      borderRadius={10}
                      p="3"
                    >
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        color={theme.compensation?.card.secondaryText}
                      >
                        30/20
                      </Text>
                    </Tooltip>
                    <Text
                      fontSize="16px"
                      fontWeight={600}
                      color={theme.compensation?.card.secondaryText}
                    >
                      *
                    </Text>
                    <Tooltip
                      placement="top"
                      label="Presence Multiplier"
                      hasArrow
                      bgColor={theme.compensation?.card.bg}
                      color={theme.compensation?.card.text}
                      fontWeight="normal"
                      fontSize="sm"
                      borderRadius={10}
                      p="3"
                    >
                      <Text
                        fontSize="16px"
                        fontWeight={400}
                        color={theme.compensation?.card.text}
                      >
                        {presenceMultiplier}
                      </Text>
                    </Tooltip>
                  </Flex>
                  <Text
                    fontSize="16px"
                    fontWeight={700}
                    color={theme.compensation?.card.secondaryText}
                  >
                    Final Score: {` `}
                    {formatSimpleNumber(
                      calculateFinalScore({
                        ...averages,
                      })
                    )}
                  </Text>
                </Flex>
                <Flex flexDir="row" gap="8" justify="flex-end" mt="4">
                  <Flex flexDir="row" gap="2" alignItems="center">
                    <Text
                      fontSize="14px"
                      fontWeight={600}
                      color={theme.compensation?.card.secondaryText}
                    >
                      Presence Multiplier
                    </Text>
                    <Input
                      value={presenceMultiplier}
                      onChange={event => {
                        changePresenceMultiplier(event.target.value);
                      }}
                      isDisabled={!isAuthorized}
                      disabled={!isAuthorized}
                      type="number"
                      min={0}
                      max={2}
                      w="80px"
                      bgColor={theme.compensation?.card.bg}
                      color={theme.compensation?.card.text}
                      textAlign="center"
                    />
                  </Flex>
                  {isAuthorized ? (
                    <Button
                      isDisabled={!isModified || isSaving || !isAuthorized}
                      disabled={!isModified || isSaving || !isAuthorized}
                      isLoading={isSaving}
                      w="max-content"
                      alignSelf="flex-end"
                      onClick={() => {
                        saveFeedback();
                      }}
                      bgColor={theme.compensation?.card.bg}
                      color={theme.compensation?.card.text}
                    >
                      Save
                    </Button>
                  ) : (
                    false
                  )}
                </Flex>
              </Flex>
            ) : null}
          </Flex>
        ) : (
          <Flex py="4">
            <Text>{`This delegate doesn't have forum posts for this period.`}</Text>
          </Flex>
        )}
      </Box>
    </DelegateCompensationAdminLayout>
  );
};
