/* eslint-disable no-nested-ternary */
import { Flex, Spinner } from '@chakra-ui/react';
import { useAuth, useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { DelegateCompensationAdminLayout } from 'layouts/delegateCompensationAdmin';
import { useEffect } from 'react';
import { compensation } from 'utils/compensation';
import { DelegatePeriod } from '../DelegatePeriod';
import { DelegateOptSwitch } from './DelegateOptSwitch';
import { DelegateProposals } from './DelegateProposals';
import { DelegateStats } from './DelegateStats';

export const DelegateCompensationAdminDelegates = ({
  delegateAddress,
  shouldShowDelegate = 'dropdown',
  isPublic = false,
}: {
  delegateAddress?: string;
  shouldShowDelegate?: 'block' | 'dropdown' | 'none';
  isPublic?: boolean;
}) => {
  const { selectedDate } = useDelegateCompensation();
  const { isDaoAdmin } = useAuth();
  const { daoInfo } = useDAO();

  const {
    delegateInfo,
    isFetchingDelegateInfo,
    isLoadingDelegateInfo,
    changeDelegateAddress,
  } = useDelegateCompensation();

  const delegateVotes =
    delegateInfo?.stats?.communicatingRationale?.breakdown || {};

  useEffect(() => {
    if (delegateAddress) {
      changeDelegateAddress(delegateAddress);
    }
  }, [delegateAddress]);

  const COMPENSATION_DATES =
    compensation.compensationDates[
      daoInfo.config.DAO_KARMA_ID as keyof typeof compensation.compensationDates
    ];

  return (
    <DelegateCompensationAdminLayout>
      <Flex align="stretch" flex={1} w="full" flexDirection="column" gap="8">
        <DelegatePeriod
          delegate={shouldShowDelegate}
          minimumPeriod={new Date(COMPENSATION_DATES.NEW_VERSION_MIN)}
          maximumPeriod={
            isPublic ? new Date(COMPENSATION_DATES.AVAILABLE_MAX) : new Date()
          }
        />
        {isFetchingDelegateInfo || isLoadingDelegateInfo ? (
          <Flex w="full" h="20" align="center" justify="center">
            <Spinner />
          </Flex>
        ) : (
          <Flex
            flexDir="column"
            alignItems="flex-start"
            justify="flex-start"
            gap="4"
            w="full"
          >
            {isDaoAdmin && <DelegateOptSwitch />}
            <DelegateStats />
            {delegateInfo?.stats ? (
              <DelegateProposals delegateVotes={delegateVotes} />
            ) : null}
          </Flex>
        )}
      </Flex>
    </DelegateCompensationAdminLayout>
  );
};
