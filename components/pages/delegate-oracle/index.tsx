import React, { useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Text,
  Heading,
  Spinner,
  IconButton,
  Flex,
  HStack,
  Icon,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FiSearch, FiCheck, FiX } from 'react-icons/fi';
import { IoCopy } from 'react-icons/io5';
import { useRouter } from 'next/router';
import { formatDate, truncateAddress } from 'utils';
import {
  IDelegateOracleResponse,
  IDelegateOracleScore,
} from 'types/DelegateOracle';
import { useDAO } from 'contexts';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { useQuery } from '@tanstack/react-query';
import { useToasty } from 'hooks';
import axios from 'axios';
import { KARMA_API } from 'helpers';

type SortableFields =
  | 'onChainParticipation'
  | 'offChainParticipation'
  | 'finalScore';

const DelegateTable = React.memo(
  ({
    data,
    sortField,
    sortOrder,
    onSort,
    daoInfo,
    theme,
  }: {
    data: IDelegateOracleScore[];
    sortField: SortableFields;
    sortOrder: 'asc' | 'desc';
    onSort: (field: SortableFields) => void;
    daoInfo: any;
    theme: any;
  }) => {
    const { toast } = useToasty();
    const isMobile = useBreakpointValue({ base: true, md: false });

    const handleCopy = (address: string) => {
      navigator.clipboard.writeText(address);
      toast({
        title: 'Copied to clipboard',
        description: 'Address copied',
        duration: 3000,
      });
    };

    return (
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
              Delegate
            </Th>
            <Th
              borderColor={theme.compensation?.card.divider}
              color={theme.compensation?.card.text}
              textTransform="none"
              fontSize="14px"
              fontWeight="700"
              cursor="pointer"
              onClick={() => onSort('onChainParticipation')}
              textAlign="center"
            >
              Onchain Score{' '}
              {sortField === 'onChainParticipation' &&
                (sortOrder === 'asc' ? '↑' : '↓')}
            </Th>
            <Th
              borderColor={theme.compensation?.card.divider}
              color={theme.compensation?.card.text}
              textTransform="none"
              fontSize="14px"
              fontWeight="700"
              cursor="pointer"
              onClick={() => onSort('offChainParticipation')}
              textAlign="center"
            >
              Offchain Score{' '}
              {sortField === 'offChainParticipation' &&
                (sortOrder === 'asc' ? '↑' : '↓')}
            </Th>
            <Th
              borderColor={theme.compensation?.card.divider}
              color={theme.compensation?.card.text}
              textTransform="none"
              fontSize="14px"
              fontWeight="700"
              cursor="pointer"
              onClick={() => onSort('finalScore')}
              textAlign="center"
            >
              Total Score{' '}
              {sortField === 'finalScore' && (sortOrder === 'asc' ? '↑' : '↓')}
            </Th>
            <Th
              borderColor={theme.compensation?.card.divider}
              color={theme.compensation?.card.text}
              textTransform="none"
              fontSize="14px"
              fontWeight="700"
              textAlign="center"
            >
              Score on Chain
            </Th>
            <Th
              borderColor={theme.compensation?.card.divider}
              color={theme.compensation?.card.text}
              textTransform="none"
              fontSize="14px"
              fontWeight="700"
            >
              Last Updated
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.map(item => (
            <Tr key={item.address}>
              <Td
                borderColor={theme.compensation?.card.divider}
                maxW={{ base: '180px', md: 'none' }}
                minW={{ base: '180px', md: 'none' }}
                pr={2}
              >
                <HStack spacing={2} width="100%">
                  <ImgWithFallback
                    src={`${daoInfo?.config?.IMAGE_PREFIX_URL}${item.address}`}
                    fallback={item.address}
                    boxSize={{ base: '24px', md: '32px' }}
                    borderRadius="full"
                    flexShrink={0}
                  />
                  <Text
                    color={theme.compensation?.card.text}
                    fontSize="md"
                    isTruncated
                    flex={{ base: '1', md: 'none' }}
                  >
                    {isMobile ? truncateAddress(item.address) : item.address}
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
                    onClick={() => handleCopy(item.address)}
                    h="max-content"
                    w="min-content"
                    minW="min-content"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Icon
                      as={IoCopy}
                      color={theme.subtitle}
                      boxSize={{ base: 3, md: 4 }}
                    />
                  </Button>
                </HStack>
              </Td>
              <Td
                borderColor={theme.compensation?.card.divider}
                color={theme.compensation?.card.text}
                textAlign="center"
              >
                {item.onChainParticipation}
              </Td>
              <Td
                borderColor={theme.compensation?.card.divider}
                color={theme.compensation?.card.text}
                textAlign="center"
              >
                {item.offChainParticipation}
              </Td>
              <Td
                borderColor={theme.compensation?.card.divider}
                color={theme.compensation?.card.text}
                textAlign="center"
              >
                {item.finalScore}
              </Td>
              <Td
                borderColor={theme.compensation?.card.divider}
                textAlign="center"
              >
                <Flex justify="center">
                  <Box
                    bg={item.scoreOnChain ? 'green.200' : 'red.300'}
                    display="flex"
                    alignItems="center"
                    width="fit-content"
                    fontSize="14px"
                    padding="4px"
                    rounded="100px"
                    color="black"
                  >
                    {item.scoreOnChain ? (
                      <>
                        <Icon as={FiCheck} boxSize="20px" />
                      </>
                    ) : (
                      <>
                        <Icon as={FiX} boxSize="20px" />
                      </>
                    )}
                  </Box>
                </Flex>
              </Td>
              <Td
                borderColor={theme.compensation?.card.divider}
                color={theme.compensation?.card.text}
              >
                {item.lastUpdated
                  ? formatDate(
                      new Date(Number(item.lastUpdated) * 1000)?.toISOString(),
                      'MMM D, YYYY HH:mm'
                    )
                  : '-'}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  }
);

DelegateTable.displayName = 'DelegateTable';

const DelegateOraclePage = () => {
  const router = useRouter();

  // Get initial values from URL asPath or defaults
  const getInitialValues = () => {
    const queryString = router.asPath.split('?')[1];
    if (!queryString) {
      return {
        field: 'finalScore' as SortableFields,
        order: 'desc' as const,
        page: 1,
        pageSize: 20,
        search: '',
      };
    }
    const querySortField = queryString.match(/(?<=sort=)[^&]*/i)?.[0];
    const queryOrder = queryString.match(/(?<=order=)[^&]*/i)?.[0];
    const queryPage = queryString.match(/(?<=page=)[^&]*/i)?.[0];
    const querySearch = queryString.match(/(?<=search=)[^&]*/i)?.[0];

    const validSortField = (field: string | undefined): SortableFields => {
      if (
        field === 'onChainParticipation' ||
        field === 'offChainParticipation' ||
        field === 'finalScore'
      ) {
        return field;
      }
      return 'finalScore';
    };

    return {
      field: validSortField(querySortField),
      order: (queryOrder === 'asc' || queryOrder === 'desc'
        ? queryOrder
        : 'desc') as 'asc' | 'desc',
      page: queryPage ? parseInt(queryPage, 10) : 1,
      pageSize: 20,
      search: querySearch ? decodeURIComponent(querySearch) : '',
    };
  };

  const initialValues = getInitialValues();
  const [sortField, setSortField] = useState<SortableFields>(
    initialValues.field
  );
  const [sortOrder, setSortOrder] = useState(initialValues.order);
  const [page, setPage] = useState(initialValues.page);
  const [searchQuery, setSearchQuery] = useState(initialValues.search);
  const { pageSize } = initialValues;

  const { selectedDAO, daoInfo, rootPathname, theme } = useDAO();

  // Fetch delegate oracle data using react-query
  const { data: queryResult, isLoading } = useQuery<
    IDelegateOracleResponse | undefined
  >(
    ['delegateOracle', selectedDAO, page, searchQuery, sortField, sortOrder],
    async () => {
      const authorizedAPI = axios.create({
        timeout: 30000,
        baseURL: KARMA_API.base_url,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const response = await authorizedAPI
        .get(`/delegate-oracle`, {
          params: {
            sortBy: sortField,
            order: sortOrder,
            offset: (page - 1) * pageSize,
            limit: pageSize,
            address: searchQuery,
          },
        })
        .then(res => res?.data?.data)
        .catch(err => {
          throw err;
        });
      if (response.error) {
        throw new Error(response.error);
      }
      return response;
    },
    {
      enabled: !!selectedDAO,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const data = queryResult?.delegates || [];
  const paginationInfo = queryResult?.pagination;
  const totalPages = paginationInfo?.totalPages || 0;
  const totalItems = paginationInfo?.total || 0;

  // Update URL with all parameters
  const updateURL = (params: {
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
    search?: string;
  }) => {
    const query: Record<string, string | number> = {
      sort: params.sort || sortField,
      order: params.order || sortOrder,
      page: params.page || page,
    };

    // Only add search to URL if it's not empty
    const searchValue = params.search ?? searchQuery;
    if (searchValue && searchValue.length > 0) {
      query.search = searchValue;
    }

    router.push(
      {
        pathname: `${rootPathname}/delegate-oracle`,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const handleSort = (field: SortableFields) => {
    const newOrder =
      sortField === field && sortOrder === 'desc' ? 'asc' : 'desc';

    setSortField(field);
    setSortOrder(newOrder);
    setPage(1);
    updateURL({ sort: field, order: newOrder, page: 1 });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchQuery = event.target.value;
    setSearchQuery(newSearchQuery);
    setPage(1);
    updateURL({ page: 1, search: newSearchQuery });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(1);
    updateURL({ page: 1, search: '' });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateURL({ page: newPage });
  };

  if (!selectedDAO) {
    return <Text>Please select a DAO</Text>;
  }

  return (
    <Box width="100%" px={4} py={6}>
      <Flex
        justify={{ base: 'center', md: 'space-between' }}
        align="center"
        mb={6}
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 0 }}
      >
        <Heading as="h2" size="lg" textAlign={{ base: 'center', md: 'left' }}>
          Delegate Oracle Scores {totalItems ? `(${totalItems})` : undefined}
        </Heading>
        <InputGroup maxW={{ base: '100%', md: '300px' }} size="md">
          <Input
            placeholder="Search by delegate address"
            value={searchQuery}
            onChange={handleSearch}
          />
          <InputRightElement>
            <IconButton
              aria-label={searchQuery ? 'Clear search' : 'Search'}
              icon={searchQuery ? <FiX /> : <FiSearch />}
              size="sm"
              variant="ghost"
              onClick={searchQuery ? handleClearSearch : undefined}
              cursor={searchQuery ? 'pointer' : 'default'}
            />
          </InputRightElement>
        </InputGroup>
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" minH="200px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <>
          <Box overflowX="auto" width="100%">
            <DelegateTable
              data={data}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              daoInfo={daoInfo}
              theme={theme}
            />
          </Box>

          <Flex justify="center" align="center" mt={4}>
            <HStack spacing={{ base: 1, md: 2 }}>
              <Button
                display={{ base: 'none', sm: 'flex' }}
                bg="white"
                color="black"
                size={{ base: 'sm', md: 'md' }}
                _hover={{
                  opacity: 0.9,
                }}
                _disabled={{
                  opacity: 0.25,
                  cursor: 'not-allowed',
                }}
                onClick={() => handlePageChange(1)}
                isDisabled={page === 1}
              >
                First
              </Button>
              <Button
                bg="white"
                color="black"
                size={{ base: 'sm', md: 'md' }}
                _hover={{
                  opacity: 0.9,
                }}
                _disabled={{
                  opacity: 0.25,
                  cursor: 'not-allowed',
                }}
                onClick={() => handlePageChange(page - 1)}
                isDisabled={page === 1}
              >
                <Text display={{ base: 'none', sm: 'block' }}>Previous</Text>
                <Text display={{ base: 'block', sm: 'none' }}>Prev</Text>
              </Button>
              <Text fontSize={{ base: 'sm', md: 'md' }} whiteSpace="nowrap">
                Page {page} of {totalPages}
              </Text>
              <Button
                bg="white"
                color="black"
                size={{ base: 'sm', md: 'md' }}
                _hover={{
                  opacity: 0.9,
                }}
                _disabled={{
                  opacity: 0.25,
                  cursor: 'not-allowed',
                }}
                onClick={() => handlePageChange(page + 1)}
                isDisabled={page >= totalPages}
              >
                Next
              </Button>
              <Button
                display={{ base: 'none', sm: 'flex' }}
                bg="white"
                color="black"
                size={{ base: 'sm', md: 'md' }}
                _hover={{
                  opacity: 0.9,
                }}
                _disabled={{
                  opacity: 0.25,
                  cursor: 'not-allowed',
                }}
                onClick={() => handlePageChange(totalPages)}
                isDisabled={page === totalPages}
              >
                Last
              </Button>
            </HStack>
          </Flex>
        </>
      )}
    </Box>
  );
};

export default DelegateOraclePage;
