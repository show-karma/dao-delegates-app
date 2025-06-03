import React, { FC, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Box, Flex, Text } from '@chakra-ui/react';
import { useDAO, useDelegates, VotesProvider } from 'contexts';
import { Header } from 'components/UserProfile/Header';
import { VotingHistory } from 'components/UserProfile/VotingHistory';
import { useMixpanel } from 'hooks';
import { IActiveTab, IDelegate } from 'types';

const WithdrawDelegation = dynamic(() =>
  import('components/UserProfile/WithdrawDelegation').then(
    module => module.WithdrawDelegation
  )
);

const AboutMe = dynamic(() =>
  import('components/UserProfile/AboutMe').then(module => module.AboutMe)
);

const Statement = dynamic(() =>
  import('components/UserProfile/Statement').then(module => module.Statement)
);

const ToA = dynamic(() =>
  import('components/UserProfile/ToA').then(module => module.ToA)
);

const Handles = dynamic(() =>
  import('components/UserProfile/Handles').then(module => module.Handles)
);

const RewardDetails = dynamic(() =>
  import('components/UserProfile/RewardDetails').then(
    module => module.RewardDetails
  )
);

const Tab: FC<{ activeTab: IActiveTab; profile: IDelegate }> = ({
  activeTab,
  profile,
}) => {
  if (activeTab === 'aboutme') {
    return <AboutMe profile={profile} />;
  }
  if (activeTab === 'votinghistory') {
    return (
      <VotesProvider address={profile.address}>
        <VotingHistory profile={profile} />
      </VotesProvider>
    );
  }
  if (activeTab === 'toa') {
    return <ToA />;
  }
  if (activeTab === 'handles') {
    return <Handles />;
  }
  if (activeTab === 'withdraw') {
    return <WithdrawDelegation />;
  }
  if (activeTab === 'reward-details') {
    return <RewardDetails profile={profile} />;
  }
  return <Statement />;
};

interface UserProfilePageProps {
  user: string;
}

const UserProfilePage = ({ user }: UserProfilePageProps) => {
  const router = useRouter();

  const { theme, rootPathname, daoInfo } = useDAO();
  const {
    profileSelected: profile,
    isLoading,
    searchProfileModal,
  } = useDelegates();
  const { mixpanel } = useMixpanel();

  // Get the selected tab from URL hash, defaulting to 'statement'
  const hash = router.asPath.split('#')[1];
  const selectedTab: IActiveTab = (hash as IActiveTab) || 'statement';

  // Fetching the profile info from an API endpoint using the user prop
  const [activeTab, setActiveTab] = useState<IActiveTab>(selectedTab);

  useMemo(() => {
    searchProfileModal(user, 'overview');
  }, [user]);

  useEffect(() => {
    setActiveTab(selectedTab);
  }, [selectedTab]);

  const changeTab = (newTab: IActiveTab) => {
    mixpanel.reportEvent({
      event: 'viewActivity',
      properties: { tab: newTab },
    });
    router
      .push({ pathname: rootPathname, hash: newTab }, undefined, {
        shallow: true,
      })
      .catch(error => {
        if (!error.cancelled) {
          throw error;
        }
      });
    setActiveTab(newTab);
  };

  if (isLoading) return <div>Loading profile...</div>;
  if (!profile)
    return (
      <Text color={theme.title}>
        We couldn&apos;t find the contributor page
      </Text>
    );

  return (
    <Flex
      bgColor={theme.modal.background}
      w="full"
      h="full"
      flexDir="column"
      align="center"
      flex="1"
    >
      <Flex
        bgColor={theme.modal.background}
        w="full"
        h="full"
        flexDir="column"
        align="center"
      >
        <Box
          maxW={{ base: '400px', md: '820px', lg: '944px', xl: '1360px' }}
          w={{ base: 'auto', lg: 'full' }}
          borderRadius="12px"
          bgColor={theme.modal.background}
          mx="1rem"
          py="6"
        >
          <Header
            changeTab={changeTab}
            activeTab={activeTab}
            profile={profile}
          />
          <Tab activeTab={activeTab} profile={profile} />
        </Box>
      </Flex>
    </Flex>
  );
};

export default UserProfilePage;
