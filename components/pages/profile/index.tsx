import React, { FC, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { Box } from '@chakra-ui/react';
import { EditProfileProvider, useDAO, VotesProvider } from 'contexts';
import { Header } from 'components/Modals/UserProfile/Header';
import { VotingHistory } from 'components/Modals/UserProfile/VotingHistory';
import { EndorsementsReceived } from 'components/Modals/UserProfile/EndorsementsReceived';
import { EndorsementsGiven } from 'components/Modals/UserProfile/EndorsementsGiven';
import { useMixpanel } from 'hooks';
import { IActiveTab, IProfile } from 'types';

const WithdrawDelegation = dynamic(() =>
  import('components/Modals/UserProfile/WithdrawDelegation').then(
    module => module.WithdrawDelegation
  )
);

const AboutMe = dynamic(() =>
  import('components/Modals/UserProfile/AboutMe').then(module => module.AboutMe)
);

const Statement = dynamic(() =>
  import('components/Modals/UserProfile/Statement').then(
    module => module.Statement
  )
);

const ToA = dynamic(() =>
  import('components/Modals/UserProfile/ToA').then(module => module.ToA)
);

const Handles = dynamic(() =>
  import('components/Modals/UserProfile/Handles').then(module => module.Handles)
);

const Tab: FC<{ activeTab: IActiveTab; profile: IProfile }> = ({
  activeTab,
  profile,
}) => {
  if (activeTab === 'aboutme') {
    return <AboutMe profile={profile} />;
  }
  if (activeTab === 'votinghistory') {
    return (
      <VotesProvider profile={profile}>
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

  const { theme, rootPathname } = useDAO();
  const { mixpanel } = useMixpanel();

  // Get the selected tab from URL hash, defaulting to 'statement'
  const hash = router.asPath.split('#')[1];
  const selectedTab: IActiveTab = (hash as IActiveTab) || 'statement';

  // For demonstration, using a dummy profile. In a real application, fetch profile data appropriately.
  const dummyProfile: IProfile = {
    address: '0x123',
    ensName: 'dummy.eth',
  } as IProfile;

  const [activeTab, setActiveTab] = useState<IActiveTab>(selectedTab);
  useMemo(() => {
    setActiveTab(selectedTab);
  }, [selectedTab]);

  const changeTab = (newTab: IActiveTab) => {
    mixpanel.reportEvent({
      event: 'viewActivity',
      properties: { tab: newTab },
    });
    router
      .push({ pathname: router.pathname, hash: newTab }, undefined, {
        shallow: true,
      })
      .catch(error => {
        if (!error.cancelled) {
          throw error;
        }
      });
    setActiveTab(newTab);
  };

  return (
    <EditProfileProvider>
      <Box
        maxW={{ base: 'max-content', lg: '1100px' }}
        w={{ base: 'auto', lg: 'full' }}
        borderRadius="12px"
        bgColor={theme.modal.background}
        mx="1rem"
        p="6"
      >
        <Header
          changeTab={changeTab}
          activeTab={activeTab}
          profile={dummyProfile}
        />
        <Tab activeTab={activeTab} profile={dummyProfile} />
      </Box>
    </EditProfileProvider>
  );
};

export default UserProfilePage;
