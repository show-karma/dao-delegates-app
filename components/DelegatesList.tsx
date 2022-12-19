/* eslint-disable no-nested-ternary */
import { Flex, SimpleGrid, Spinner, Text } from '@chakra-ui/react';
import { useDAO, useDelegates } from 'contexts';
import { FC, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { DelegateCard } from './DelegateCard';
import { UserProfile } from './Modals';

const loadingArray = Array(3).fill(undefined);

interface IDelegatesList {
  pathUser?: string;
}

const EmptyStates = () => {
  const { theme } = useDAO();
  const { isSearchDirty, interests } = useDelegates();

  if (isSearchDirty || interests.length > 0)
    return (
      <Text
        as="p"
        color={theme.title}
        w="full"
      >{`We couldn't find any contributors matching that criteria`}</Text>
    );
  return (
    <Text
      as="p"
      color={theme.title}
    >{`We couldn't find any contributor info`}</Text>
  );
};

const DelegatesCases: FC = () => {
  const { delegates, isLoading } = useDelegates();
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
          <DelegateCard key={`${JSON.stringify(item)}`} data={item} />
        ))}
      </>
    );
  }
  return (
    <>
      {delegates.map(item => (
        <DelegateCard key={`${JSON.stringify(item)}`} data={item} />
      ))}
    </>
  );
};

export const DelegatesList: FC<IDelegatesList> = ({ pathUser }) => {
  const {
    isLoading,
    fetchNextDelegates,
    hasMore,
    isOpenProfile,
    onCloseProfile,
    profileSelected,
    selectedTab,
    searchProfileModal,
    interestFilter,
    delegates,
  } = useDelegates();
  const { daoInfo } = useDAO();
  const { config } = daoInfo;

  const searchProfileSelected = async (userToSearch: string) => {
    await searchProfileModal(userToSearch);
  };

  useMemo(() => {
    if (pathUser) searchProfileSelected(pathUser);
  }, [pathUser]);

  return (
    <>
      {profileSelected && (
        <UserProfile
          isOpen={isOpenProfile}
          onClose={onCloseProfile}
          profile={{
            address: profileSelected.address,
            avatar:
              profileSelected.profilePicture ||
              `${config.IMAGE_PREFIX_URL}${profileSelected.address}`,
            ensName: profileSelected.ensName,
            twitter: profileSelected.twitterHandle,
            aboutMe: profileSelected.aboutMe,
            realName: profileSelected.realName,
          }}
          selectedTab={selectedTab}
        />
      )}
      <Flex flexDir="column" align="center" w="full" maxW="1360px">
        {!!interestFilter.length && (
          <Flex textAlign="start" w={{ base: 'full' }} fontSize={12} mb={4}>
            <Text as="span">
              <Text as="b">Delegate Interests: </Text>
              {interestFilter.join(', ')}
            </Text>
          </Flex>
        )}
        <InfiniteScroll
          pageStart={0}
          loadMore={fetchNextDelegates}
          hasMore={hasMore}
          disabled={isLoading}
          loader={
            <Flex
              width="full"
              py="16"
              align="center"
              justify="center"
              key="loading-spinner"
            >
              <Spinner w="20" h="20" />
            </Flex>
          }
          style={{ width: '100%' }}
        >
          <SimpleGrid
            flexWrap="wrap"
            rowGap="10"
            columnGap="8"
            w="full"
            columns={3}
            mb="8"
            px={{ base: '6', lg: '0' }}
          >
            <DelegatesCases />
          </SimpleGrid>
          {!isLoading && delegates.length <= 0 && <EmptyStates />}
        </InfiniteScroll>
      </Flex>
    </>
  );
};
