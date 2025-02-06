import { Flex, Spinner, Switch, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useAuth, useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { useState } from 'react';
import { DelegateCompensationStats } from 'types';
import { compensation } from 'utils/compensation';
import { fetchDelegates } from 'utils/delegate-compensation/fetchDelegates';
import { getProposals } from 'utils/delegate-compensation/getProposals';
import { MonthDropdown } from './MonthDropdown';
import { DelegatePerformanceOverviewHeader } from './PerformanceOverview/Header';
import { Table } from './Table';

export const DelegateCompensation = () => {
  const { theme, daoInfo } = useDAO();
  const [onlyOptIn, setOnlyOptIn] = useState(true);
  const { selectedDate } = useDelegateCompensation();
  const {
    data: delegates,
    isLoading,
    refetch,
  } = useQuery<DelegateCompensationStats[]>({
    queryKey: [
      'delegate-compensation',
      daoInfo.config.DAO_KARMA_ID,
      selectedDate?.value.month,
      selectedDate?.value.year,
      onlyOptIn,
    ],
    initialData: [],
    queryFn: () =>
      fetchDelegates(
        daoInfo.config.DAO_KARMA_ID,
        onlyOptIn,
        selectedDate?.value.month as number,
        selectedDate?.value.year as number
      ),
    enabled:
      !!selectedDate?.value.month &&
      !!selectedDate?.value.year &&
      !!daoInfo.config.DAO_KARMA_ID,
  });

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
      refetchOnWindowFocus: false,
    }
  );

  const isMonthFinished = proposalsData?.finished || false;

  const COMPENSATION_DATES =
    compensation.compensationDates[
      daoInfo.config.DAO_KARMA_ID as keyof typeof compensation.compensationDates
    ];

  const { isDaoAdmin: isAuthorized } = useAuth();

  return (
    <Flex
      flexDir={{ base: 'column', lg: 'row' }}
      w="full"
      gap={{ base: '24px', '2xl': '48px' }}
      py="6"
    >
      <Flex
        paddingX={{ base: '2', lg: '0' }}
        flex="1"
        w="full"
        overflowX="auto"
        flexDirection="column"
        gap={{ base: '4', lg: '4' }}
      >
        <DelegatePerformanceOverviewHeader />
        <Flex
          flexDir="row"
          w="full"
          justifyContent="space-between"
          align="center"
          bg={theme.compensation?.performanceOverview.header.bg.card}
          borderRadius="2xl"
          px="4"
          py="6"
          gap="4"
          flexWrap="wrap"
        >
          <Text
            color={theme.compensation?.performanceOverview.header.text}
            fontSize={{ base: '20px', lg: '24px' }}
            fontWeight="600"
          >
            Delegate Performance Overview
          </Text>
          <Flex
            flexDirection="row"
            gap={{ base: '3  ', lg: '6' }}
            alignItems="center"
            justifyContent="flex-start"
            flexWrap="wrap"
          >
            <Switch
              display="flex"
              defaultChecked={onlyOptIn}
              onChange={event => {
                setOnlyOptIn(event.target.checked);
              }}
              alignItems="center"
              gap="0"
              id="only-opt-in"
              fontWeight={400}
              fontSize={{ base: '14px', lg: '16px' }}
            >
              Show only opt-in
            </Switch>
            <Flex flexDirection="row" gap="4" alignItems="center">
              <Text
                display={{ base: 'none', lg: 'flex' }}
                color={theme.card.text}
                fontSize="16px"
                fontWeight="600"
              >
                Month
              </Text>
              <MonthDropdown
                minimumPeriod={
                  COMPENSATION_DATES.OLD_VERSION_MIN ||
                  COMPENSATION_DATES.NEW_VERSION_MIN
                }
                maximumPeriod={COMPENSATION_DATES.AVAILABLE_MAX}
              />
            </Flex>
          </Flex>
        </Flex>
        {isLoading ? (
          <Flex justifyContent="center" alignItems="center" w="full">
            <Spinner w="32px" h="32px" />
          </Flex>
        ) : (
          <Table
            delegates={delegates}
            refreshFn={async () => {
              await refetch();
            }}
            isMonthFinished={isMonthFinished}
            isAuthorized={isAuthorized}
          />
        )}
      </Flex>
    </Flex>
  );
};
