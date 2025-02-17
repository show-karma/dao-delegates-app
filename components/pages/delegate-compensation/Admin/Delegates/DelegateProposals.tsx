/* eslint-disable no-nested-ternary */
import {
  Button,
  Flex,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
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
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ChakraLink } from 'components/ChakraLink';
import { FalseIcon } from 'components/Icons/Compensation/FalseIcon';
import { LinkIcon } from 'components/Icons/Compensation/LinkIcon';
import { TrueIcon } from 'components/Icons/Compensation/TrueIcon';
import { useAuth, useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { API_ROUTES, KARMA_API } from 'helpers';
import { useToasty } from 'hooks';
import debounce from 'lodash.debounce';
import dynamic from 'next/dynamic';
import pluralize from 'pluralize';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DelegateStatsBreakdown, DelegateStatsFromAPI } from 'types';
import { ProposalItem } from 'types/proposals';
import { formatDate } from 'utils';
import { getPRBreakdown } from 'utils/delegate-compensation/getPRBreakdown';
import { getProposals } from 'utils/delegate-compensation/getProposals';
import * as yup from 'yup';
import { MonthNotFinishedTooltip } from '../../MonthNotFinishedTooltip';
import { Expandable } from './Expandable';

// eslint-disable-next-line import/no-extraneous-dependencies
const MDPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
});
type Breakdown =
  DelegateStatsFromAPI['stats']['communicatingRationale']['breakdown'];

export type ProposalAndBreakdownRow = ProposalItem &
  DelegateStatsBreakdown & {
    postId: string | undefined;
    index: number;
  };

interface DelegateProposalsProps {
  delegateVotes: Breakdown;
}

const schema = yup.object({
  communicatingRationale: yup.object({
    breakdown: yup.array(
      yup.object({
        proposal: yup.string().optional(),
        voted: yup.bool().optional(),
        modified: yup.bool().optional(),
        post: yup.string().optional(),
        validRationale: yup.bool().optional(),
      })
    ),
  }),
});

type FormData = yup.InferType<typeof schema>;

interface DefaultValueBreakdown {
  proposal: string | undefined;
  voted: boolean | undefined;
  modified: boolean;
  post: string | undefined;
  validRationale: boolean | undefined;
}

