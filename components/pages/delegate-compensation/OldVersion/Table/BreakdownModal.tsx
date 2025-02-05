/* eslint-disable no-nested-ternary */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
  Button,
  Editable,
  EditablePreview,
  EditableInput,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  FormControl,
  Icon,
  useClipboard,
  Tooltip,
  Link,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { useAuth, useDAO } from 'contexts';
import { FC, useEffect, useState } from 'react';
import { DelegateCompensationStats } from 'types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { useToasty } from 'hooks';
import { IoCopy } from 'react-icons/io5';
import { formatNumberPercentage, truncateAddress } from 'utils';
import { FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { DownChevron } from 'components/Icons';
import { API_ROUTES, KARMA_API, LINKS } from 'helpers';
import debounce from 'lodash.debounce';
import { AiFillQuestionCircle } from 'react-icons/ai';
import { ApolloClient, gql, InMemoryCache } from '@apollo/client';
import { ChakraLink } from 'components/ChakraLink';

interface BreakdownModalProps {
  delegate: DelegateCompensationStats;
  isOpen: boolean;
  onClose: () => void;
  refreshFn: () => Promise<void>;
}

interface Breakdown {
  proposal: string;
  communicated: string;
}

const schema = yup.object({
  optedIn: yup.boolean().required(),
  commentingProposal: yup.object({
    rn: yup
      .number()
      .typeError('RN must be a number.')
      .required('RN is required'),
    tn: yup
      .number()
      .typeError('TN must be a number.')
      .required('TN is required'),
  }),
  communicatingRationale: yup.object({
    rn: yup
      .number()
      .typeError('RN must be a number.')
      .required('RN is required'),
    tn: yup
      .number()
      .typeError('TN must be a number.')
      .required('TN is required'),
    breakdown: yup.array(
      yup.object({
        proposal: yup.string().required(),
        communicated: yup.string().required(),
        post: yup.string().url().optional(),
      })
    ),
  }),
  bonusPoint: yup.object({
    total: yup
      .number()
      .typeError('Total must be a number.')
      .required('Total is required'),
  }),
});

type StatKeys = 'commentingProposal' | 'bonusPoint' | 'communicatingRationale';

type FormData = yup.InferType<typeof schema>;

const snapshotClient = new ApolloClient({
  uri: 'https://hub.snapshot.org/graphql',
  cache: new InMemoryCache(),
});

export const BreakdownModal: FC<BreakdownModalProps> = ({
  delegate,
  isOpen,
  onClose,
  refreshFn,
}) => {
  const { theme, daoInfo, rootPathname } = useDAO();
  const { isDaoAdmin, authToken } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const { onCopy } = useClipboard(delegate?.delegate?.publicAddress || '');
  const { toast } = useToasty();

  const {
    register,
    formState,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    reValidateMode: 'onChange',
    mode: 'onChange',
  });

  const { errors, isValid, isDirty } = formState;

  const copyText = () => {
    onCopy();
    toast({
      title: 'Copied to clipboard',
      description: 'Address copied',
      duration: 3000,
    });
  };

  const stats = [
    {
      name: 'Participation Rate (PR)',
      TN: delegate.participationRatePercent
        ? formatNumberPercentage(delegate.participationRatePercent)
        : null,
      RN: null,
      total: delegate.participationRate,
      formName: 'participationRate',
      canEdit: [] as string[],
      description: 'Participation Rate percentage',
    },
    {
      name: 'Snapshot Voting (SV)',
      TN: delegate.snapshotVoting.tn,
      RN: delegate.snapshotVoting.rn,
      total: delegate.snapshotVoting.score,
      formName: 'snapshotVoting',
      canEdit: [] as string[],
      description: 'Number of proposals the delegate voted on in the month',
    },
    {
      name: 'Onchain Voting (TV)',
      TN: delegate.onChainVoting.tn,
      RN: delegate.onChainVoting.rn,
      total: delegate.onChainVoting.score,
      formName: 'onChainVoting',
      canEdit: [] as string[],
      description:
        'Number of proposals the delegate voted onchain in the month',
    },
    {
      name: 'Communication Rationale (CR)',
      TN: delegate.communicatingRationale.tn,
      RN: delegate.communicatingRationale.rn,
      total: delegate.communicatingRationale.score,
      formName: 'communicatingRationale',
      canEdit: ['rn', 'tn'] as string[],
      breakdown: delegate.communicatingRationale.breakdown,
      description:
        'Number of real communication rational threads where the delegate communicated and justified his/her decision',
    },
    {
      name: 'Commenting Proposal (CP)',
      TN: delegate.commentingProposal.tn,
      RN: delegate.commentingProposal.rn,
      total: delegate.commentingProposal.score,
      formName: 'commentingProposal',
      canEdit: ['tn', 'rn', 'total'] as string[],
      description:
        'Number of actual proposals where the delegate made a genuine and quality contribution. Spam messages will not be considered',
    },
    {
      name: 'Bonus Point (BP)',
      TN: null,
      RN: null,
      total: delegate.bonusPoint,
      formName: 'bonusPoint',
      canEdit: ['total'] as string[],
      description:
        'This parameter is extra. If the delegate makes a significant contribution to the DAO, he/she is automatically granted +40% extra TP. This parameter is at the discretion of the program administrator. This parameter is reset at the beginning of each month',
    },
    {
      name: 'Total Participation (TP)',
      TN: null,
      RN: null,
      total: delegate.totalParticipation,
      formName: 'totalParticipation',
      canEdit: [] as string[],
      description:
        'Sum of the results of activities performed by the delegate. A TP% of 100 indicates full participation',
    },
  ];

  const onSave = async (data: FormData) => {
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

      const newBreakdown = delegate.communicatingRationale.breakdown;
      data.communicatingRationale.breakdown?.forEach(item => {
        if (newBreakdown && item.proposal && item.communicated) {
          newBreakdown[item.proposal].post = item.post || null;
        }
      });
      await authorizedAPI.put(
        API_ROUTES.DELEGATE.CHANGE_INCENTIVE_PROGRAM_STATS(
          daoInfo.config.DAO_KARMA_ID,
          delegate.id
        ),
        {
          incentiveOptedIn: data.optedIn,
          stats: {
            communicatingRationale: {
              rn: data.communicatingRationale.rn,
              tn: data.communicatingRationale.tn,
              breakdown: newBreakdown,
            },
            commentingProposal: {
              rn: data.commentingProposal.rn,
              tn: data.commentingProposal.tn,
            },
            bonusPoints: data.bonusPoint.total,
          },
        }
      );
      toast({
        title: 'Success',
        description: 'Delegate updated successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      refreshFn();
    } catch (error) {
      console.log(error);
    } finally {
      setIsSaving(false);
    }
  };

  const [showBreakdown, setShowBreakdown] = useState(false);
  const [proposalTitles, setProposalTitles] = useState<
    {
      title: string;
      id: string;
    }[]
  >([]);

  const getProposalTitles = async (proposalIds: string[]) => {
    try {
      const { data } = await snapshotClient.query({
        query: gql`
          query Proposals($proposalIds: [String]!) {
            proposals(where: { id_in: $proposalIds }, first: 1000) {
              title
              id
            }
          }
        `,
        variables: {
          proposalIds,
        },
      });
      const proposals = data?.proposals;
      if (proposals && proposals.length > 0) {
        setProposalTitles(old => [...old, ...proposals]);
      } else {
        setProposalTitles([]);
      }
    } catch (error) {
      console.log(error);
      setProposalTitles([]);
    }
  };

  useEffect(() => {
    if (delegate.communicatingRationale.breakdown) {
      const breakdownArray = Object.keys(
        delegate.communicatingRationale.breakdown
      )
        .filter(key => key.startsWith('0x'))
        .map(item => item.split('-')[0].toLowerCase());

      const onlyTitles = proposalTitles.map(item => item.id.toLowerCase());
      const newProposals = breakdownArray.filter(
        item => !onlyTitles.includes(item)
      );

      if (newProposals.length > 0) {
        getProposalTitles(newProposals);
      }
    }
  }, [delegate.communicatingRationale.breakdown]);

  const handleProposalTitle = (proposalId: string) => {
    const idHas0x = proposalId.slice(0, 2).includes('0x');
    if (idHas0x) {
      return (
        proposalTitles.find(item => item.id === proposalId)?.title ||
        truncateAddress(proposalId)
      );
    }
    return `${proposalId}...`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        setShowBreakdown(false);
      }}
    >
      <ModalOverlay />
      <ModalContent
        w="max-content"
        maxW="max-content"
        py="4"
        background={theme.modal.background}
      >
        <ModalHeader>
          <Flex flexDir="row" gap="3" alignItems="center" mr="8">
            <ImgWithFallback
              borderRadius="full"
              boxSize="32px"
              fallback={delegate.delegate.shouldUse}
              src={delegate.delegateImage}
            />
            <Text
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap"
              color={theme.modal.header.title}
            >
              {delegate.delegate.shouldUse}
            </Text>
            {delegate.incentiveOptedIn ? (
              <Tooltip
                label="Opted-in to Incentive Program"
                fontSize="md"
                color="black"
              >
                <Flex w="max-content" h="max-content">
                  <Icon as={FaCheckCircle} w="4" h="4" color="green.400" />
                </Flex>
              </Tooltip>
            ) : (
              <Flex w="16px" />
            )}
          </Flex>
          <Flex flexDir="row" color={theme.subtitle} paddingLeft="44px" gap="3">
            <Text fontSize="xs" fontWeight="medium">
              {truncateAddress(delegate.delegate.publicAddress)}
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
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody w="max-content" maxW="max-content">
          <form onSubmit={handleSubmit(onSave)}>
            <FormControl isInvalid={isValid}>
              {isDaoAdmin && (
                <Flex flexDir="row" gap="2" alignItems="center">
                  <Switch
                    defaultChecked={delegate.incentiveOptedIn}
                    color="white"
                    {...register('optedIn')}
                  >
                    Opted-in to Incentive Program
                  </Switch>
                </Flex>
              )}
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th
                        borderBottomWidth="1px"
                        borderBottomStyle="solid"
                        borderBottomColor={theme.modal.header.title}
                        color={theme.modal.header.title}
                      >
                        Stat
                      </Th>
                      <Th
                        borderBottomWidth="1px"
                        borderBottomStyle="solid"
                        borderBottomColor={theme.modal.header.title}
                        color={theme.modal.header.title}
                      >
                        <Flex flexDir="row" gap="2" alignItems="center">
                          Rn
                        </Flex>
                      </Th>
                      <Th
                        borderBottomWidth="1px"
                        borderBottomStyle="solid"
                        borderBottomColor={theme.modal.header.title}
                        color={theme.modal.header.title}
                      >
                        <Flex flexDir="row" gap="2" alignItems="center">
                          Tn
                        </Flex>
                      </Th>
                      <Th
                        borderBottomWidth="1px"
                        borderBottomStyle="solid"
                        borderBottomColor={theme.modal.header.title}
                        color={theme.modal.header.title}
                      >
                        Total
                      </Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {stats.map(item => (
                      <Tr key={item.name}>
                        <Td
                          borderBottomWidth="1px"
                          borderBottomStyle="solid"
                          borderBottomColor={theme.modal.header.title}
                          color={theme.modal.header.title}
                        >
                          <Flex flexDir="row" gap="2" alignItems="center">
                            {item.name}
                            {item.description ? (
                              <Tooltip
                                bg={theme.collapse.bg || theme.card.background}
                                color={theme.collapse.text}
                                label={
                                  <Flex flexDir="column" py="1" gap="2">
                                    {item.description}
                                  </Flex>
                                }
                              >
                                <Flex w="5" h="5" cursor="pointer">
                                  <Icon as={AiFillQuestionCircle} w="5" h="5" />
                                </Flex>
                              </Tooltip>
                            ) : null}
                          </Flex>
                        </Td>
                        <Td
                          borderBottomWidth="1px"
                          borderBottomStyle="solid"
                          borderBottomColor={theme.modal.header.title}
                          color={theme.modal.header.title}
                        >
                          {item.RN &&
                          item.canEdit.includes('rn') &&
                          isDaoAdmin ? (
                            <Flex flexDir="row" gap="4" alignItems="center">
                              <Editable
                                w="48px"
                                defaultValue={item.RN.toString()}
                              >
                                <EditablePreview
                                  cursor="pointer"
                                  _hover={{ opacity: 0.7 }}
                                  px="1"
                                  bg={
                                    errors &&
                                    (
                                      errors[
                                        item.formName as keyof typeof errors
                                      ] as any
                                    )?.rn
                                      ? 'red.900'
                                      : 'gray.700'
                                  }
                                  w="full"
                                />
                                <EditableInput
                                  w="full"
                                  bg="gray.900"
                                  disabled={isSaving}
                                  _active={{}}
                                  _focus={{
                                    bg: 'gray.700',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: theme.modal.header.title,
                                    padding: '0 4px',
                                  }}
                                  _focusVisible={{}}
                                  _focusWithin={{}}
                                  {...register(
                                    `${item.formName as StatKeys}.rn` as any
                                  )}
                                />
                              </Editable>
                            </Flex>
                          ) : (
                            <Text px="1" color={theme.modal.header.title}>
                              {item.RN}
                            </Text>
                          )}
                        </Td>
                        <Td
                          borderBottomWidth="1px"
                          borderBottomStyle="solid"
                          borderBottomColor={theme.modal.header.title}
                          color={theme.modal.header.title}
                        >
                          {item.TN &&
                          item.canEdit.includes('tn') &&
                          isDaoAdmin ? (
                            <Flex flexDir="row" gap="4" alignItems="center">
                              <Editable
                                w="48px"
                                defaultValue={item.TN.toString()}
                              >
                                <EditablePreview
                                  cursor="pointer"
                                  _hover={{ opacity: 0.7 }}
                                  px="1"
                                  bg={
                                    errors &&
                                    (
                                      errors[
                                        item.formName as keyof typeof errors
                                      ] as any
                                    )?.tn
                                      ? 'red.900'
                                      : 'gray.700'
                                  }
                                  w="full"
                                />
                                <EditableInput
                                  w="full"
                                  px="1"
                                  bg="gray.900"
                                  disabled={isSaving}
                                  _active={{}}
                                  _focus={{
                                    bg: 'gray.700',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: theme.modal.header.title,
                                    padding: '0 4px',
                                  }}
                                  _focusVisible={{}}
                                  _focusWithin={{}}
                                  {...register(
                                    `${item.formName as StatKeys}.tn` as any
                                  )}
                                />
                              </Editable>
                            </Flex>
                          ) : (
                            <Text px="1" color={theme.modal.header.title}>
                              {item.TN}
                            </Text>
                          )}
                        </Td>

                        <Td
                          borderBottomWidth="1px"
                          borderBottomStyle="solid"
                          borderBottomColor={theme.modal.header.title}
                          color={theme.modal.header.title}
                        >
                          {item.total &&
                          item.canEdit.includes('total') &&
                          (!item.TN || !item.RN) &&
                          isDaoAdmin ? (
                            <Flex flexDir="row" gap="4" alignItems="center">
                              <Editable
                                w="48px"
                                defaultValue={item.total.toString()}
                              >
                                <EditablePreview
                                  cursor="pointer"
                                  _hover={{ opacity: 0.7 }}
                                  px="1"
                                  bg={
                                    errors &&
                                    (
                                      errors[
                                        item.formName as keyof typeof errors
                                      ] as any
                                    )?.total
                                      ? 'red.900'
                                      : 'gray.700'
                                  }
                                  w="full"
                                />
                                <EditableInput
                                  w="full"
                                  px="1"
                                  _active={{}}
                                  disabled={isSaving}
                                  _focus={{
                                    bg: 'gray.700',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                    borderColor: theme.modal.header.title,
                                    padding: '0 8px',
                                    width: '64px',
                                  }}
                                  _focusVisible={{}}
                                  _focusWithin={{}}
                                  {...register(
                                    `${
                                      item.formName as keyof typeof schema
                                    }.total` as any
                                  )}
                                />
                              </Editable>
                            </Flex>
                          ) : item.formName === 'communicatingRationale' &&
                            item.breakdown ? (
                            showBreakdown ? (
                              <Flex flexDir="column">
                                <Button
                                  bg="transparent"
                                  color={theme.modal.header.title}
                                  onClick={() => setShowBreakdown(false)}
                                  _hover={{
                                    opacity: 0.8,
                                  }}
                                  _focus={{}}
                                  _focusWithin={{}}
                                >
                                  Hide breakdown
                                </Button>
                                <TableContainer>
                                  <Table>
                                    <Thead>
                                      <Tr>
                                        <Th color="gray.400">Proposal</Th>
                                        <Th color="gray.400">
                                          Rationale Communicated?
                                        </Th>
                                        <Th color="gray.400">Post</Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody>
                                      {Object.keys(item.breakdown).map(
                                        (key, index) => {
                                          const hasProposalUrl = (
                                            proposalTitle: string
                                          ) => {
                                            if (
                                              proposalTitle.includes(
                                                'forum.arbitrum.foundation'
                                              )
                                            ) {
                                              return true;
                                            }
                                            const idHas0x = proposalTitle
                                              .slice(0, 2)
                                              .includes('0x');
                                            if (idHas0x) {
                                              return true;
                                            }
                                            return false;
                                          };
                                          const id = hasProposalUrl(key)
                                            ? key.split('-')[0]
                                            : key;
                                          const choice = item.breakdown?.[key]
                                            ?.post
                                            ? 'Yes'
                                            : 'No';
                                          const post =
                                            item.breakdown?.[key].post;
                                          return (
                                            <Tr key={key}>
                                              <Td>
                                                {hasProposalUrl(key) ? (
                                                  <Link
                                                    wordBreak="break-all"
                                                    href={`https://snapshot.org/#/arbitrumfoundation.eth/proposal/${id}`}
                                                    isExternal
                                                    h="max-content"
                                                    w="full"
                                                    display="flex"
                                                    flexDir="row"
                                                    gap="1"
                                                    alignItems="center"
                                                    justifyContent="flex-start"
                                                  >
                                                    <Text
                                                      maxW="220px"
                                                      wordBreak="break-all"
                                                      whiteSpace="break-spaces"
                                                      color={
                                                        theme.modal.header.title
                                                      }
                                                      textDecoration="underline"
                                                    >
                                                      {handleProposalTitle(id)}
                                                    </Text>
                                                    <Icon
                                                      as={FaExternalLinkAlt}
                                                      w="3"
                                                      h="3"
                                                    />
                                                  </Link>
                                                ) : (
                                                  <Flex
                                                    h="max-content"
                                                    w="full"
                                                    display="flex"
                                                    flexDir="row"
                                                    gap="1"
                                                    alignItems="center"
                                                    justifyContent="flex-start"
                                                  >
                                                    <Text
                                                      maxW="220px"
                                                      wordBreak="break-word"
                                                      whiteSpace="break-spaces"
                                                      color={
                                                        theme.modal.header.title
                                                      }
                                                    >
                                                      {handleProposalTitle(id)}
                                                    </Text>
                                                  </Flex>
                                                )}
                                              </Td>
                                              <Td>
                                                {isDaoAdmin ? (
                                                  <Menu>
                                                    <MenuButton
                                                      as={Button}
                                                      rightIcon={
                                                        <DownChevron
                                                          display="flex"
                                                          alignItems="center"
                                                          justifyContent="center"
                                                          boxSize="5"
                                                        />
                                                      }
                                                      bg={theme.filters.bg}
                                                      color={
                                                        theme.filters.title
                                                      }
                                                      borderWidth="1px"
                                                      borderColor={
                                                        theme.filters.border
                                                      }
                                                      borderStyle="solid"
                                                      boxShadow={
                                                        theme.filters.shadow
                                                      }
                                                      gap="4"
                                                      fontFamily="heading"
                                                      fontWeight="normal"
                                                      textAlign="left"
                                                      w={{
                                                        base: 'full',
                                                        md: 'max-content',
                                                      }}
                                                      maxW="full"
                                                      _hover={{
                                                        opacity: 0.8,
                                                      }}
                                                      _active={{
                                                        opacity: 0.8,
                                                      }}
                                                      px="4"
                                                      py="5"
                                                      borderRadius="4px"
                                                      _focus={{}}
                                                      _focusWithin={{}}
                                                    >
                                                      {watch(
                                                        `communicatingRationale.breakdown.${index}.communicated`
                                                      )
                                                        ? watch(
                                                            `communicatingRationale.breakdown.${index}.communicated`
                                                          ) === 'posted'
                                                          ? 'Yes'
                                                          : 'No'
                                                        : choice}
                                                    </MenuButton>
                                                    <MenuList
                                                      bgColor={
                                                        theme.filters.listBg
                                                      }
                                                      color={
                                                        theme.filters.listText
                                                      }
                                                      h={{
                                                        base: 'max-content',
                                                      }}
                                                      w="32"
                                                      minW="32"
                                                    >
                                                      <MenuItem
                                                        value="posted"
                                                        bgColor="transparent"
                                                        onClick={() => {
                                                          setValue(
                                                            `communicatingRationale.breakdown.${index}.communicated`,
                                                            'posted',
                                                            {
                                                              shouldDirty: true,
                                                            }
                                                          );
                                                          setValue(
                                                            `communicatingRationale.breakdown.${index}.proposal`,
                                                            key,
                                                            {
                                                              shouldDirty: true,
                                                            }
                                                          );
                                                          trigger(
                                                            `communicatingRationale.breakdown.${index}`
                                                          );
                                                        }}
                                                        _hover={{
                                                          bg: theme.filters
                                                            .activeBg,
                                                        }}
                                                      >
                                                        Yes
                                                      </MenuItem>
                                                      <MenuItem
                                                        value="not_posted"
                                                        bgColor="transparent"
                                                        onClick={() => {
                                                          setValue(
                                                            `communicatingRationale.breakdown.${index}.communicated`,
                                                            'not_posted',
                                                            {
                                                              shouldDirty: true,
                                                            }
                                                          );
                                                          setValue(
                                                            `communicatingRationale.breakdown.${index}.proposal`,
                                                            key,
                                                            {
                                                              shouldDirty: true,
                                                            }
                                                          );

                                                          trigger(
                                                            `communicatingRationale.breakdown.${index}`
                                                          );
                                                        }}
                                                        _hover={{
                                                          bg: theme.filters
                                                            .activeBg,
                                                        }}
                                                      >
                                                        No
                                                      </MenuItem>
                                                    </MenuList>
                                                  </Menu>
                                                ) : (
                                                  choice
                                                )}
                                              </Td>
                                              <Td>
                                                {isDaoAdmin ? (
                                                  <Flex
                                                    flexDir="column"
                                                    gap="1"
                                                    alignItems="flex-start"
                                                  >
                                                    <Editable
                                                      w="200px"
                                                      defaultValue={
                                                        watch(
                                                          `communicatingRationale.breakdown.${index}.post`
                                                        ) ||
                                                        post ||
                                                        ''
                                                      }
                                                    >
                                                      <EditablePreview
                                                        cursor="pointer"
                                                        _hover={{
                                                          opacity: 0.7,
                                                        }}
                                                        px="2"
                                                        bg={
                                                          errors &&
                                                          (errors[
                                                            `communicatingRationale.breakdown.${index}.post` as keyof typeof errors
                                                          ] as any)
                                                            ? 'red.900'
                                                            : 'gray.700'
                                                        }
                                                        w="full"
                                                        minH="24px"
                                                        overflow="hidden"
                                                        whiteSpace="none"
                                                        textOverflow="ellipsis"
                                                      />
                                                      <EditableInput
                                                        w="full"
                                                        px="2"
                                                        bg="gray.900"
                                                        disabled={isSaving}
                                                        _active={{}}
                                                        _focus={{
                                                          bg: 'gray.700',
                                                          borderWidth: '1px',
                                                          borderStyle: 'solid',
                                                          borderColor:
                                                            theme.modal.header
                                                              .title,
                                                          padding: '0 4px',
                                                        }}
                                                        _focusVisible={{}}
                                                        _focusWithin={{}}
                                                        // {...register(
                                                        //   `communicatingRationale.breakdown.${index}.post` as any
                                                        // )}
                                                        onChange={input => {
                                                          const { value } =
                                                            input.target;
                                                          const changeValue =
                                                            debounce(() => {
                                                              setValue(
                                                                `communicatingRationale.breakdown.${index}`,
                                                                {
                                                                  communicated:
                                                                    'posted',
                                                                  post: value,
                                                                  proposal: key,
                                                                },
                                                                {
                                                                  shouldDirty:
                                                                    true,
                                                                }
                                                              );
                                                              trigger(
                                                                `communicatingRationale.breakdown.${index}`
                                                              );
                                                            }, 400);
                                                          changeValue();
                                                        }}
                                                      />
                                                    </Editable>
                                                    {errors
                                                      ?.communicatingRationale
                                                      ?.breakdown?.[index]
                                                      ?.post ? (
                                                      <Text color="red.500">
                                                        URL is not valid.
                                                      </Text>
                                                    ) : null}
                                                  </Flex>
                                                ) : post ? (
                                                  <a
                                                    href={post}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                  >
                                                    <Flex
                                                      flexDir="row"
                                                      gap="1"
                                                      color="blue.500"
                                                      alignItems="center"
                                                    >
                                                      <Text
                                                        px="1"
                                                        color="blue.500"
                                                      >
                                                        Link
                                                      </Text>
                                                      <Icon
                                                        as={FaExternalLinkAlt}
                                                        w="3"
                                                        color="blue.400"
                                                        h="3"
                                                      />
                                                    </Flex>
                                                  </a>
                                                ) : null}
                                              </Td>
                                            </Tr>
                                          );
                                        }
                                      )}
                                    </Tbody>
                                  </Table>
                                </TableContainer>
                              </Flex>
                            ) : isDaoAdmin ? (
                              <Button
                                bg="transparent"
                                px="1"
                                py="1"
                                h="max-content"
                                color={theme.modal.header.title}
                                fontWeight="normal"
                                onClick={() => setShowBreakdown(true)}
                                _hover={{
                                  opacity: 0.8,
                                }}
                                _focus={{}}
                                _focusWithin={{}}
                                display="flex"
                                flexDir="row"
                                gap="2"
                                textDecoration="underline"
                              >
                                {item.total}
                              </Button>
                            ) : (
                              <Text px="1" color={theme.modal.header.title}>
                                {item.total}
                              </Text>
                            )
                          ) : (
                            <Text px="1" color={theme.modal.header.title}>
                              {item.total}
                            </Text>
                          )}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Flex
                flexDir="row"
                gap="4"
                justifyContent="space-between"
                alignItems="center"
                mt="8"
                mb="4"
              >
                <ChakraLink
                  href={LINKS.PROFILE(
                    rootPathname,
                    delegate.delegate.ensName ||
                      delegate.delegate.publicAddress,
                    'overview'
                  )}
                  bg={theme.branding}
                  color={theme.buttonText}
                >
                  View Delegate Info
                </ChakraLink>
                {isDirty && isDaoAdmin ? (
                  <Button
                    type="submit"
                    bg="blue.900"
                    _hover={{ opacity: 0.4 }}
                    isDisabled={!isValid || isSaving}
                    disabled={!isValid || isSaving}
                    isLoading={isSaving}
                  >
                    Save changes
                  </Button>
                ) : null}
              </Flex>
            </FormControl>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
