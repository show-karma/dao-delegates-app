import React, { FC, useState, useEffect } from 'react';
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
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useVeRariDelegation, useRariNetwork, useVeRariLocks } from 'hooks';
import type { VeRariLock } from 'hooks';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { formatNumber, truncateAddress } from 'utils';

interface IDelegateExistingTab {
  delegateAddress: string;
  delegateName?: string;
  onSuccess: () => void;
}

// Helper function to format addresses
const formatAddress = (address: string) => truncateAddress(address);

export const DelegateExistingTab: FC<IDelegateExistingTab> = ({
  delegateAddress,
  delegateName,
  onSuccess,
}) => {
  const { theme, daoInfo } = useDAO();
  const { isOnMainnet, switchToMainnet, currentNetworkName } = useRariNetwork();
  const [selectedLockId, setSelectedLockId] = useState<string | null>(null);
  const [shouldTriggerDelegation, setShouldTriggerDelegation] = useState(false);

  // Fetch real veRARI locks from the API
  const {
    data: locks = [],
    isLoading: isLoadingLocks,
    error: locksError,
    refetch: refetchLocks,
  } = useVeRariLocks();

  // Create success handler that will be called after delegation
  const handleDelegationSuccess = () => {
    setSelectedLockId(null); // Clear selection
    setShouldTriggerDelegation(false); // Reset trigger flag
    refetchLocks(); // Refresh locks data
    onSuccess(); // Close modal
  };

  // Delegation hook - initialize with selected lock parameters
  const { delegateLock, isLoading: isDelegateLoading } = useVeRariDelegation({
    lockId: selectedLockId ? parseInt(selectedLockId, 10) : 0,
    newDelegateAddress: delegateAddress,
    onSuccess: handleDelegationSuccess, // Pass success handler directly
  });

  // Auto-trigger delegation when hook is ready and flag is set
  useEffect(() => {
    if (shouldTriggerDelegation && delegateLock && selectedLockId) {
      setShouldTriggerDelegation(false); // Reset trigger flag
      delegateLock();
    }
  }, [shouldTriggerDelegation, delegateLock, selectedLockId]);

  const isCorrectNetwork = isOnMainnet;

  const handleDelegateClick = (lockId: string) => {
    if (!isCorrectNetwork) return;

    setSelectedLockId(lockId);
    setShouldTriggerDelegation(true); // Set flag to trigger delegation
  };

  const getButtonText = (lock: VeRariLock) => {
    if (!isCorrectNetwork) return 'Wrong Network';
    if (lock.status !== 'created') return 'Lock Inactive';
    return 'Delegate This Lock';
  };

  const renderLocks = () => {
    // Loading state
    if (isLoadingLocks) {
      return (
        <VStack spacing="4" align="stretch">
          {[1, 2, 3].map(index => (
            <Box
              key={index}
              p="4"
              bg={theme.modal.delegateTo.bg}
              border="1px solid"
              borderColor={theme.modal.delegateTo.input.border}
              borderRadius="lg"
            >
              <VStack align="stretch" spacing="3">
                <HStack justify="space-between">
                  <Skeleton height="20px" width="80px" />
                  <Skeleton height="20px" width="60px" />
                </HStack>
                <SkeletonText noOfLines={4} spacing="2" />
                <Skeleton height="32px" width="full" />
              </VStack>
            </Box>
          ))}
        </VStack>
      );
    }

    // Error state
    if (locksError) {
      return (
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Error Loading Locks</AlertTitle>
            <AlertDescription>
              Failed to load your veRARI locks. Please try again.
              <Button
                mt="2"
                size="sm"
                colorScheme="red"
                variant="solid"
                onClick={() => refetchLocks()}
              >
                Retry
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      );
    }

    // No locks state
    if (locks.length === 0) {
      return (
        <Box
          p="8"
          bg={theme.modal.delegateTo.bg}
          border="1px solid"
          borderColor={theme.modal.delegateTo.input.border}
          borderRadius="lg"
          textAlign="center"
        >
          <Text color={theme.modal.delegateTo.subtext} fontSize="md">
            You don&apos;t have any veRARI locks yet.
          </Text>
          <Text color={theme.modal.delegateTo.subtext} fontSize="sm" mt="2">
            Create a lock in the &quot;Lock RARI&quot; tab to get started.
          </Text>
        </Box>
      );
    }

    // Render actual locks
    return locks.map(lock => (
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
                {formatNumber(lock.formattedAmount)} RARI
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
                {formatNumber(lock.veRariAmount)} veRARI
              </Text>
            </HStack>

            {/* Current Delegate - only show if delegated to someone */}
            {lock.currentDelegate && lock.currentDelegate !== '' && (
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
            )}

            <HStack justify="space-between">
              <Text fontSize="xs" color={theme.modal.delegateTo.subtext}>
                Total Lock Period
              </Text>
              <Text
                fontSize="xs"
                fontWeight="semibold"
                color={theme.modal.delegateTo.text}
              >
                {lock.cliff + lock.slopePeriod} weeks
              </Text>
            </HStack>
          </VStack>

          {/* Delegate Button */}
          <Button
            onClick={() => handleDelegateClick(lock.id)}
            isLoading={isDelegateLoading && selectedLockId === lock.id}
            isDisabled={!isCorrectNetwork || lock.status !== 'created'}
            size="sm"
            bg={theme.modal.delegateTo.button.alternative.bg}
            color={theme.modal.delegateTo.button.alternative.text}
            border="1px solid"
            borderColor={theme.modal.delegateTo.button.alternative.border}
            _hover={{
              bg:
                isCorrectNetwork && lock.status === 'created'
                  ? theme.modal.delegateTo.button.normal.bg
                  : theme.modal.delegateTo.button.alternative.bg,
              color:
                isCorrectNetwork && lock.status === 'created'
                  ? theme.modal.delegateTo.button.normal.text
                  : theme.modal.delegateTo.button.alternative.text,
              borderColor:
                isCorrectNetwork && lock.status === 'created'
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
            {getButtonText(lock)}
          </Button>
        </VStack>
      </Box>
    ));
  };

  return (
    <VStack spacing="6" align="stretch">
      {/* Network Check Alert */}
      {!isCorrectNetwork && (
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Wrong Network!</AlertTitle>
            <AlertDescription>
              You&apos;re currently on {currentNetworkName}. Switch to Ethereum
              Mainnet to manage your veRARI locks.
              <Button
                mt="2"
                size="sm"
                colorScheme="orange"
                variant="solid"
                onClick={switchToMainnet}
              >
                Switch to Mainnet
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Delegation Info */}
      <Box
        p="4"
        bg={theme.modal.delegateTo.bg}
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.modal.delegateTo.input.border}
        opacity={isCorrectNetwork ? 1 : 0.6}
      >
        <Text fontSize="sm" color={theme.modal.delegateTo.subtext} mb="3">
          Delegate to
        </Text>

        <HStack spacing="3" align="center">
          {/* Delegate Profile Picture */}
          <ImgWithFallback
            h="48px"
            w="48px"
            borderRadius="full"
            src={`${daoInfo.config.IMAGE_PREFIX_URL}${delegateAddress}`}
            fallback={delegateAddress}
          />

          {/* Delegate Info */}
          <Box flex="1">
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={theme.modal.delegateTo.text}
              mb="1"
            >
              {delegateName || formatAddress(delegateAddress)}
            </Text>
            <Text fontSize="xs" color={theme.modal.delegateTo.subtext}>
              {formatAddress(delegateAddress)}
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Locks Section */}
      <VStack align="stretch" spacing="4">
        <Text
          fontSize="md"
          fontWeight="semibold"
          color={theme.modal.delegateTo.text}
          opacity={isCorrectNetwork ? 1 : 0.6}
        >
          Your veRARI Locks
        </Text>

        {renderLocks()}
      </VStack>
    </VStack>
  );
};
