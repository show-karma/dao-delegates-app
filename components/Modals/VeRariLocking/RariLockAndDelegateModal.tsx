import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Button,
  Box,
} from '@chakra-ui/react';
import { useDAO, useWallet, useAuth } from 'contexts';
import { FC, useState, useEffect } from 'react';
import { useRariNetwork } from 'hooks';
import { LockRariTab } from './LockRariTab';
import { DelegateExistingTab } from './DelegateExistingTab';
import { RarichainDelegateTab } from './RarichainDelegateTab';
import { NetworkSelector } from './NetworkSelector';

interface IRariLockAndDelegateModal {
  isOpen: boolean;
  onClose: () => void;
  delegateAddress: string;
  delegateName?: string;
}

export const RariLockAndDelegateModal: FC<IRariLockAndDelegateModal> = ({
  isOpen,
  onClose,
  delegateAddress,
  delegateName,
}) => {
  const { theme } = useDAO();
  const { isConnected } = useWallet();
  const { isAuthenticated, authenticate } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [openModalAfterConnect, setOpenModalAfterConnect] = useState(false);
  const { isOnMainnet, isOnRarichain, delegationType } = useRariNetwork();

  const handleClose = () => {
    setActiveTab(0); // Reset to first tab when closing
    setOpenModalAfterConnect(false); // Reset connect state
    onClose();
  };

  const handleNetworkChange = (network: 'mainnet' | 'rarichain') => {
    // Reset to first tab when network changes
    setActiveTab(0);
  };

  // Handle connect and authenticate
  const handleConnectAndAuthenticate = () => {
    setOpenModalAfterConnect(true);
    authenticate();
  };

  // Open modal content after successful connection and authentication
  useEffect(() => {
    if (openModalAfterConnect && isConnected && isAuthenticated) {
      setOpenModalAfterConnect(false);
    }
  }, [isConnected, isAuthenticated, openModalAfterConnect]);

  // Show different tab configurations based on current network
  const getTabConfiguration = () => {
    if (isOnMainnet) {
      return {
        tabs: [
          { label: 'Lock RARI to Delegate', component: LockRariTab },
          { label: 'Delegate Existing Locks', component: DelegateExistingTab },
        ],
        title: 'Lock $RARI and Delegate veRARI',
      };
    }

    if (isOnRarichain) {
      return {
        tabs: [
          { label: 'Direct RARI Delegation', component: RarichainDelegateTab },
        ],
        title: 'Delegate $RARI',
      };
    }

    return {
      tabs: [{ label: 'Select Network', component: () => null }],
      title: 'Delegate $RARI',
      subtitle: 'Please select a network to continue',
    };
  };

  const tabConfig = getTabConfiguration();

  // Render login prompt when not connected or not authenticated
  const renderLoginPrompt = () => (
    <Box textAlign="center" py="8">
      <Text
        fontSize="lg"
        color={theme.modal.header.subtitle}
        mb="6"
        fontWeight="medium"
      >
        Please connect and authenticate your wallet to delegate
      </Text>
      <Text
        fontSize="md"
        color={theme.modal.header.subtitle}
        opacity={0.8}
        mb="8"
        lineHeight="1.6"
      >
        You need to connect your wallet and sign an authentication message to
        access delegation features and manage your RARI tokens securely.
      </Text>
      <Button
        onClick={handleConnectAndAuthenticate}
        bg={theme.modal.delegateTo.button.normal.bg}
        color={theme.modal.delegateTo.button.normal.text}
        _hover={{
          bg: theme.modal.delegateTo.button.normal.bg,
          opacity: 0.9,
        }}
        _active={{
          bg: theme.modal.delegateTo.button.normal.bg,
          opacity: 0.8,
        }}
        size="lg"
        borderRadius="lg"
        fontWeight="semibold"
        px="8"
      >
        Connect
      </Button>
    </Box>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay
        background="linear-gradient(359.86deg, rgba(20, 21, 24, 0.85) 41.37%, rgba(33, 35, 40, 0) 101.24%)"
        backdropFilter="blur(4px)"
      />
      <ModalContent
        mx="1rem"
        borderRadius="20px"
        bgColor={theme.modal.background}
        mt={{ base: '4', lg: '5%' }}
      >
        <ModalHeader
          display="flex"
          flexDir="column"
          w="full"
          px={{ base: '4', lg: '8' }}
          pt={{ base: '8', lg: '8' }}
          pb={{ base: '4', lg: '4' }}
        >
          <Text
            fontWeight="bold"
            fontSize={{ base: '2xl', lg: '3xl' }}
            color={theme.modal.header.title}
            mb="2"
          >
            {tabConfig.title}
          </Text>
          <Text
            fontWeight="normal"
            fontSize={{ base: 'md', lg: 'lg' }}
            color={theme.modal.header.subtitle}
          >
            {delegateName
              ? `Delegate to ${delegateName}`
              : `Delegate to ${delegateAddress}`}
          </Text>
          {'subtitle' in tabConfig && (
            <Text
              fontWeight="normal"
              fontSize={{ base: 'sm', lg: 'md' }}
              color={theme.modal.header.subtitle}
              opacity={0.7}
              mt="1"
            >
              {tabConfig.subtitle}
            </Text>
          )}
        </ModalHeader>
        <ModalCloseButton color={theme.modal.header.title} boxSize="8" />

        <ModalBody px={{ base: '4', lg: '8' }} pb="8">
          {/* Show login prompt if not connected or not authenticated */}
          {!isConnected || !isAuthenticated ? (
            renderLoginPrompt()
          ) : (
            <>
              {/* Network Selector */}
              <NetworkSelector onNetworkChange={handleNetworkChange} />

              {/* Tabs - only show if on supported network */}
              {(isOnMainnet || isOnRarichain) && (
                <Tabs
                  index={activeTab}
                  onChange={setActiveTab}
                  variant="soft-rounded"
                  colorScheme="gray"
                >
                  {tabConfig.tabs.length > 1 && (
                    <TabList
                      mb="6"
                      bg={theme.modal.buttons.navBg}
                      rounded="lg"
                      p="1"
                    >
                      {tabConfig.tabs.map((tab, index) => (
                        <Tab
                          key={tab.label}
                          flex="1"
                          color={
                            activeTab === index
                              ? theme.modal.delegateTo.button.normal.text
                              : theme.modal.delegateTo.button.alternative.text
                          }
                          bg={
                            activeTab === index
                              ? theme.modal.delegateTo.button.normal.bg
                              : theme.modal.delegateTo.button.alternative.bg
                          }
                          _selected={{
                            color: theme.modal.delegateTo.button.normal.text,
                            bg: theme.modal.delegateTo.button.normal.bg,
                          }}
                          _hover={{
                            bg:
                              activeTab === index
                                ? theme.modal.delegateTo.button.normal.bg
                                : theme.modal.delegateTo.button.alternative.bg,
                          }}
                          borderRadius="md"
                          fontWeight="semibold"
                        >
                          {tab.label}
                        </Tab>
                      ))}
                    </TabList>
                  )}

                  <TabPanels>
                    {tabConfig.tabs.map((tab, index) => (
                      <TabPanel key={tab.label} p="0">
                        <tab.component
                          delegateAddress={delegateAddress}
                          delegateName={delegateName}
                          onSuccess={handleClose}
                        />
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>
              )}
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
