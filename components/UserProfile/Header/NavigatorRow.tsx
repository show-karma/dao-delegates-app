import { Flex } from '@chakra-ui/react';
import { useAuth, useDAO } from 'contexts';
import { FC } from 'react';
import { IActiveTab, IDelegate } from 'types';
import { NavButton } from './NavButton';

interface INavigatorRow {
  profile: IDelegate;
  isSamePerson: boolean;
  activeTab: IActiveTab;
  changeTab: (selectedTab: IActiveTab) => void;
}

export const NavigatorRow: FC<INavigatorRow> = ({
  profile,
  isSamePerson,
  activeTab,
  changeTab,
}) => {
  const { theme, daoInfo } = useDAO();
  const { isDaoAdmin, isAuthenticated } = useAuth();
  const isActiveTab = (section: IActiveTab) => activeTab === section;

  return (
    <Flex px="0" flexDir="column" gap="0" w="full" mb="8">
      <Flex
        w="full"
        justifyContent="flex-start"
        gap="1px"
        borderTopRadius="5px"
        maxW="full"
        borderBottomWidth="1px"
        borderBottomStyle="solid"
        borderBottomColor="gray.600"
        flexWrap="wrap"
      >
        {profile.aboutMe && (
          <NavButton
            isActive={isActiveTab('aboutme')}
            onClick={() => changeTab('aboutme')}
            w="max-content"
            borderTopLeftRadius={profile.aboutMe ? '5px' : '0'}
          >
            About me
          </NavButton>
        )}
        <NavButton
          isActive={isActiveTab('overview')}
          onClick={() => changeTab('overview')}
          borderTopLeftRadius={profile.aboutMe ? '0' : '5px'}
        >
          Overview
        </NavButton>
        {daoInfo.config.DAO_SUPPORTS_TOA ? (
          <NavButton
            isActive={isActiveTab('toa')}
            onClick={() => changeTab('toa')}
            borderTopRightRadius={isSamePerson || isDaoAdmin ? '0' : '5px'}
            minW="max-content"
          >
            Delegation Agreement
          </NavButton>
        ) : null}
        <NavButton
          isActive={isActiveTab('votinghistory')}
          onClick={() => changeTab('votinghistory')}
          borderTopRightRadius={isSamePerson || isDaoAdmin ? '0' : '5px'}
        >
          Voting History
        </NavButton>

        <NavButton
          isActive={isActiveTab('reward-details')}
          onClick={() => changeTab('reward-details')}
          borderTopRightRadius={isSamePerson || isDaoAdmin ? '0' : '5px'}
          w="max-content"
        >
          Reward Details
        </NavButton>

        {isSamePerson && isAuthenticated && (
          <NavButton
            isActive={isActiveTab('withdraw')}
            onClick={() => changeTab('withdraw')}
            borderTopRightRadius={isSamePerson ? '0' : '5px'}
            w="max-content"
          >
            Withdraw
          </NavButton>
        )}

        {(isSamePerson || isDaoAdmin) &&
        isAuthenticated &&
        daoInfo.config.SHOULD_NOT_SHOW !== 'handles' ? (
          <NavButton
            isActive={isActiveTab('handles')}
            onClick={() => changeTab('handles')}
            borderTopRightRadius={isSamePerson ? '0' : '5px'}
            w="max-content"
          >
            Handles
          </NavButton>
        ) : (
          <Flex
            borderBottomWidth="1px"
            borderBottomStyle="solid"
            borderBottomColor={`${theme.modal.buttons.navBorder}0D`}
            h="full"
            minH="52px"
            flex="1"
            ml="-1px"
            sx={{
              '@media(max-width: 1116px)': {
                display: 'none',
              },
            }}
          />
        )}
      </Flex>
    </Flex>
  );
};