const DelegateProposalsWrapped = ({
  defaultValueBreakdown,
  snapshotProposals,
  onChainProposals,
  selectRationale,
  isMonthFinished,
}: {
  defaultValueBreakdown: DefaultValueBreakdown[];
  snapshotProposals: ProposalAndBreakdownRow[];
  onChainProposals: ProposalAndBreakdownRow[];
  selectRationale: (rationale: ProposalAndBreakdownRow) => void;
  isMonthFinished: boolean;
}) => {
  const { delegateInfo, refreshDelegateInfo, selectedDate } =
    useDelegateCompensation();
  const { daoInfo, theme } = useDAO();
  const { authToken, isDaoAdmin: isAuthorized } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToasty();

  const { data: prBreakdown } = useQuery({
    queryKey: [
      'participation-rate-breakdown',
      delegateInfo?.publicAddress,
      daoInfo.config.DAO_KARMA_ID,
    ],
    initialData: { proposals: [], votes: [], rows: [] },
    queryFn: () =>
      getPRBreakdown(
        delegateInfo?.publicAddress,
        daoInfo.config.DAO_KARMA_ID,
        selectedDate?.value.month,
        selectedDate?.value.year
      ),
    enabled:
      !!delegateInfo?.publicAddress &&
      !!daoInfo.config.DAO_KARMA_ID &&
      !!selectedDate?.value.year &&
      !!selectedDate?.value.month,
    refetchOnWindowFocus: false,
  });

  const { formState, handleSubmit, setValue, watch } = useForm<FormData>({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
    mode: 'onChange',
    defaultValues: {
      communicatingRationale: {
        breakdown: defaultValueBreakdown,
      },
    },
  });

  const onChangeDebounce = debounce((value: string, index: number) => {
    setValue(`communicatingRationale.breakdown.${index}.post`, value, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue(`communicatingRationale.breakdown.${index}.modified`, true);
  }, 350);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSaving(true);
      const authorizedAPI = axios.create({
        timeout: 30000,
        baseURL: KARMA_API.base_url,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });

      const breakdown: Record<string, DelegateStatsBreakdown> = {};
      const modifiedRows =
        data.communicatingRationale?.breakdown?.filter(
          item => item.modified && item.proposal
        ) || [];
      if (!modifiedRows.length) {
        return;
      }
      modifiedRows?.forEach(item => {
        breakdown[item.proposal as string] = {
          post: item.post,
          validRationale:
            item.validRationale !== undefined ? item.validRationale : undefined,
        };
      });
      await authorizedAPI
        .put(
          API_ROUTES.DELEGATE.CHANGE_INCENTIVE_PROGRAM_STATS(
            daoInfo.config.DAO_KARMA_ID,
            delegateInfo?.id || ''
          ),
          {
            stats: {
              communicatingRationale: {
                breakdown,
              },
            },
          }
        )
        .then(() => {
          toast({
            title: 'Success',
            description: 'Successfully saved the Communication Rationale',
          });
          refreshDelegateInfo();
        });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error saving the Communication Rationale',
      });
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  const tables = [
    {
      title: 'Snapshot Proposals',
      proposals: snapshotProposals,
    },
    {
      title: 'Onchain Proposals',
      proposals: onChainProposals,
    },
  ];

  const renderValidIcon = (valid?: boolean) => {
    if (valid === true) {
      return (
        <TrueIcon w="24px" h="24px" color={theme.compensation?.card.success} />
      );
    }
    return (
      <FalseIcon w="24px" h="24px" color={theme.compensation?.card.error} />
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Flex flexDir="column" gap="4" alignItems="flex-start" w="full" py="4">
        {tables.map(table => (
          <Flex
            key={table.title}
            flexDir="column"
            gap="4"
            alignItems="flex-start"
            w="full"
            py="4"
          >
            <Flex
              flexDir={['column', 'row']}
              px="4"
              gap={['1', '4']}
              alignItems={['flex-start', 'center']}
              w="full"
            >
              <Heading
                lineHeight="30px"
                size="md"
                color={theme.compensation?.card.text}
              >
                {table.title}
              </Heading>
              <Flex flexDir="row" gap="2" alignItems="center">
                <Text
                  fontSize="14px"
                  fontWeight={500}
                  color={theme.compensation?.card.text}
                >
                  {table.proposals?.length} Total{' '}
                  {pluralize('Proposal', table.proposals?.length || 0)}
                  {', '}
                  <Text
                    as="span"
                    fontSize="14px"
                    fontWeight={500}
                    color={theme.compensation?.card.success}
                  >
                    {table.proposals.filter(item => item.voted)?.length} Voted
                    On
                  </Text>
                </Text>
              </Flex>
            </Flex>
            <Flex
              flexDir="column"
              gap="4"
              maxH="320px"
              overflowY="auto"
              w="full"
            >
              <Table
                variant="simple"
                bg={theme.compensation?.card.bg}
                borderRadius="8px"
              >
                <Thead>
                  <Tr>
                    <Th
                      borderColor={theme.compensation?.card.divider}
                      color={theme.compensation?.card.text}
                      textTransform="none"
                      fontSize="14px"
                      fontWeight="700"
                    >
                      Proposal Name
                    </Th>

                    <Th
                      borderColor={theme.compensation?.card.divider}
                      color={theme.compensation?.card.text}
                      textTransform="none"
                      fontSize="14px"
                      fontWeight="700"
                    >
                      Voted On
                    </Th>

                    <Th
                      borderColor={theme.compensation?.card.divider}
                      color={theme.compensation?.card.text}
                      textTransform="none"
                      fontSize="14px"
                      fontWeight="700"
                    >
                      CR
                    </Th>
                    <Th
                      borderColor={theme.compensation?.card.divider}
                      color={theme.compensation?.card.text}
                      textTransform="none"
                      fontSize="14px"
                      fontWeight="700"
                    >
                      Valid Rationale
                    </Th>
                    <Th
                      borderColor={theme.compensation?.card.divider}
                      color={theme.compensation?.card.text}
                      textTransform="none"
                      fontSize="14px"
                      fontWeight="700"
                    />
                  </Tr>
                </Thead>
                <Tbody>
                  {table.proposals?.map(item => (
                    <Tr
                      opacity={
                        !watch(
                          `communicatingRationale.breakdown.${item.index}.validRationale`
                        )
                          ? 0.7
                          : 1
                      }
                      key={item.index}
                    >
                      <Td
                        color={theme.compensation?.card.text}
                        borderColor={theme.compensation?.card.divider}
                      >
                        <Flex
                          flexDirection="column"
                          justify="flex-start"
                          align="flex-start"
                          gap="2"
                        >
                          <Text color={theme.text} lineHeight="14px">
                            {item.name}
                            {item.name[0] === '#' ? '...' : ''}
                          </Text>
                          <Flex flexDir="row" gap="4" alignItems="center">
                            {item.link ? (
                              <ChakraLink
                                display="flex"
                                flexDir="row"
                                gap="2"
                                alignItems="center"
                                justifyContent="center"
                                href={item.link}
                                isExternal
                                color="blue.500"
                                w="fit-content"
                                _hover={{
                                  textDecoration: 'none',
                                  color: 'blue.400',
                                  borderColor: 'blue.400',
                                }}
                                fontSize={['14px', '16px']}
                              >
                                See proposal
                                <LinkIcon
                                  w="14px"
                                  h="14px"
                                  viewBox="0 0 18 18"
                                  mt="0.5"
                                />
                              </ChakraLink>
                            ) : null}
                            {item.proposalTopic ? (
                              <ChakraLink
                                display="flex"
                                flexDir="row"
                                gap="2"
                                alignItems="center"
                                justifyContent="center"
                                href={item.proposalTopic}
                                isExternal
                                color="blue.500"
                                w="fit-content"
                                _hover={{
                                  textDecoration: 'none',
                                  color: 'blue.400',
                                  borderColor: 'blue.400',
                                }}
                                fontSize={['14px', '16px']}
                              >
                                See Forum Link
                                <LinkIcon
                                  w="14px"
                                  h="14px"
                                  viewBox="0 0 18 18"
                                  mt="0.5"
                                />
                              </ChakraLink>
                            ) : null}
                          </Flex>
                        </Flex>
                      </Td>

                      <Td
                        color={theme.compensation?.card.text}
                        borderColor={theme.compensation?.card.divider}
                      >
                        <Text w="max-content">
                          {item.createdAt ? (
                            formatDate(item.createdAt as string, 'MMM D, YYYY')
                          ) : (
                            <FalseIcon
                              w="24px"
                              h="24px"
                              color={theme.compensation?.card.error}
                            />
                          )}
                        </Text>
                      </Td>

                      <Td
                        color={theme.compensation?.card.text}
                        borderColor={theme.compensation?.card.divider}
                      >
                        <Flex
                          flexDir="row"
                          gap="3"
                          alignItems="center"
                          justify="flex-start"
                          minW="200px"
                        >
                          {isMonthFinished || isAuthorized ? (
                            isAuthorized ? (
                              <Input
                                defaultValue={item.post || ''}
                                bg={theme.compensation?.card.input.bg}
                                color={theme.compensation?.card.input.text}
                                disabled={isSaving}
                                _active={{}}
                                _focus={{
                                  bg: theme.compensation?.card.input.bg,
                                }}
                                _focusVisible={{}}
                                _focusWithin={{}}
                                w="180px"
                                h="32px"
                                px="1"
                                border={
                                  formState.errors.communicatingRationale
                                    ?.breakdown?.[item.index]?.post
                                    ? '1px solid red'
                                    : 'none'
                                }
                                onChange={(
                                  event: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                  onChangeDebounce(
                                    event.target.value,
                                    item.index
                                  );
                                }}
                              />
                            ) : item.post ? (
                              <ChakraLink
                                href={item.post}
                                isExternal
                                color="blue.500"
                                maxW="240px"
                                wordBreak="break-all"
                                w="full"
                                noOfLines={2}
                              >
                                {item.post.length > 40
                                  ? `${item.post.slice(0, 40)}...`
                                  : item.post}
                              </ChakraLink>
                            ) : (
                              <Text color={theme.compensation?.card.text}>
                                -
                              </Text>
                            )
                          ) : (
                            <MonthNotFinishedTooltip />
                          )}
                          {item.rationale ? (
                            <Flex
                              display="flex"
                              flexDir="row"
                              gap="1"
                              alignItems="center"
                              onClick={() => selectRationale(item)}
                              cursor="pointer"
                              color="blue.500"
                              borderBottom="1px solid"
                              borderColor="blue.500"
                              w="max-content"
                              _hover={{
                                textDecoration: 'none',
                                color: 'blue.400',
                                borderColor: 'blue.400',
                              }}
                            >
                              See
                            </Flex>
                          ) : (
                            <Flex width="24px" height="24px" />
                          )}
                        </Flex>
                      </Td>
                      <Td
                        color={theme.compensation?.card.text}
                        borderColor={theme.compensation?.card.divider}
                      >
                        {isMonthFinished || isAuthorized ? (
                          isAuthorized ? (
                            <Switch
                              isChecked={watch(
                                `communicatingRationale.breakdown.${item.index}.validRationale`
                              )}
                              onChange={() => {
                                setValue(
                                  `communicatingRationale.breakdown.${item.index}.validRationale`,
                                  !watch(
                                    `communicatingRationale.breakdown.${item.index}.validRationale`
                                  ),
                                  {
                                    shouldDirty: true,
                                    shouldValidate: true,
                                  }
                                );
                                setValue(
                                  `communicatingRationale.breakdown.${item.index}.modified`,
                                  true
                                );
                              }}
                              isDisabled={isSaving}
                              disabled={isSaving}
                            />
                          ) : (
                            renderValidIcon(
                              watch(
                                `communicatingRationale.breakdown.${item.index}.validRationale`
                              )
                            )
                          )
                        ) : (
                          <MonthNotFinishedTooltip />
                        )}
                      </Td>
                      <Td
                        color={theme.compensation?.card.text}
                        borderColor={theme.compensation?.card.divider}
                      >
                        {isMonthFinished || isAuthorized ? (
                          item?.updated === 'manually' && isAuthorized ? (
                            <Tooltip label="Manually updated">
                              <Flex
                                bg={theme.compensation?.card.input.bg}
                                p="1"
                                rounded="full"
                                width="24px"
                                height="24px"
                                alignItems="center"
                                justify="center"
                              >
                                <Text
                                  fontSize="small"
                                  color={theme.compensation?.card.text}
                                >
                                  M
                                </Text>
                              </Flex>
                            </Tooltip>
                          ) : (
                            <Flex width="24px" height="24px" />
                          )
                        ) : (
                          <MonthNotFinishedTooltip />
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Flex>
          </Flex>
        ))}
        <Flex
          key="participation-rate-proposals-and-votes"
          flexDir="column"
          gap="4"
          alignItems="flex-start"
          w="full"
          py="4"
        >
          <Flex
            flexDir={['column', 'row']}
            px="4"
            gap={['1', '4']}
            alignItems={['flex-start', 'center']}
            w="full"
          >
            <Heading
              lineHeight="30px"
              size="md"
              color={theme.compensation?.card.text}
            >
              Your Last 90 Days voting activity
            </Heading>
            <Flex flexDir="row" gap="2" alignItems="center">
              <Text
                fontSize="14px"
                fontWeight={500}
                color={theme.compensation?.card.text}
              >
                {prBreakdown?.proposals?.length} Total{' '}
                {pluralize('Proposal', prBreakdown?.proposals?.length || 0)}
                {', '}
                <Text
                  as="span"
                  fontSize="14px"
                  fontWeight={500}
                  color={theme.compensation?.card.success}
                >
                  {prBreakdown?.votes?.length} Voted On
                </Text>
              </Text>
            </Flex>
          </Flex>
          <Flex flexDir="column" gap="4" maxH="320px" overflowY="auto" w="full">
            <Table
              variant="simple"
              bg={theme.compensation?.card.bg}
              borderRadius="8px"
            >
              <Thead>
                <Tr>
                  <Th
                    borderColor={theme.compensation?.card.divider}
                    color={theme.compensation?.card.text}
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="700"
                  >
                    Proposal Name
                  </Th>

                  <Th
                    borderColor={theme.compensation?.card.divider}
                    color={theme.compensation?.card.text}
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="700"
                  >
                    Voted On
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {prBreakdown?.rows?.map(item => (
                  <Tr key={item.id}>
                    <Td
                      color={theme.compensation?.card.text}
                      borderColor={theme.compensation?.card.divider}
                    >
                      <Flex
                        flexDirection="column"
                        justify="flex-start"
                        align="flex-start"
                        gap="2"
                      >
                        <Text color={theme.text} lineHeight="14px">
                          <Expandable text={item.discussion} />
                        </Text>
                        <Flex flexDir="row" gap="4" alignItems="center">
                          {item.link ? (
                            <ChakraLink
                              display="flex"
                              flexDir="row"
                              gap="2"
                              alignItems="center"
                              justifyContent="center"
                              href={item.link}
                              isExternal
                              color="blue.500"
                              w="fit-content"
                              _hover={{
                                textDecoration: 'none',
                                color: 'blue.400',
                                borderColor: 'blue.400',
                              }}
                              fontSize={['14px', '16px']}
                            >
                              See proposal
                              <LinkIcon
                                w="14px"
                                h="14px"
                                viewBox="0 0 18 18"
                                mt="0.5"
                              />
                            </ChakraLink>
                          ) : null}
                        </Flex>
                      </Flex>
                    </Td>

                    <Td
                      color={theme.compensation?.card.text}
                      borderColor={theme.compensation?.card.divider}
                    >
                      <Text w="max-content">
                        {item.votedOn ? (
                          formatDate(item.votedOn as string, 'MMM D, YYYY')
                        ) : (
                          <FalseIcon
                            w="24px"
                            h="24px"
                            color={theme.compensation?.card.error}
                          />
                        )}
                      </Text>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Flex>
        </Flex>
      </Flex>

      {formState.isDirty && isAuthorized ? (
        <Flex flexDir="row" gap="2" justify="flex-end" mt="4">
          <Button
            isDisabled={isSaving || !formState.isValid}
            disabled={isSaving || !formState.isValid}
            isLoading={isSaving}
            w="max-content"
            alignSelf="flex-end"
            type="submit"
            bgColor={theme.compensation?.card.bg}
            color={theme.compensation?.card.text}
          >
            Save
          </Button>
        </Flex>
      ) : null}
    </form>
  );
};

export const DelegateProposals = ({
  delegateVotes,
}: DelegateProposalsProps) => {
  const { selectedDate } = useDelegateCompensation();
  const { daoInfo, theme } = useDAO();
  const [rationaleSelected, setRationaleSelected] = useState<
    ProposalAndBreakdownRow | undefined
  >(undefined);
  const {
    data: dataFromAPI,
    isLoading: proposalsLoading,
    isFetching: proposalsFetching,
  } = useQuery({
    queryKey: [
      'delegate-compensation-proposals',
      selectedDate?.value.month,
      selectedDate?.value.year,
    ],
    queryFn: () =>
      getProposals(
        daoInfo.config.DAO_KARMA_ID,
        selectedDate?.value.month as string | number,
        selectedDate?.value.year as string | number
      ),
    enabled:
      !!selectedDate?.value.month &&
      !!selectedDate?.value.year &&
      !!daoInfo.config.DAO_KARMA_ID,
    refetchOnWindowFocus: false,
  });

  const isMonthFinished = dataFromAPI?.finished || false;

  const setupProposalsAndVotes = () => {
    const proposals =
      dataFromAPI?.proposals?.flatMap(category => category.items) || [];
    if (!proposals) return [];
    return proposals
      ?.filter(item => item?.isValid)
      ?.map(proposal => {
        const getVote = () => {
          if (!delegateVotes) return undefined;
          const votesArray = Object.entries(delegateVotes);
          const findProposal = votesArray.find(([key]) =>
            proposal.type === 'snapshot'
              ? key.includes(proposal.id)
              : key.includes(proposal.name)
          );
          return {
            ...findProposal?.[1],
            proposal: findProposal?.[0],
          };
        };
        const delegateVote = getVote();
        return {
          ...proposal,
          ...delegateVote,
          postId: delegateVote?.proposal,
        } as ProposalAndBreakdownRow;
      });
  };

  const proposalsAndVotes: ProposalAndBreakdownRow[] =
    setupProposalsAndVotes() || [];

  const defaultValueBreakdown = proposalsAndVotes?.map(item => ({
    proposal:
      item.postId ||
      (item.type === 'onChain' ? item.name : item.id) ||
      undefined,
    voted: item.voted || undefined,
    modified: false,
    post: item.post || undefined,
    validRationale: item.validRationale
      ? item.validRationale
      : item.validRationale === false
      ? false
      : undefined,
  }));

  const onChainProposals: ProposalAndBreakdownRow[] = [];
  const snapshotProposals: ProposalAndBreakdownRow[] = [];

  proposalsAndVotes.forEach(item => {
    if (item.type === 'onChain') {
      onChainProposals.push({
        ...item,
        index: proposalsAndVotes.indexOf(item),
      });
    } else {
      snapshotProposals.push({
        ...item,
        index: proposalsAndVotes.indexOf(item),
      });
    }
  });

  return (
    <Flex w="full" flexDir="column" gap="8">
      {/* do a modal for the rationale selected */}
      {rationaleSelected ? (
        <Modal
          isOpen={!!rationaleSelected}
          onClose={() => setRationaleSelected(undefined)}
        >
          <ModalOverlay />
          <ModalContent bg="transparent">
            <ModalHeader
              bg={theme.compensation?.card.bg}
              textColor={theme.compensation?.card.text}
            >
              {rationaleSelected?.name}
            </ModalHeader>
            <ModalCloseButton textColor={theme.compensation?.card.text} />
            <ModalBody
              bg={theme.compensation?.card.bg}
              textColor={theme.compensation?.card.text}
              maxH="80vh"
              overflowY="auto"
              pb="4"
            >
              <MDPreview source={rationaleSelected?.rationale || ''} />
            </ModalBody>
          </ModalContent>
        </Modal>
      ) : null}

      {proposalsFetching || proposalsLoading ? (
        <Flex w="full" justify="center" align="center">
          <Spinner />
        </Flex>
      ) : (
        <DelegateProposalsWrapped
          defaultValueBreakdown={defaultValueBreakdown}
          snapshotProposals={snapshotProposals}
          onChainProposals={onChainProposals}
          selectRationale={setRationaleSelected}
          isMonthFinished={isMonthFinished}
        />
      )}
    </Flex>
  );
};
