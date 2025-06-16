import {
  Button,
  ButtonProps,
  Divider,
  Flex,
  Img,
  useColorModeValue,
  useMediaQuery,
} from '@chakra-ui/react';
import {
  ChakraLink,
  DelegateLoginButton,
  DelegateLoginModal,
  EcosystemAccordion,
  EcosystemDropdown,
} from 'components';
import { DelegateVotesModal } from 'components/Modals/DelegateToAnyone';
import { UndelegateModal } from 'components/pages/token-holders/UndelegateModal';
import { useAuth, useDAO, useDelegates, useWallet } from 'contexts';
import { KARMA_WEBSITE } from 'helpers';
import { FC, useEffect } from 'react';
import { HeaderBurgerAccordion } from './HeaderBurgerAccordion';
import { Madeby } from './Madeby';
import { NavMenu } from './NavMenu';
import { ThemeButton } from './ThemeButton';

export const StyledButton: FC<ButtonProps> = ({ children, ...rest }) => {
  const { theme } = useDAO();
  return (
    <Button
      color={theme.hat.text.primary}
      bgColor="transparent"
      px={{ base: '0', lg: '1', xl: '4' }}
      py={{ base: '1', lg: '6' }}
      fontWeight="semibold"
      _active={{}}
      _focus={{}}
      _hover={{
        color: theme.hat.text.secondary,
      }}
      minH={{ base: 'max-content', lg: '52px' }}
      alignItems="center"
      justifyContent="flex-start"
      fontSize={{ base: 'sm', lg: 'md' }}
      {...rest}
    >
      {children}
    </Button>
  );
};

interface IHeaderHat {
  shouldOpenDelegateToAnyone?: boolean;
}

