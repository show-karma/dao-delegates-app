/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable no-nested-ternary */
import {
  Flex,
  Icon,
  Link,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import axios from 'axios';
import { useDAO, useDelegates } from 'contexts';
import { api, easQueryWithAddress } from 'helpers';
import { useEffect, useState } from 'react';
import { EndorsementData } from 'types';
import { AttestationResponse } from 'types/eas';
import {
  EndorseDelegateSchema,
  EASAttestation,
  easDelegateEndorseDictionary,
  formatDate,
  formatNumberPercentage,
  getEASChainInfo,
} from 'utils';
import { fetchENSNames } from 'utils/fetchENSName';
import { getAddress } from 'viem';
import ReactPaginate from 'react-paginate';
import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';
import { GetDaoRes } from 'types/api';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { CommentModal } from './CommentModal';

export const EndorsementsReceived = () => {
  const {
    profileSelected,
    shouldRefreshEndorsements,
    changeRefreshEndorsements,
  } = useDelegates();
  const [data, setData] = useState<EndorsementData[]>([]);

  const { daoInfo, theme } = useDAO();
  const endorsersCounter = data.length;

  const [isLoading, setIsLoading] = useState(false);

  const getRecentAttestations = async () => {
    changeRefreshEndorsements(false);
    setIsLoading(true);
    const projectEnvironment = process.env.NEXT_PUBLIC_ENV || 'dev';
    const chainsInfo = easDelegateEndorseDictionary[projectEnvironment];

    if (!chainsInfo) {
      return;
    }

    const results: EASAttestation<EndorseDelegateSchema>[] = [];

    const fetchAttestations = async (chain: string) => {
      try {
        const checkSumAddress = getAddress(profileSelected?.address as string);
        const response = await axios.post<AttestationResponse>(
          chainsInfo[chain].easAPI,
          {
            query: easQueryWithAddress(
              getEASChainInfo(daoInfo.config.DAO_KARMA_ID).schemaId,
              checkSumAddress
            ),
          }
        );

        const schema = response.data?.data?.schema;
        if (schema && schema.attestations) {
          let uniqueAttestations: EASAttestation<EndorseDelegateSchema>[] = [];
          const uniqueAttesters: string[] = [];
          schema.attestations.forEach(attestation => {
            const easAttestation = new EASAttestation<EndorseDelegateSchema>(
              attestation
            );
            if (!uniqueAttesters.includes(easAttestation.attester)) {
              uniqueAttestations.push(easAttestation);
              uniqueAttesters.push(easAttestation.attester);
            } else {
              const lastAttest = schema.attestations.reduce(
                (lastAttestation, searchAttestation) => {
                  if (
                    attestation.attester === searchAttestation.attester &&
                    attestation.timeCreated >= searchAttestation.timeCreated
                  ) {
                    return searchAttestation;
                  }
                  return lastAttestation;
                }
              );
              if (lastAttest) {
                const filteredArray = uniqueAttestations.filter(
                  item =>
                    item.attester.toLowerCase() !==
                    attestation.attester.toLowerCase()
                );
                const newAttestation =
                  new EASAttestation<EndorseDelegateSchema>(lastAttest);
                filteredArray.push(newAttestation);
                uniqueAttestations = filteredArray;
              }
            }
          });
          results.push(...uniqueAttestations);
        }
      } catch (error) {
        console.error('Error fetching attestation data:', error);
      }
    };

    const chainPromises = Object.keys(chainsInfo).map(chain =>
      fetchAttestations(chain)
    );
    await Promise.all(chainPromises);

    const {
      data: { data: fetchedData },
    } = await api.get<{ data: { daos: GetDaoRes[] } }>('/dao');

    const daoData = fetchedData.daos.find(
      item => item.name === daoInfo.config.DAO_KARMA_ID
    );

    const filteredToDAO = results.filter(item => {
      const addresses = daoData?.tokenAddress?.map(address =>
        address.toLowerCase()
      );

      if (
        !item.decodedDataJson.tokenAddress ||
        !item.decodedDataJson.tokenChainId
      ) {
        return false;
      }

      if (typeof item.decodedDataJson.tokenAddress === 'string') {
        const hasMatch =
          addresses?.includes(
            item.decodedDataJson.tokenAddress.toLowerCase()
          ) &&
          item.decodedDataJson.tokenChainId === daoInfo.config.DAO_CHAINS[0].id;
        return hasMatch;
      }
      const hasMatch =
        item?.decodedDataJson.tokenAddress?.some(address =>
          addresses?.includes(address.toLowerCase())
        ) &&
        item.decodedDataJson.tokenChainId === daoInfo.config.DAO_CHAINS[0].id;

      return hasMatch;
    });

    const filteredResults = await Promise.all(
      filteredToDAO.map(async item => {
        let votingPower = 0;
        let ensName: string | undefined | null = '';
        const axiosClient = await api
          .get(`/dao/find-delegate`, {
            params: {
              dao: daoInfo.config.DAO_KARMA_ID,
              user: item.attester,
            },
          })
          .catch(() => null);
        if (axiosClient) {
          const { delegate: fetchedDelegate } = axiosClient.data.data;

          votingPower = fetchedDelegate.voteWeight;
          ensName = fetchedDelegate.ensName;
        }
        if (!ensName) {
          const fetched = await fetchENSNames([item.attester]);
          ensName = fetched[0].name;
        }

        const { comment } = item.decodedDataJson as any;

        return {
          attestationUID: item.id,
          addressOrENS: ensName || item.attester,
          date: item.timeCreated,
          votingPower: formatNumberPercentage(votingPower || 0),
          reason: comment,
        };
      })
    );

    const orderedDate = filteredResults.sort(
      (itemA, itemB) => itemB.date - itemA.date
    );
    setData(orderedDate);
    setIsLoading(false);
  };

  const getFormattedData = (date: number) =>
    formatDate(new Date(date * 1000).toUTCString(), 'MMM D, YYYY');

  useEffect(() => {
    if (profileSelected || (profileSelected && shouldRefreshEndorsements)) {
      getRecentAttestations();
    }
  }, [profileSelected, shouldRefreshEndorsements]);

  const [itemOffset, setItemOffset] = useState(0);

  const itemsPerPage = 10;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = data.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(data.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % data.length;
    setItemOffset(newOffset);
  };

  return (
    <Flex
      mb="20"
      py="5"
      border="1px solid"
      borderColor={theme.modal.header.title}
      borderRadius="12px"
      flexDir="column"
    >
      <Flex px="6" flexDir="row" gap="1" alignItems="center">
        <Text
          fontSize={{ base: '14px', sm: '18px' }}
          fontWeight="700"
          color={theme.modal.header.title}
        >
          Endorsements Received
        </Text>
        {endorsersCounter ? (
          <Text
            fontSize={{ base: '13px', sm: '14px' }}
            fontWeight="500"
            color={theme.modal.header.title}
          >
            ({endorsersCounter})
          </Text>
        ) : null}
      </Flex>

      {isLoading ? (
        <Flex w="full" py="8" alignItems="center" justifyContent="center">
          <Spinner color={theme.modal.header.title} />
        </Flex>
      ) : endorsersCounter ? (
        <>
          <TableContainer>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th
                    borderBottom="1px solid"
                    borderBottomColor={theme.modal.header.title}
                    fontSize="12px"
                    fontWeight="500"
                    color="#F2F4F7"
                  >
                    Received from
                  </Th>
                  <Th
                    borderBottom="1px solid"
                    borderBottomColor={theme.modal.header.title}
                    fontSize="12px"
                    fontWeight="500"
                    color="#F2F4F7"
                  >
                    Voting Power
                  </Th>
                  <Th
                    borderBottom="1px solid"
                    borderBottomColor={theme.modal.header.title}
                    fontSize="12px"
                    fontWeight="500"
                    color="#F2F4F7"
                    display={{ base: 'none', sm: 'table-cell' }}
                  >
                    Date
                  </Th>
                  <Th
                    borderBottom="1px solid"
                    borderBottomColor={theme.modal.header.title}
                    fontSize="12px"
                    fontWeight="500"
                    color="#F2F4F7"
                    display={{ base: 'none', sm: 'table-cell' }}
                  />
                  <Th
                    borderBottom="1px solid"
                    borderBottomColor={theme.modal.header.title}
                    fontSize="12px"
                    fontWeight="500"
                    color="#F2F4F7"
                    display={{ base: 'none', sm: 'table-cell' }}
                  />
                </Tr>
              </Thead>
              <Tbody>
                {currentItems.map((item, index) => (
                  <Tr key={item.date + +index}>
                    <Td
                      borderBottom="1px solid"
                      borderBottomColor={theme.modal.header.title}
                      color={theme.modal.header.title}
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      fontSize={{ base: '13px', sm: '14px' }}
                      maxW={{ base: '120px', md: 'none' }}
                    >
                      {item.addressOrENS}
                    </Td>
                    <Td
                      borderBottom="1px solid"
                      borderBottomColor={theme.modal.header.title}
                      color={theme.modal.header.title}
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      fontSize={{ base: '13px', sm: '14px' }}
                      maxW={{ base: '120px', md: 'none' }}
                    >
                      {item.votingPower}
                    </Td>
                    <Td
                      borderBottom="1px solid"
                      borderBottomColor={theme.modal.header.title}
                      color={theme.modal.header.title}
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      fontSize={{ base: '13px', sm: '14px' }}
                      maxW={{ base: '120px', md: 'none' }}
                      display={{ base: 'none', sm: 'table-cell' }}
                    >
                      {getFormattedData(item.date)}
                    </Td>
                    <Td
                      borderBottom="1px solid"
                      borderBottomColor={theme.modal.header.title}
                      color="blue.400"
                      textOverflow="ellipsis"
                      whiteSpace="nowrap"
                      overflow="hidden"
                      fontSize={{ base: '13px', sm: '14px' }}
                      maxW={{ base: '120px', md: 'none' }}
                      display={{ base: 'none', sm: 'table-cell' }}
                    >
                      <Link
                        isExternal
                        href={
                          getEASChainInfo(daoInfo.config.DAO_KARMA_ID)
                            .explorerUrl + item.attestationUID
                        }
                      >
                        <Icon as={FaExternalLinkAlt} w="4" h="4" />
                      </Link>
                    </Td>
                    <Td
                      borderBottom="1px solid"
                      borderBottomColor={theme.modal.header.title}
                      color={theme.modal.header.title}
                      textDecoration="underline"
                      fontSize={{ base: '13px', sm: '14px' }}
                      display={{ base: 'none', sm: 'table-cell' }}
                    >
                      {item.reason ? (
                        <CommentModal reason={item.reason} />
                      ) : null}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>

          <ReactPaginate
            breakLabel="..."
            nextLabel={
              <Flex
                flexDir="row"
                w="max-content"
                gap="2"
                alignItems="center"
                color={theme.modal.header.title}
                backgroundColor="transparent"
                px="2"
                py="1"
                borderRadius="2px"
              >
                Next <Icon as={AiOutlineArrowRight} w="5" h="5" />
              </Flex>
            }
            previousLabel={
              <Flex
                flexDir="row"
                w="max-content"
                gap="2"
                alignItems="center"
                color={theme.modal.header.title}
                backgroundColor="transparent"
                px="2"
                py="1"
                borderRadius="2px"
              >
                <Icon as={AiOutlineArrowLeft} w="5" h="5" /> Previous
              </Flex>
            }
            pageLinkClassName="navigator-active-link"
            pageLabelBuilder={pageNumber => (
              <Text
                color={theme.modal.header.title}
              >{`Page ${pageNumber}`}</Text>
            )}
            onPageChange={handlePageClick}
            pageRangeDisplayed={2}
            marginPagesDisplayed={1}
            pageCount={pageCount}
            className="navigator-active"
            renderOnZeroPageCount={null}
          />
        </>
      ) : (
        <Flex
          flexDir="row"
          alignItems="center"
          justifyContent="center"
          w="full"
          px="4"
          py="4"
        >
          <Text color={theme.modal.header.title}>No endorsements found.</Text>
        </Flex>
      )}
    </Flex>
  );
};
