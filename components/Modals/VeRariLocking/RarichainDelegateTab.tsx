import React, { FC, useMemo } from 'react';
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
} from '@chakra-ui/react';
import { useDAO, useGovernanceVotes } from 'contexts';
import { useRariNetwork, useRarichainToken, useDelegation } from 'hooks';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { zeroAddress } from 'viem';
import { rari } from 'utils/customChains/rari';
import { truncateAddress } from 'utils';

interface IRarichainDelegateTab {
  delegateAddress: string;
  delegateName?: string;
  onSuccess: () => void;
}

export const RarichainDelegateTab: FC<IRarichainDelegateTab> = ({
  delegateAddress,
  delegateName,
  onSuccess,
}) => {
  const { theme, daoInfo } = useDAO();
  const { isOnRarichain, switchToRarichain, currentNetworkName } =
    useRariNetwork();
  const { delegatedBefore } = useGovernanceVotes();

  // Get Rarichain RARI balance
  const { formattedBalance } = useRarichainToken();

  // Get current delegation on Rarichain
  const currentDelegate = useMemo(() => {
    const rariChainDelegation = delegatedBefore.find(
      delegation => delegation.chain.id === rari.id
    );
    return rariChainDelegation?.value || zeroAddress;
  }, [delegatedBefore]);

  const isCurrentlyDelegatedTo =
    currentDelegate.toLowerCase() === delegateAddress.toLowerCase();
  const isDelegatedToSomeone = currentDelegate !== zeroAddress;

  // Use delegation hook
  const { isLoading, write } = useDelegation({
    delegatee: delegateAddress,
    onSuccessFunction: onSuccess, // Only call after successful delegation
    network: rari.id,
  });

  const handleDelegate = () => {
    if (!isOnRarichain) {
      switchToRarichain();
      return;
    }

    if (write) {
      write();
    }
  };

  const getButtonText = () => {
    if (!isOnRarichain) return 'Switch to Rarichain';
    if (parseFloat(formattedBalance) === 0) return 'No RARI to Delegate';
    if (isCurrentlyDelegatedTo) return 'Already Delegated';
    return isLoading ? 'Delegating...' : 'Delegate RARI';
  };

  return (
    <VStack spacing="6" align="stretch">
      {/* Network Check Alert */}
      {!isOnRarichain && (
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <Box>
            <AlertTitle>Wrong Network!</AlertTitle>
            <AlertDescription>
              You&apos;re currently on {currentNetworkName}. Switch to Rarichain
              to use direct RARI delegation.
              <Button
                mt="2"
                size="sm"
                colorScheme="orange"
                variant="solid"
                onClick={switchToRarichain}
              >
                Switch to Rarichain
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      )}

      {/* Current Delegation Status */}
      {isOnRarichain && isDelegatedToSomeone && (
        <Box
          p="4"
          bg={theme.modal.delegateTo.bg}
          borderRadius="lg"
          border="1px solid"
          borderColor={theme.modal.delegateTo.input.border}
        >
          <Text fontSize="sm" color={theme.modal.delegateTo.subtext} mb="2">
            Current Delegation
          </Text>
          {isCurrentlyDelegatedTo ? (
            <HStack spacing="3" align="center">
              <ImgWithFallback
                h="32px"
                w="32px"
                borderRadius="full"
                src={`${daoInfo.config.IMAGE_PREFIX_URL}${currentDelegate}`}
                fallback={currentDelegate}
              />
              <Text
                fontSize="md"
                fontWeight="bold"
                color={theme.modal.delegateTo.text}
              >
                Already delegated to this delegate
              </Text>
            </HStack>
          ) : (
            <HStack spacing="3" align="center">
              <ImgWithFallback
                h="32px"
                w="32px"
                borderRadius="full"
                src={`${daoInfo.config.IMAGE_PREFIX_URL}${currentDelegate}`}
                fallback={currentDelegate}
              />
              <Box>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  color={theme.modal.delegateTo.text}
                >
                  Delegated to another delegate
                </Text>
                <Text fontSize="xs" color={theme.modal.delegateTo.subtext}>
                  {currentDelegate}
                </Text>
              </Box>
            </HStack>
          )}
        </Box>
      )}

      {/* Delegation Info */}
      <Box
        p="4"
        bg={theme.modal.delegateTo.bg}
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.modal.delegateTo.input.border}
        opacity={isOnRarichain ? 1 : 0.6}
      >
        <Text fontSize="sm" color={theme.modal.delegateTo.subtext} mb="3">
          {isCurrentlyDelegatedTo ? 'Currently delegated to' : 'Delegate to'}
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
              {delegateName || truncateAddress(delegateAddress)}
            </Text>
            <Text fontSize="xs" color={theme.modal.delegateTo.subtext}>
              {delegateAddress}
            </Text>
          </Box>
        </HStack>
      </Box>

      {/* Delegation Amount Display */}
      <Box
        p="4"
        bg={theme.modal.delegateTo.topBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.modal.delegateTo.input.border}
        opacity={isOnRarichain ? 1 : 0.6}
      >
        <Text fontSize="sm" color={theme.modal.delegateTo.subtext} mb="1">
          You will delegate
        </Text>
        <Text
          fontSize="lg"
          fontWeight="bold"
          color={theme.modal.delegateTo.text}
        >
          {formattedBalance} $RARI
        </Text>
      </Box>

      {/* Action Button */}
      <Button
        onClick={handleDelegate}
        isDisabled={
          !isOnRarichain ||
          parseFloat(formattedBalance) === 0 ||
          isCurrentlyDelegatedTo
        }
        isLoading={isLoading}
        loadingText="Delegating..."
        bg={theme.modal.delegateTo.button.normal.bg}
        color={theme.modal.delegateTo.button.normal.text}
        _hover={{
          bg: theme.modal.delegateTo.button.normal.bg,
          opacity: 0.9,
        }}
        _disabled={{
          bg: theme.modal.delegateTo.button.disabled.bg,
          color: theme.modal.delegateTo.button.disabled.text,
        }}
        size="lg"
        w="full"
      >
        {getButtonText()}
      </Button>
    </VStack>
  );
};