export const HeaderHat: FC<IHeaderHat> = ({
  shouldOpenDelegateToAnyone = false,
}) => {
  const { daoInfo, theme, rootPathname } = useDAO();
  const { config } = daoInfo;
  const { isOpenVoteToAnyone, onToggleVoteToAnyone } = useDelegates();
  const { delegateLoginIsOpen, delegateLoginOnClose, delegateLoginOnOpen } =
    useWallet();
  const { isDaoAdmin } = useAuth();

  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const [isSmallScreen] = useMediaQuery('(max-width: 1280px)');

  const mountingForTokenholders = (): {
    title: string;
    path?: string;
    action?: () => void;
    isExternal?: boolean;
  }[] => {
    const array = [];

    if (daoInfo.config.ENABLE_DELEGATE_TRACKER)
      array.push({
        title: 'Delegate Look Up',
        path: `${rootPathname}/delegate-lookup`,
        isExternal: false,
      });
    if (
      daoInfo.config.DAO_DELEGATE_CONTRACT ||
      daoInfo.config.ALLOW_BULK_DELEGATE
    ) {
      if (daoInfo.config.DAO_DELEGATION_URL) {
        array.push({
          title: 'Delegate Tokens',
          path: daoInfo.config.DAO_DELEGATION_URL,
          isExternal: true,
        });
      } else {
        array.push({
          title: 'Delegate Tokens',
          action: onToggleVoteToAnyone,
        });
      }
    }

    return array;
  };

  const mountingForDelegates = (): {
    title: string;
    path: string;
    isExternal?: boolean;
  }[] => {
    const array = [];

    if (!daoInfo.config.HIDE_FOR_DELEGATES?.includes('delegator-lookup')) {
      array.push({
        title: 'Delegator Look Up',
        path: KARMA_WEBSITE.delegators(daoInfo.config.DAO_KARMA_ID),
        isExternal: true,
      });
    }

    if (daoInfo.config.DAO_HAS_COMPENSATION_PROGRAM) {
      array.push({
        title: 'Delegate Compensation',
        path: `${rootPathname}/delegate-compensation`,
        isExternal: false,
      });
      if (isDaoAdmin) {
        array.push({
          title: 'Delegate Compensation Admin',
          path: `${rootPathname}/delegate-compensation/admin`,
          isExternal: false,
        });
      }
    }

    return array;
  };

  const mountingResources = () => {
    const { DAO_RESOURCES } = daoInfo.config;
    if (!DAO_RESOURCES) return [];
    const array = DAO_RESOURCES.map(item => ({
      title: item.title,
      path: item.url,
    }));

    return array;
  };

  useEffect(() => {
    if (shouldOpenDelegateToAnyone) {
      onToggleVoteToAnyone();
    }
  }, [shouldOpenDelegateToAnyone]);


  return (
    <Flex flexDir="column" w="full">
      <Flex
        bg={theme.headerBg}
        bgSize="cover"
        py="3"
        w="full"
        align="center"
        justify="center"
        px={{ base: '4', lg: '8' }}
        zIndex="2"
        boxShadow={useColorModeValue('0px 4px 10px rgba(0, 0, 0, 0.1)', 'none')}
      >
        {isMobile ? (
          <HeaderBurgerAccordion
            mountingForTokenholders={mountingForTokenholders}
            mountingForDelegates={mountingForDelegates}
          >
            <Flex flexDir="column" gap="1">
              {daoInfo.config.ECOSYSTEM && <EcosystemAccordion />}

              <NavMenu
                title="For Tokenholders"
                childrens={mountingForTokenholders()}
                accordion
              >
                {daoInfo.config?.ALLOW_UNDELEGATE && (
                  <UndelegateModal
                    buttonProps={{
                      color: theme.hat.text.primary,
                    }}
                  />
                )}
              </NavMenu>
              {daoInfo.config.HIDE_FOR_DELEGATES &&
              daoInfo.config.HIDE_FOR_DELEGATES?.length >= 2 ? undefined : (
                <NavMenu
                  title="For Delegates"
                  childrens={mountingForDelegates()}
                  accordion
                />
              )}
              {daoInfo.config.DAO_DEFAULT_SETTINGS?.GUIDE !== false && (
                <ChakraLink href={`${rootPathname}/guide`} _hover={{}}>
                  <StyledButton>Guide</StyledButton>
                </ChakraLink>
              )}
              {daoInfo.config.DAO_DEFAULT_SETTINGS?.FAQ && (
                <ChakraLink href={`${rootPathname}/faq`} _hover={{}} w="full">
                  <StyledButton w="full">FAQs</StyledButton>
                </ChakraLink>
              )}

              {daoInfo.config.DAO_RESOURCES &&
                daoInfo.config.DAO_RESOURCES.length > 0 && (
                  <NavMenu
                    title="Resources"
                    childrens={mountingResources()}
                    accordion
                  />
                )}
              <Divider borderColor={theme.filters.title} />
              <DelegateLoginButton onOpen={delegateLoginOnOpen} />
              <ThemeButton />
            </Flex>
          </HeaderBurgerAccordion>
        ) : (
          <Flex
            w={{ base: 'full' }}
            maxW={{ base: '400px', md: '820px', lg: '944px', xl: '1360px' }}
            flexDir="row"
            justify="space-between"
            gap={{ base: '1', xl: '4' }}
            flexWrap="wrap"
          >
            <Flex
              flexDir="row"
              flex={['1', 'none']}
              align={{ base: 'center' }}
              gap={{ base: '2', lg: '4', xl: '16' }}
              w="full"
              justify={{ base: 'space-between' }}
            >
              <Flex
                flexDir="column"
                flex={['1', 'none']}
                align={['flex-start', 'flex-start']}
                gap="1"
              >
                <Flex flexDir="row" align="center" gap="2">
                  <ChakraLink href={`${rootPathname}/`}>
                    <Img
                      w="auto"
                      maxW="36"
                      h="10"
                      objectFit="contain"
                      src={theme.logo || config.DAO_LOGO}
                      rounded={theme.isLogoRounded ? '9999px' : undefined}
                    />
                  </ChakraLink>
                  {daoInfo.config.ECOSYSTEM && <EcosystemDropdown />}
                </Flex>
                <Madeby />
              </Flex>
              <Flex
                flexDir="row"
                alignItems="center"
                justify="flex-end"
                w={{ base: 'max-content', lg: 'full' }}
              >
                <Flex
                  justify="center"
                  alignItems="center"
                  height="100%"
                  gap="4"
                >
                  {daoInfo.config.ECOSYSTEM && <EcosystemAccordion />}
                  <NavMenu
                    title="For Tokenholders"
                    childrens={mountingForTokenholders()}
                  >
                    {daoInfo.config?.ALLOW_UNDELEGATE && <UndelegateModal />}
                  </NavMenu>
                  {daoInfo.config.HIDE_FOR_DELEGATES &&
                  daoInfo.config.HIDE_FOR_DELEGATES?.length >= 2 ? undefined : (
                    <NavMenu
                      title="For Delegates"
                      childrens={mountingForDelegates()}
                      accordion
                    />
                  )}

                  {isSmallScreen ? null : (
                    <>
                      {daoInfo.config.DAO_DEFAULT_SETTINGS?.GUIDE !== false && (
                        <ChakraLink href={`${rootPathname}/guide`} _hover={{}}>
                          <StyledButton>Guide</StyledButton>
                        </ChakraLink>
                      )}
                      {daoInfo.config.DAO_DEFAULT_SETTINGS?.FAQ && (
                        <ChakraLink href={`${rootPathname}/faq`} _hover={{}}>
                          <StyledButton>FAQs</StyledButton>
                        </ChakraLink>
                      )}
                      {daoInfo.config.DAO_RESOURCES &&
                        daoInfo.config.DAO_RESOURCES.length > 0 && (
                          <NavMenu
                            title="Resources"
                            childrens={mountingResources()}
                          />
                        )}
                    </>
                  )}
                  <DelegateLoginButton onOpen={delegateLoginOnOpen} />
                  <ThemeButton />
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        )}
      </Flex>
      <DelegateVotesModal
        isOpen={isOpenVoteToAnyone}
        onClose={onToggleVoteToAnyone}
      />
      <DelegateLoginModal
        isOpen={delegateLoginIsOpen}
        onClose={delegateLoginOnClose}
      />
    </Flex>
  );
};
