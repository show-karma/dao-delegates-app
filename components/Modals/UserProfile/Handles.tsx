import { Flex, Text, Icon, Button } from '@chakra-ui/react';
import { DiscordIcon, ForumIcon, TwitterIcon } from 'components';
import { useDAO, useDelegates, useHandles } from 'contexts';
import { FC } from 'react';
import { DiscourseModal, TwitterModal } from '../Linking';

export const Handles: FC = () => {
  const { theme, daoData, daoInfo } = useDAO();
  const {
    twitterIsOpen,
    twitterOnOpen,
    twitterOnToggle,
    forumIsOpen,
    forumOnToggle,
    forumOnOpen,
    twitterOnClose,
  } = useHandles();
  const { profileSelected } = useDelegates();

  const socialMedias = [
    {
      icon: TwitterIcon,
      name: 'Twitter',
      disabledCondition: daoInfo.config.SHOULD_NOT_SHOW === 'twitter',
      hideCondition: daoInfo.config.SHOULD_NOT_SHOW === 'twitter',
      action: () => {
        twitterOnOpen();
      },
      handle: profileSelected?.twitterHandle
        ? `@${profileSelected?.twitterHandle}`
        : undefined,
    },
    {
      icon: ForumIcon,
      name: 'Forum',
      hideCondition: !daoData?.forumTopicURL,
      action: () => {
        forumOnOpen();
      },
      handle: profileSelected?.discourseHandle,
    },
    {
      icon: DiscordIcon,
      name: 'Discord',
      action: () => null,
      hideCondition: !profileSelected?.discordHandle,
      handle: profileSelected?.discordHandle
        ? `@${profileSelected?.discordHandle}`
        : undefined,
    },
  ];

  return (
    <>
      <Flex
        flexDir="column"
        mb={{ base: '5', lg: '5' }}
        boxShadow={`0px 0px 18px 5px ${theme.modal.votingHistory.headline}0D`}
        px="4"
        pt="5"
      >
        <Text
          fontSize="2xl"
          fontWeight="medium"
          color={theme.modal.statement.sidebar.section}
        >
          Handles
        </Text>
        <Text
          fontSize="lg"
          fontWeight="normal"
          color={theme.modal.statement.sidebar.item.border}
        >
          Link your social handles to your wallet by clicking the button below.
          Adding social handles adds more authenticity to your profile and helps
          us aggregate your activity on those platforms.
        </Text>
        <Flex flexDir="column" gap="4" py="6">
          {socialMedias.map(
            (media, index) =>
              !media.hideCondition && (
                <Flex
                  flexDir="row"
                  key={+index}
                  gap="3"
                  align="center"
                  color={theme.modal.statement.sidebar.section}
                >
                  <Icon boxSize="6" as={media.icon} />
                  <Text fontSize="lg" fontWeight="medium" w="20" mr="6">
                    {media.name}
                  </Text>
                  {media.handle ? (
                    <Text
                      px="4"
                      py="2"
                      borderWidth="1px"
                      borderColor={theme.modal.statement.sidebar.item}
                      minW="60"
                      w="max-content"
                    >
                      {media.handle}
                    </Text>
                  ) : (
                    <Button
                      onClick={() => {
                        if (media.disabledCondition) return;
                        media.action();
                      }}
                      bgColor={theme.modal.buttons.navBg}
                      color={theme.modal.buttons.navText}
                      borderColor={theme.modal.buttons.navText}
                      borderWidth="1px"
                      borderStyle="solid"
                      _hover={{
                        opacity: 0.7,
                      }}
                      _disabled={{
                        opacity: 0.4,
                        cursor: 'not-allowed',
                      }}
                      _active={{}}
                      _focus={{}}
                      _focusVisible={{}}
                      _focusWithin={{}}
                      isDisabled={media.disabledCondition}
                      disabled={media.disabledCondition}
                    >
                      Link your {media.name} handle
                    </Button>
                  )}
                </Flex>
              )
          )}
        </Flex>
      </Flex>
      <TwitterModal
        open={twitterIsOpen}
        handleModal={twitterOnToggle}
        onClose={twitterOnClose}
      />
      {daoData?.forumTopicURL && (
        <DiscourseModal open={forumIsOpen} handleModal={forumOnToggle} />
      )}
    </>
  );
};
