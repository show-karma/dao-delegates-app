import React, { FC, useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Icon,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useNetwork, useSwitchNetwork, useAccount } from 'wagmi';
import { useToasty, useRariConfig } from 'hooks';
import { mainnet } from 'utils/mainnet/rpc';
import { rari as rariChain } from 'utils/customChains';
import { FiCheck } from 'react-icons/fi';

interface INetworkDelegationTab {
  delegateAddress: string;
  delegateName?: string;
  onSuccess: () => void;
}

const SUPPORTED_NETWORKS = [
  {
    chain: mainnet,
    name: 'Ethereum Mainnet',
    description: 'Delegate using veRARI (lock RARI tokens)',
    tokenSymbol: 'veRARI',
    features: [
      'Lock RARI tokens',
      'Get veRARI voting power',
      'Flexible timeframes',
    ],
  },
  {
    chain: rariChain,
    name: 'Rarichain',
    description: 'Direct delegation on Rarichain',
    tokenSymbol: 'RARI',
    features: [
      'Direct delegation',
      'No locking required',
      'Instant delegation',
    ],
  },
];

export const NetworkDelegationTab: FC<INetworkDelegationTab> = ({
  delegateAddress,
  delegateName,
  onSuccess,
}) => {
  const { theme } = useDAO();
  const { address: userAddress } = useAccount();
  const { chain } = useNetwork();
  const { switchNetworkAsync } = useSwitchNetwork();
  const { toast } = useToasty();
  const { contracts } = useRariConfig();
  const [isNetworkSwitching, setIsNetworkSwitching] = useState(false);

  const currentNetworkId = chain?.id;
  const currentNetwork = SUPPORTED_NETWORKS.find(
    n => n.chain.id === currentNetworkId
  );

  const handleNetworkSwitch = async (
    targetChain: typeof mainnet | typeof rariChain
  ) => {
    if (currentNetworkId === targetChain.id) return;

    setIsNetworkSwitching(true);
    try {
      if (!switchNetworkAsync) {
        toast({
          title: 'Network Switch Required',
          description: `Please manually switch to ${targetChain.name} in your wallet.`,
          status: 'warning',
          duration: 5000,
        });
        return;
      }

      await switchNetworkAsync(targetChain.id);

      toast({
        title: 'Network Switched',
        description: `Successfully switched to ${targetChain.name}.`,
        status: 'success',
      });
    } catch (error: any) {
      console.error('Network switch error:', error);

      if (
        error?.message?.includes('User rejected') ||
        error?.message?.includes('rejected') ||
        error?.message?.includes('denied')
      ) {
        toast({
          title: 'Network Switch Cancelled',
          description: `You need to be on ${targetChain.name} to use this delegation method.`,
          status: 'warning',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Network Switch Failed',
          description: `Failed to switch to ${targetChain.name}. Please try again.`,
          status: 'error',
          duration: 5000,
        });
      }
    } finally {
      setIsNetworkSwitching(false);
    }
  };

  const handleDirectDelegation = () => {
    // This would trigger the standard delegation flow for Rarichain
    // For now, we'll show a toast indicating the action
    toast({
      title: 'Delegation Started',
      description: `Delegating on ${currentNetwork?.name} to ${
        delegateName || delegateAddress
      }`,
      status: 'info',
    });
    // In a real implementation, this would trigger the actual delegation
    // onSuccess();
  };

  const renderActionButton = (
    network: (typeof SUPPORTED_NETWORKS)[0],
    isCurrentNetwork: boolean
  ) => {
    if (!isCurrentNetwork) {
      return (
        <Button
          onClick={() => handleNetworkSwitch(network.chain)}
          isLoading={isNetworkSwitching}
          loadingText="Switching..."
          bg={theme.modal.delegateTo.button.alternative.bg}
          color={theme.modal.delegateTo.button.alternative.text}
          border="1px solid"
          borderColor={theme.modal.delegateTo.button.alternative.border}
          _hover={{
            bg: theme.modal.delegateTo.button.normal.bg,
            color: theme.modal.delegateTo.button.normal.text,
            borderColor: theme.modal.delegateTo.button.normal.bg,
          }}
          size="sm"
          w="full"
        >
          Switch to {network.name}
        </Button>
      );
    }

    if (network.chain.id === rariChain.id) {
      return (
        <Button
          onClick={handleDirectDelegation}
          bg={theme.modal.delegateTo.button.normal.bg}
          color={theme.modal.delegateTo.button.normal.text}
          _hover={{
            bg: theme.modal.delegateTo.button.normal.bg,
            opacity: 0.9,
          }}
          size="sm"
          w="full"
        >
          Delegate on Rarichain
        </Button>
      );
    }

    return (
      <Alert status="info" borderRadius="md" size="sm">
        <AlertIcon />
        <Box>
          <AlertTitle fontSize="sm">Use Lock RARI Tab</AlertTitle>
          <AlertDescription fontSize="xs">
            Switch to the &quot;Lock RARI to Delegate&quot; tab for mainnet
            delegation.
          </AlertDescription>
        </Box>
      </Alert>
    );
  };

  return (
    <VStack spacing="6" align="stretch">
      {/* Current Network Display */}
      {currentNetwork && (
        <Box
          p="4"
          bg={theme.modal.delegateTo.topBg}
          borderRadius="lg"
          border="1px solid"
          borderColor={theme.modal.delegateTo.input.border}
        >
          <HStack justify="space-between" align="center" mb="2">
            <Text fontSize="sm" color={theme.modal.delegateTo.subtext}>
              Current Network
            </Text>
            <Badge colorScheme="green" variant="solid" fontSize="xs">
              Connected
            </Badge>
          </HStack>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={theme.modal.delegateTo.text}
          >
            {currentNetwork.name}
          </Text>
          <Text fontSize="sm" color={theme.modal.delegateTo.subtext} mt="1">
            {currentNetwork.description}
          </Text>
        </Box>
      )}

      {/* Network Options */}
      <VStack spacing="4" align="stretch">
        <Text
          fontSize="md"
          fontWeight="semibold"
          color={theme.modal.delegateTo.text}
        >
          Choose Delegation Method
        </Text>

        {SUPPORTED_NETWORKS.map(network => {
          const isCurrentNetwork = currentNetworkId === network.chain.id;
          const isSelected = isCurrentNetwork;

          return (
            <Box
              key={network.chain.id}
              p="4"
              bg={
                isSelected
                  ? theme.modal.delegateTo.topBg
                  : theme.modal.delegateTo.bg
              }
              border="2px solid"
              borderColor={
                isSelected
                  ? theme.modal.delegateTo.input.dirtyBorder
                  : theme.modal.delegateTo.input.border
              }
              borderRadius="lg"
              cursor="pointer"
              transition="all 0.2s"
              _hover={{
                borderColor: theme.modal.delegateTo.input.dirtyBorder,
                bg: theme.modal.delegateTo.topBg,
              }}
            >
              <VStack align="stretch" spacing="3">
                {/* Network Header */}
                <HStack justify="space-between" align="center">
                  <HStack spacing="3">
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      color={theme.modal.delegateTo.text}
                    >
                      {network.name}
                    </Text>
                    {isSelected && (
                      <Icon as={FiCheck} color="green.500" boxSize="5" />
                    )}
                  </HStack>
                  <Badge
                    colorScheme={
                      network.chain.id === mainnet.id ? 'blue' : 'purple'
                    }
                    variant="subtle"
                    fontSize="xs"
                  >
                    {network.tokenSymbol}
                  </Badge>
                </HStack>

                {/* Network Description */}
                <Text fontSize="sm" color={theme.modal.delegateTo.subtext}>
                  {network.description}
                </Text>

                {/* Features */}
                <VStack align="stretch" spacing="1">
                  {network.features.map((feature, index) => (
                    <HStack key={index} spacing="2">
                      <Icon as={FiCheck} color="green.500" boxSize="3" />
                      <Text
                        fontSize="xs"
                        color={theme.modal.delegateTo.subtext}
                      >
                        {feature}
                      </Text>
                    </HStack>
                  ))}
                </VStack>

                {/* Action Button */}
                {renderActionButton(network, isCurrentNetwork)}
              </VStack>
            </Box>
          );
        })}
      </VStack>

      {/* Info Text */}
      <Alert status="info" borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>Delegation Methods</AlertTitle>
          <AlertDescription>
            <strong>Ethereum Mainnet:</strong> Lock RARI tokens to get veRARI
            voting power with flexible timeframes.
            <br />
            <strong>Rarichain:</strong> Direct delegation without locking -
            instant and flexible.
          </AlertDescription>
        </Box>
      </Alert>
    </VStack>
  );
};
