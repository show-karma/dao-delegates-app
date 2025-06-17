import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useMediaQuery,
} from '@chakra-ui/react';
import { ArrowRightIcon, DownChevron } from 'components/Icons';
import { useAuth, useDAO, useDelegates, useProxy } from 'contexts';
import { FC } from 'react';
import { truncateAddress } from 'utils';
import { useAccount } from 'wagmi';

const LoginMenu = () => {
  const { theme, daoInfo } = useDAO();
  const { disconnect } = useAuth();
  const { address } = useAccount();
  const { searchProfileModal } = useDelegates();
  const { hasProxy } = useProxy();
  const { realWallet } = useProxy();

  const openProfile = () => address && searchProfileModal(address, 'overview');

  return (
    <Flex
      {...(theme.brandingImageColor && {
        style: {
          backgroundImage: theme.brandingImageColor,
          padding: '2px',
          borderRadius: '6px',
        },
      })}
    >
      <Menu isLazy placement="bottom-end">
        <MenuButton
          as={Button}
          rightIcon={
            <DownChevron
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxSize="5"
            />
          }
          background={theme.secondaryButton?.bg || theme.branding}
          color={theme.secondaryButton?.text || theme.buttonText}
          px="5"
          py="3"
          fontWeight="semibold"
          minH={{ base: '52px', lg: 'max-content' }}
          _hover={{
            opacity: 0.8,
          }}
          _focusVisible={{
            opacity: 0.8,
          }}
          _focusWithin={{
            opacity: 0.8,
          }}
          _focus={{
            opacity: 0.8,
          }}
          _active={{
            opacity: 0.8,
          }}
        >
          {truncateAddress(address || '')}
        </MenuButton>
        <MenuList
          bgColor={theme.filters.listBg}
          color={theme.filters.listText}
          w="max-content"
          minW="max-content"
        >
          {daoInfo.config.ENABLE_PROXY_SUPPORT && hasProxy && (
            <>
              <Flex flexDir="column" align="flex-start" px="4">
                <Text color={theme.filters.listText}>Real wallet</Text>
                <Text color={theme.filters.listText}>
                  {truncateAddress(realWallet)}
                </Text>
              </Flex>
              <Divider orientation="horizontal" my="2" />
            </>
          )}
          <MenuItem
            bgColor={theme.filters.listBg}
            _hover={{
              bg: theme.filters.activeBg,
              opacity: 0.8,
            }}
            w="full"
            minW="160px"
            onClick={openProfile}
          >
            My profile
          </MenuItem>
          <Divider orientation="horizontal" my="2" />
          <MenuItem
            bgColor={theme.filters.listBg}
            _hover={{
              bg: theme.filters.activeBg,
              opacity: 0.8,
            }}
            onClick={disconnect}
            w="full"
            minW="160px"
          >
            Logout
          </MenuItem>
        </MenuList>
      </Menu>
    </Flex>
  );
};

const LoginButton: FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { theme } = useDAO();
  const { isAuthenticated, disconnect } = useAuth();
  const { isConnected } = useAccount();
  const [isMobile] = useMediaQuery('(max-width: 990px)');
  return (
    <Flex
      {...(theme.brandingImageColor && {
        style: {
          backgroundImage: theme.brandingImageColor,
          padding: '2px',
          borderRadius: '6px',
        },
      })}
    >
      <Button
        background={{ base: 'transparent', lg: theme.branding }}
        color={{ base: theme.hat.text.primary, lg: theme.buttonText }}
        px={{ base: '0', lg: '5' }}
        py={{ base: '0', lg: '3' }}
        fontWeight="semibold"
        _hover={{
          opacity: 0.8,
        }}
        _focusVisible={{
          opacity: 0.8,
        }}
        _focusWithin={{
          opacity: 0.8,
        }}
        _focus={{
          opacity: 0.8,
        }}
        _active={{
          opacity: 0.8,
        }}
        minH={{ base: '52px', lg: 'max-content' }}
        onClick={() => {
          if (isAuthenticated && isConnected) {
            disconnect();
            return;
          }
          onOpen();
        }}
        justifyContent={{ base: 'flex-start', lg: 'center' }}
        display="flex"
        gap="4"
        alignItems="center"
        fontSize={{ base: 'sm', lg: 'md' }}
      >
        Delegate Login
        {isMobile ? (
          <Box display={{ base: 'flex', md: 'none' }}>
            <ArrowRightIcon boxSize="14px" />
          </Box>
        ) : null}
      </Button>
    </Flex>
  );
};

const LoginAccordion = () => {
  const { theme, daoInfo } = useDAO();
  const { disconnect } = useAuth();
  const { address } = useAccount();
  const { searchProfileModal } = useDelegates();
  const { hasProxy } = useProxy();
  const { realWallet } = useProxy();

  const openProfile = () => address && searchProfileModal(address, 'overview');
  return (
    <Accordion
      allowToggle
      {...(theme.brandingImageColor && {
        style: {
          backgroundImage: theme.brandingImageColor,
          padding: '2px',
          borderRadius: '6px',
        },
      })}
    >
      <AccordionItem>
        <AccordionButton
          background={theme.secondaryButton?.bg || theme.branding}
          color={theme.secondaryButton?.text || theme.buttonText}
          px="5"
          py="3"
          fontWeight="semibold"
          minH={{ base: '52px', lg: 'max-content' }}
          _hover={{
            opacity: 0.8,
          }}
          _focusVisible={{
            opacity: 0.8,
          }}
          _focusWithin={{
            opacity: 0.8,
          }}
          _focus={{
            opacity: 0.8,
          }}
          _active={{
            opacity: 0.8,
          }}
          borderRadius="base"
        >
          <Box as="span" flex="1" textAlign="left">
            {truncateAddress(address || '')}
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={0} px="0">
          {daoInfo.config.ENABLE_PROXY_SUPPORT && hasProxy && (
            <Flex
              flexDir="column"
              align={{ base: 'center', md: 'flex-start' }}
              px="4"
            >
              <Text color={theme.filters.listText}>Real wallet</Text>
              <Text color={theme.filters.listText}>
                {truncateAddress(realWallet)}
              </Text>
            </Flex>
          )}
          <Button
            background={theme.secondaryButton?.bg || theme.branding}
            _hover={{
              opacity: 0.8,
            }}
            w="full"
            minW="160px"
            onClick={openProfile}
            color={theme.hat.text.primary}
            borderRadius="base"
          >
            My profile
          </Button>
          <Divider orientation="horizontal" my="1" />
          <Button
            background={theme.secondaryButton?.bg || theme.branding}
            color={theme.hat.text.primary}
            _hover={{
              opacity: 0.8,
            }}
            onClick={disconnect}
            w="full"
            minW="160px"
            borderRadius="base"
          >
            Logout
          </Button>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export const DelegateLoginButton: FC<{ onOpen: () => void }> = ({ onOpen }) => {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useAccount();
  const { daoInfo } = useDAO();
  const [isMobile] = useMediaQuery('(max-width: 768px)');

  if (daoInfo.config.DAO_DEFAULT_SETTINGS?.DISABLE_LOGIN) return null;

  if (!isAuthenticated || !isConnected) return <LoginButton onOpen={onOpen} />;

  if (isMobile) return <LoginAccordion />;

  return <LoginMenu />;
};
