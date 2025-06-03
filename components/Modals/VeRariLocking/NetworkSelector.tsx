import React, { FC } from 'react';
import {
  Box,
  Button,
  Text,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useRariNetwork } from 'hooks';

interface INetworkSelector {
  onNetworkChange?: (network: 'mainnet' | 'rarichain') => void;
}

export const NetworkSelector: FC<INetworkSelector> = ({ onNetworkChange }) => {
  const { theme } = useDAO();
  const {
    isOnMainnet,
    isOnRarichain,
    isOnSupportedNetwork,
    switchToMainnet,
    switchToRarichain,
    currentNetworkName,
    delegationType,
  } = useRariNetwork();

  const handleMainnetSwitch = async () => {
    const success = await switchToMainnet();
    if (success && onNetworkChange) {
      onNetworkChange('mainnet');
    }
  };

  const handleRarichainSwitch = async () => {
    const success = await switchToRarichain();
    if (success && onNetworkChange) {
      onNetworkChange('rarichain');
    }
  };

  return (
    <Box>
      {/* Current Network Status */}
      {!isOnSupportedNetwork && (
        <Alert status="warning" borderRadius="lg" mb="4">
          <AlertIcon />
          <Box>
            <AlertTitle>Unsupported Network!</AlertTitle>
            <AlertDescription>
              You&apos;re currently on {currentNetworkName}. Please switch to
              Ethereum Mainnet or Rarichain to delegate RARI.
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Network Selection */}
      <Box
        p="4"
        bg={theme.modal.delegateTo.topBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.modal.delegateTo.input.border}
        mb="4"
      >
        <Text
          fontSize="sm"
          color={theme.modal.delegateTo.subtext}
          mb="3"
          fontWeight="semibold"
        >
          Choose Delegation Network
        </Text>

        <Flex
          w="full"
          flexDir={{ base: 'column', md: 'row' }}
          flexWrap="wrap"
          gap="3"
        >
          {/* Ethereum Mainnet Option */}
          <Button
            flex="1"
            onClick={handleMainnetSwitch}
            isDisabled={isOnMainnet}
            size="sm"
            _disabled={{
              opacity: 0.9,
            }}
            bg={
              isOnMainnet
                ? theme.modal.delegateTo.button.normal.bg
                : theme.modal.delegateTo.button.alternative.bg
            }
            color={
              isOnMainnet
                ? theme.modal.delegateTo.button.normal.text
                : theme.modal.delegateTo.button.alternative.text
            }
            border="1px solid"
            borderColor={
              isOnMainnet
                ? theme.modal.delegateTo.button.normal.bg
                : theme.modal.delegateTo.button.alternative.border
            }
            _hover={{
              bg: isOnMainnet
                ? theme.modal.delegateTo.button.normal.bg
                : theme.modal.delegateTo.button.normal.bg,
              color: theme.modal.delegateTo.button.normal.text,
              borderColor: theme.modal.delegateTo.button.normal.bg,
            }}
            position="relative"
          >
            <Box>
              <Text fontSize="xs" fontWeight="bold">
                Ethereum Mainnet
              </Text>
              <Text fontSize="xs" opacity={0.8}>
                Lock RARI → veRARI
              </Text>
            </Box>
            {isOnMainnet && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                fontSize="xs"
                borderRadius="full"
                opacity={1}
                bg="green.500"
                color="white"
                px="1.5"
                py="0.5"
              >
                Active
              </Badge>
            )}
          </Button>

          {/* Rarichain Option */}
          <Button
            flex="1"
            onClick={handleRarichainSwitch}
            isDisabled={isOnRarichain}
            _disabled={{
              opacity: 0.9,
            }}
            size="sm"
            bg={
              isOnRarichain
                ? theme.modal.delegateTo.button.normal.bg
                : theme.modal.delegateTo.button.alternative.bg
            }
            color={
              isOnRarichain
                ? theme.modal.delegateTo.button.normal.text
                : theme.modal.delegateTo.button.alternative.text
            }
            border="1px solid"
            borderColor={
              isOnRarichain
                ? theme.modal.delegateTo.button.normal.bg
                : theme.modal.delegateTo.button.alternative.border
            }
            _hover={{
              bg: isOnRarichain
                ? theme.modal.delegateTo.button.normal.bg
                : theme.modal.delegateTo.button.normal.bg,
              color: theme.modal.delegateTo.button.normal.text,
              borderColor: theme.modal.delegateTo.button.normal.bg,
            }}
            position="relative"
          >
            <Box>
              <Text fontSize="xs" fontWeight="bold">
                Rarichain
              </Text>
              <Text fontSize="xs" opacity={0.8}>
                Direct RARI Delegation
              </Text>
            </Box>
            {isOnRarichain && (
              <Badge
                position="absolute"
                top="-1"
                right="-1"
                fontSize="xs"
                borderRadius="full"
                opacity={1}
                bg="green.500"
                color="white"
                px="1.5"
                py="0.5"
              >
                Active
              </Badge>
            )}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};
