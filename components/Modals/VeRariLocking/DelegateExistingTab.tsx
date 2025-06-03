import React, { FC, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useVeRari, useVeRariDelegation, useRariNetwork } from 'hooks';
import { formatDate, formatNumber } from 'utils';

interface IDelegateExistingTab {
  delegateAddress: string;
  onSuccess: () => void;
}

interface UserLock {
  id: number;
  amount: string;
  currentDelegate: string;
  expiryDate: string;
  veRariAmount: string;
}

export const DelegateExistingTab: FC<IDelegateExistingTab> = ({
  delegateAddress,
  onSuccess,
}) => {
  const { theme } = useDAO();
  const [selectedLockId, setSelectedLockId] = useState<number | null>(null);

  // Network checking
  const {
    isCorrectNetwork,
    switchToMainnet,
    currentNetworkName,
    targetNetworkName,
  } = useRariNetwork();

  // Get veRARI data
  const { formattedVeRariBalance, userLocks, refetchUserLocks } = useVeRari();

  // Delegation hook - only initialize when we have a selected lock
  const {
    delegateLock,
    isLoading: isDelegateLoading,
    isSuccess: isDelegateSuccess,
  } = useVeRariDelegation({
    lockId: selectedLockId || 0,
    newDelegateAddress: delegateAddress,
  });

  // Handle delegation success
  useEffect(() => {
    if (isDelegateSuccess) {
      refetchUserLocks();
      onSuccess();
    }
  }, [isDelegateSuccess, refetchUserLocks, onSuccess]);

  // Mock locks data for now (in real implementation, this would come from userLocks)
  const mockLocks: UserLock[] = [
    {
      id: 1,
      amount: '1000.00',
      currentDelegate: '0x742d35Cc6C85A3d9C38C',
      expiryDate: '2024-06-15',
      veRariAmount: '800.00',
    },
    {
      id: 2,
      amount: '500.00',
      currentDelegate: '0x742d35Cc6C85A3d9C38C',
      expiryDate: '2024-12-15',
      veRariAmount: '450.00',
    },
  ];

  const handleDelegateClick = (lockId: number) => {
    setSelectedLockId(lockId);
    if (delegateLock) {
      delegateLock();
    }
  };

  const formatAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const hasLocks = mockLocks.length > 0; // In real implementation: userLocks?.length > 0

  return (
    <VStack spacing="6" align="stretch">
      {/* Network Check Alert */}
      {!isCorrectNetwork && (
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Wrong Network!</AlertTitle>
            <AlertDescription>
              You&apos;re currently on {currentNetworkName}. Switch to{' '}
              {targetNetworkName} to use RARI delegation.
              <Button
                mt="2"
                size="sm"
                colorScheme="orange"
                variant="solid"
                onClick={switchToMainnet}
              >
                Switch to {targetNetworkName}
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* veRARI Balance Display */}
      <Box
        p="4"
        bg={theme.modal.delegateTo.topBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.modal.delegateTo.input.border}
        opacity={isCorrectNetwork ? 1 : 0.6}
      >
        <Text fontSize="sm" color={theme.modal.delegateTo.subtext} mb="1">
          Your total veRARI balance
        </Text>
        <Text
          fontSize="lg"
          fontWeight="bold"
          color={theme.modal.delegateTo.text}
        >
          {formattedVeRariBalance} veRARI
        </Text>
      </Box>

      {/* Locks List */}
      {!hasLocks ? (
        <Alert status="info" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>No veRARI locks found!</AlertTitle>
            <AlertDescription>
              You don&apos;t have any active veRARI locks to delegate. Use the
              &quot;Lock RARI to Delegate&quot; tab to create a new lock.
            </AlertDescription>
          </Box>
        </Alert>
      ) : (
        <VStack spacing="4" align="stretch">
          <Text
            fontSize="md"
            fontWeight="semibold"
            color={theme.modal.delegateTo.text}
            opacity={isCorrectNetwork ? 1 : 0.6}
          >
            Your veRARI Locks
          </Text>

          {mockLocks.map(lock => (
            <Box
              key={lock.id}
              p="4"
              bg={theme.modal.delegateTo.bg}
              border="1px solid"
              borderColor={theme.modal.delegateTo.input.border}
              borderRadius="lg"
              _hover={{
                borderColor: isCorrectNetwork
                  ? theme.modal.delegateTo.input.dirtyBorder
                  : theme.modal.delegateTo.input.border,
                bg: isCorrectNetwork
                  ? theme.modal.delegateTo.topBg
                  : theme.modal.delegateTo.bg,
              }}
              cursor={isCorrectNetwork ? 'pointer' : 'not-allowed'}
              transition="all 0.2s"
              opacity={isCorrectNetwork ? 1 : 0.6}
            >
              <VStack align="stretch" spacing="3">
                {/* Lock Header */}
                <HStack justify="space-between" align="center">
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={theme.modal.delegateTo.text}
                  >
                    Lock #{lock.id}
                  </Text>
                  <Badge colorScheme="green" variant="subtle" fontSize="xs">
                    Active
                  </Badge>
                </HStack>

                {/* Lock Details */}
                <VStack align="stretch" spacing="2">
                  <HStack justify="space-between">
                    <Text fontSize="xs" color={theme.modal.delegateTo.subtext}>
                      Locked RARI
                    </Text>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color={theme.modal.delegateTo.text}
                    >
                      {lock.amount ? formatNumber(lock.amount) : '-'} RARI
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="xs" color={theme.modal.delegateTo.subtext}>
                      veRARI
                    </Text>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color={theme.modal.delegateTo.text}
                    >
                      {lock.veRariAmount
                        ? formatNumber(lock.veRariAmount)
                        : '-'}{' '}
                      veRARI
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="xs" color={theme.modal.delegateTo.subtext}>
                      Current Delegate
                    </Text>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color={theme.modal.delegateTo.text}
                    >
                      {formatAddress(lock.currentDelegate)}
                    </Text>
                  </HStack>

                  <HStack justify="space-between">
                    <Text fontSize="xs" color={theme.modal.delegateTo.subtext}>
                      Unlock Date
                    </Text>
                    <Text
                      fontSize="xs"
                      fontWeight="semibold"
                      color={theme.modal.delegateTo.text}
                    >
                      {formatDate(lock.expiryDate, 'MMM D, YYYY')}
                    </Text>
                  </HStack>
                </VStack>

                {/* Delegate Button */}
                <Button
                  onClick={() => handleDelegateClick(lock.id)}
                  isLoading={isDelegateLoading && selectedLockId === lock.id}
                  isDisabled={!isCorrectNetwork}
                  size="sm"
                  bg={theme.modal.delegateTo.button.alternative.bg}
                  color={theme.modal.delegateTo.button.alternative.text}
                  border="1px solid"
                  borderColor={theme.modal.delegateTo.button.alternative.border}
                  _hover={{
                    bg: isCorrectNetwork
                      ? theme.modal.delegateTo.button.normal.bg
                      : theme.modal.delegateTo.button.alternative.bg,
                    color: isCorrectNetwork
                      ? theme.modal.delegateTo.button.normal.text
                      : theme.modal.delegateTo.button.alternative.text,
                    borderColor: isCorrectNetwork
                      ? theme.modal.delegateTo.button.normal.bg
                      : theme.modal.delegateTo.button.alternative.border,
                  }}
                  _disabled={{
                    bg: theme.modal.delegateTo.button.disabled.bg,
                    color: theme.modal.delegateTo.button.disabled.text,
                    borderColor: theme.modal.delegateTo.button.disabled.bg,
                  }}
                  w="full"
                  mt="2"
                >
                  {!isCorrectNetwork ? 'Wrong Network' : 'Delegate This Lock'}
                </Button>
              </VStack>
            </Box>
          ))}

          {/* Info Text */}
          <Text
            fontSize="xs"
            color={theme.modal.delegateTo.subtext}
            textAlign="center"
            mt="2"
            opacity={isCorrectNetwork ? 1 : 0.6}
          >
            {isCorrectNetwork
              ? 'Select a lock above to delegate its voting power to the chosen delegate.'
              : 'Switch to Ethereum Mainnet to delegate your locks.'}
          </Text>
        </VStack>
      )}
    </VStack>
  );
};
