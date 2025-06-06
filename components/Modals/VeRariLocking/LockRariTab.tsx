import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Text,
  VStack,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FC, useState, useEffect, useRef } from 'react';
import {
  useRariToken,
  useRariLock,
  useProspectiveVeRari,
  useRariNetwork,
  useVeRariLocks,
} from 'hooks';
import {
  RARI_LOCK_TIMEFRAMES,
  RariLockTimeframe,
} from 'resources/rari/constants';
import { formatNumber } from 'utils';
import { formatEther } from 'viem';

interface ILockRariTab {
  delegateAddress: string;
  onSuccess: () => void;
}

export const LockRariTab: FC<ILockRariTab> = ({
  delegateAddress,
  onSuccess,
}) => {
  const { theme } = useDAO();
  const [rariAmount, setRariAmount] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] =
    useState<RariLockTimeframe>('1 month');

  // Track if we've already triggered lock after approval
  const hasTriggeredLockRef = useRef(false);

  // Network checking
  const {
    isCorrectNetwork,
    switchToMainnet,
    currentNetworkName,
    targetNetworkName,
  } = useRariNetwork();

  // Get RARI token data
  const {
    formattedBalance,
    approveRari,
    needsApproval,
    isApproveLoading,
    isApproveSuccess,
    refetchAllowance,
  } = useRariToken({ amountToApprove: rariAmount });

  // Get existing locks data for refreshing
  const { refetch: refetchLocks } = useVeRariLocks();

  // Lock RARI hook - calculate cliff and slope periods
  const timeframeInWeeks = RARI_LOCK_TIMEFRAMES[selectedTimeframe];
  const cliffWeeks = Math.floor(timeframeInWeeks * 0.75); // 75% of timeframe
  const slopeWeeks = Math.floor(timeframeInWeeks * 0.25); // 25% of timeframe

  // Get prospective veRARI amount - note: this calculation may not reflect the exact cliff/slope split
  const prospectiveVeRariResult = useProspectiveVeRari(
    rariAmount,
    selectedTimeframe
  );

  // Calculate prospective veRARI - simplified approach
  const getProspectiveVeRariAmount = (): string => {
    try {
      const data = prospectiveVeRariResult?.data as any[];
      if (data && Array.isArray(data) && data[0]) {
        return formatNumber(formatEther(data[0]));
      }
      return '0';
    } catch {
      return '0';
    }
  };

  const {
    lockRari,
    isLoading: isLockLoading,
    isSuccess: isLockSuccess,
  } = useRariLock({
    amount: rariAmount,
    delegateAddress,
    slopePeriod: slopeWeeks,
    cliff: cliffWeeks,
  });

  useEffect(() => {
    if (isApproveSuccess && !hasTriggeredLockRef.current) {
      hasTriggeredLockRef.current = true;
      refetchAllowance();
      if (lockRari) {
        lockRari();
      }
    }
  }, [isApproveSuccess, refetchAllowance]);

  useEffect(() => {
    if (isLockSuccess) {
      refetchLocks();
      onSuccess();
    }
  }, [isLockSuccess, onSuccess, refetchLocks]);

  const handleApproveClick = () => {
    hasTriggeredLockRef.current = false;
    approveRari();
  };

  const handleMaxClick = () => {
    setRariAmount(formattedBalance);
  };

  const isAmountValid =
    rariAmount &&
    parseFloat(rariAmount) > 0 &&
    parseFloat(rariAmount) <= parseFloat(formattedBalance);
  const needsApprovalForAmount = needsApproval(rariAmount);

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

      {/* Balance Display */}
      <Box
        p="4"
        bg={theme.modal.delegateTo.topBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.modal.delegateTo.input.border}
        opacity={isCorrectNetwork ? 1 : 0.6}
      >
        <Text fontSize="sm" color={theme.modal.delegateTo.subtext} mb="1">
          Your total balance
        </Text>
        <Text
          fontSize="lg"
          fontWeight="bold"
          color={theme.modal.delegateTo.text}
        >
          {formattedBalance} $RARI
        </Text>
      </Box>

      {/* Amount Input */}
      <FormControl isDisabled={!isCorrectNetwork}>
        <FormLabel
          color={theme.modal.delegateTo.text}
          fontSize="sm"
          fontWeight="semibold"
        >
          Amount of RARI
        </FormLabel>
        <HStack>
          <NumberInput
            value={rariAmount}
            onChange={setRariAmount}
            min={0}
            max={parseFloat(formattedBalance)}
            flex="1"
            isDisabled={!isCorrectNetwork}
          >
            <NumberInputField
              bg={theme.modal.delegateTo.input.bg}
              border="1px solid"
              borderColor={theme.modal.delegateTo.input.border}
              color={theme.modal.delegateTo.input.text}
              placeholder="0"
              _placeholder={{ color: theme.modal.delegateTo.input.placeholder }}
              _focus={{
                borderColor: theme.modal.delegateTo.input.dirtyBorder,
              }}
            />
            <NumberInputStepper>
              <NumberIncrementStepper color={theme.modal.delegateTo.subtext} />
              <NumberDecrementStepper color={theme.modal.delegateTo.subtext} />
            </NumberInputStepper>
          </NumberInput>
          <Button
            onClick={handleMaxClick}
            variant="outline"
            size="sm"
            color={theme.modal.delegateTo.text}
            borderColor={theme.modal.delegateTo.input.border}
            _hover={{
              bg: theme.modal.delegateTo.topBg,
            }}
            isDisabled={!isCorrectNetwork}
          >
            Max
          </Button>
        </HStack>
      </FormControl>

      {/* Timeframe Selection */}
      <FormControl isDisabled={!isCorrectNetwork}>
        <FormLabel
          color={theme.modal.delegateTo.text}
          fontSize="sm"
          fontWeight="semibold"
        >
          Timeframe
        </FormLabel>
        <Select
          value={selectedTimeframe}
          onChange={e =>
            setSelectedTimeframe(e.target.value as RariLockTimeframe)
          }
          bg={theme.modal.delegateTo.input.bg}
          border="1px solid"
          borderColor={theme.modal.delegateTo.input.border}
          color={theme.modal.delegateTo.input.text}
          _focus={{
            borderColor: theme.modal.delegateTo.input.dirtyBorder,
          }}
          isDisabled={!isCorrectNetwork}
        >
          {Object.keys(RARI_LOCK_TIMEFRAMES).map(timeframe => (
            <option key={timeframe} value={timeframe}>
              {timeframe}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Prospective veRARI Display */}
      <Box
        p="4"
        bg={theme.modal.delegateTo.topBg}
        borderRadius="lg"
        border="1px solid"
        borderColor={theme.modal.delegateTo.input.border}
        opacity={isCorrectNetwork ? 1 : 0.6}
      >
        <Text fontSize="sm" color={theme.modal.delegateTo.subtext} mb="1">
          You will get
        </Text>
        <Skeleton isLoaded={!prospectiveVeRariResult.isLoading}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            color={theme.modal.delegateTo.text}
          >
            {getProspectiveVeRariAmount()} veRARI
          </Text>
        </Skeleton>
      </Box>

      {/* Action Button */}
      {needsApprovalForAmount ? (
        <Button
          onClick={handleApproveClick}
          isLoading={isApproveLoading || isLockLoading}
          loadingText={
            isApproveLoading ? 'Approving...' : 'Locking & Delegating...'
          }
          isDisabled={!isAmountValid || !isCorrectNetwork}
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
          Approve & Lock RARI
        </Button>
      ) : (
        <Button
          onClick={lockRari}
          isLoading={isLockLoading}
          loadingText="Locking & Delegating..."
          isDisabled={!isAmountValid || !isCorrectNetwork}
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
          Lock RARI & Delegate
        </Button>
      )}
    </VStack>
  );
};
