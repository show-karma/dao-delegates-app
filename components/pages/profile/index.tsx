import React, { FC, useMemo, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Box, Text } from '@chakra-ui/react';
import {
  EditProfileProvider,
  useDAO,
  useDelegates,
  VotesProvider,
} from 'contexts';
import { Header } from 'components/UserProfile/Header';
import { VotingHistory } from 'components/UserProfile/VotingHistory';
import { EndorsementsReceived } from 'components/UserProfile/EndorsementsReceived';
import { EndorsementsGiven } from 'components/UserProfile/EndorsementsGiven';
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
  if (activeTab === 'endorsements-received') {
    return <EndorsementsReceived />;
  }
  if (activeTab === 'endorsements-given') {
    return <EndorsementsGiven />;
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
    <EditProfileProvider>
      <Box
        maxW={{ base: '400px', md: '820px', lg: '944px', xl: '1360px' }}
        w={{ base: 'auto', lg: 'full' }}
        borderRadius="12px"
        bgColor={theme.modal.background}
        mx="1rem"
        p="6"
      >
        <Header changeTab={changeTab} activeTab={activeTab} profile={profile} />
        <Tab activeTab={activeTab} profile={profile} />
      </Box>
    </EditProfileProvider>
  );
};

export default UserProfilePage;
