/* eslint-disable no-nested-ternary */
import { Flex, Grid, Spinner, Text, useDisclosure } from '@chakra-ui/react';
import {
  IBreakdownProps,
  ScoreBreakdownProvider,
  useDAO,
  useDelegates,
  useWallet,
} from 'contexts';
import dynamic from 'next/dynamic';
import { FC, useMemo, useState } from 'react';
import { IDelegate } from 'types';

const InfiniteScroll = dynamic(
  () => import('react-infinite-scroller').then(module => module.default),
  { ssr: false }
);

const StyledModal = dynamic(
  () =>
    import('components/Modals/DelegateToAnyone/StyledModal').then(
      module => module.StyledModal
    ),
  { ssr: false }
);

const ScoreBreakdown = dynamic(
  () => import('components').then(module => module.ScoreBreakdown),
  { ssr: false }
);

const DelegateModal = dynamic(
  () => import('components').then(module => module.DelegateModal),
  { ssr: false }
);

const DelegateCard = dynamic(() =>
  import('components').then(module => module.DelegateCard)
);

const EmptyStates = dynamic(() =>
  import('components').then(module => module.EmptyState)
);

const loadingArray = Array(3).fill(undefined);

interface IDelegatesList {
  pathUser?: string;
}

interface IDelegatesCasesProps {
  delegates: IDelegate[];
  isLoading: boolean;
  onModalOpen: (data: IBreakdownProps) => void;
}

const DelegatesCases: FC<IDelegatesCasesProps> = ({
  delegates,
  isLoading,
  onModalOpen,
}) => {
  if (isLoading) {
    if (delegates.length <= 0) {
      return (
        <>
          {loadingArray.map((_, index) => (
            <DelegateCard key={+index} />
          ))}
        </>
      );
    }
    return (
      <>
        {delegates.map(item => (
          <DelegateCard
            key={JSON.stringify(item)}
            data={item}
            onModalOpen={onModalOpen}
          />
        ))}
      </>
    );
  }
  return (
    <>
      {delegates.map(item => (
        <DelegateCard
          key={JSON.stringify(item)}
          data={item}
          onModalOpen={onModalOpen}
        />
      ))}
    </>
  );
};

// Helper function to format the period
const formatPeriod = (period = 'lifetime') => {
  if (period === 'lifetime') return '';
  return `${parseInt(period, 10)} Days`;
};

export const DelegatesList: FC<IDelegatesList> = ({ pathUser }) => {
  const {
    isLoading,
    fetchNextDelegates,
    hasMore,
    profileSelected,
    searchProfileModal,
    interestFilter,
    delegates,
  } = useDelegates();
  const { theme } = useDAO();

  const [selectedBreakdownUser, setSelectedBreakdownUser] =
    useState<IBreakdownProps | null>(null);
  const { onOpen, isOpen, onClose: closeModal } = useDisclosure();

  const onModalOpen = (data: IBreakdownProps) => {
    setSelectedBreakdownUser(data);
    onOpen();
  };

  const onClose = () => {
    closeModal();
    setSelectedBreakdownUser(null);
  };

  const { delegateIsOpen, delegateOnToggle } = useWallet();

  const searchProfileSelected = async (userToSearch: string) => {
    await searchProfileModal(userToSearch);
  };

  useMemo(() => {
    if (pathUser) searchProfileSelected(pathUser);
  }, [pathUser]);

  return (
    <>
      <Flex
        flexDir="column"
        align="center"
        w="full"
        maxW={{ base: '400px', md: '820px', lg: '944px', xl: '1360px' }}
      >
        {!!interestFilter.length && (
          <Flex textAlign="start" w={{ base: 'full' }} fontSize={12} mb={4}>
            <Text as="span">
              <Text as="b">Delegate Interests: </Text>
              {interestFilter.join(', ')}
            </Text>
          </Flex>
        )}
        {!!profileSelected &&
          !!Object.values(profileSelected).length &&
          delegateIsOpen && (
            <DelegateModal
              delegateData={profileSelected}
              open={delegateIsOpen}
              handleModal={delegateOnToggle}
            />
          )}
        <InfiniteScroll
          pageStart={0}
          loadMore={() => {
            if (delegates.length && !isLoading && delegates.length >= 10)
              fetchNextDelegates();
          }}
          hasMore={hasMore}
          loader={
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <div key="spinner">
              {isLoading && delegates.length > 0 && (
                <Flex
                  width="full"
                  py="16"
                  align="center"
                  justify="center"
                  key="loading-spinner"
                >
                  <Spinner w="20" h="20" />
                </Flex>
              )}
            </div>
          }
          style={{ width: '100%' }}
        >
          <Grid
            rowGap={{ base: '6', md: '4' }}
            columnGap={{ base: '4', md: '4' }}
            w="full"
            templateColumns={{
              base: 'repeat(1, 1fr)',
              sm: 'repeat(1, 1fr)',
              md: 'repeat(2, auto)',
              xl: 'repeat(3, 1fr)',
            }}
            alignItems="center"
            justifyContent="space-between"
            mb="8"
            px={{ base: '4', lg: '0' }}
          >
            <DelegatesCases
              delegates={delegates}
              isLoading={isLoading}
              onModalOpen={onModalOpen}
            />
          </Grid>
        </InfiniteScroll>
        {!isLoading && !delegates.length && <EmptyStates />}
      </Flex>

      {selectedBreakdownUser && !!selectedBreakdownUser.address && (
        <StyledModal
          isOpen={isOpen}
          title={`Forum Score Breakdown ${
            formatPeriod(selectedBreakdownUser.period)
              ? ` (Last ${formatPeriod(selectedBreakdownUser.period)})`
              : ''
          }`}
          description={
            <Flex flexDir="column" gap="2" color={theme.text}>
              <Text>
                Below is an in-depth analysis of the user&apos;s engagement and
                impact within the DAO
                {formatPeriod(selectedBreakdownUser.period)
                  ? ` over the past ${formatPeriod(
                      selectedBreakdownUser.period
                    ).toLowerCase()}`
                  : ''}
                .
              </Text>
              <Text>
                The total score is derived from a calculated formula, reflecting
                the user&apos;s overall contributions in the forum.
              </Text>
            </Flex>
          }
          headerLogo
          onClose={onClose}
        >
          <ScoreBreakdownProvider
            address={selectedBreakdownUser.address}
            period={selectedBreakdownUser.period}
            type={selectedBreakdownUser.type}
          >
            <ScoreBreakdown />
          </ScoreBreakdownProvider>
        </StyledModal>
      )}
    </>
  );
};
