import { Button, Flex, Icon, Image, Radio, Text } from '@chakra-ui/react';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { useDAO, useDelegates, useGovernanceVotes, useWallet } from 'contexts';
import { useMixpanel, useToasty } from 'hooks';
import React, { useState } from 'react';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { IDelegate, MultiChainResult } from 'types';
import { formatNumber, truncateAddress } from 'utils';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  prepareWriteContract,
  waitForTransaction,
  writeContract,
} from '@wagmi/core';
import { zeroAddress } from 'viem';
import { DelegateModalBody } from '../DelegateModalBody';
import { DelegateModalHeader } from '../DelegateModalHeader';

interface StepProps {
  handleModal: () => void;
  votes: MultiChainResult[];
  delegatedUser: IDelegate;
  walletAddress?: string;
}

interface TokenSelection {
  chainId: number;
  contractAddress: string;
}

export const MultiChain: React.FC<StepProps> = ({
  handleModal,
  votes,
  delegatedUser,
  walletAddress,
}) => {
  const { daoInfo, daoData } = useDAO();
  const { config } = daoInfo;
  const { delegatedBefore, symbol, getVotes, getDelegatedBefore } =
    useGovernanceVotes();
  const [selectedToken, setSelectedToken] = useState<TokenSelection | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDelegating, setIsDelegating] = useState(false);

  const { isConnected } = useAccount();
  const { openConnectModal } = useWallet();
  const { delegatePoolList } = useDelegates();

  const { mixpanel } = useMixpanel();
  const { toast } = useToasty();

  const handleTokenSelection = (chainId: number, contractAddress: string) => {
    setSelectedToken({ chainId, contractAddress });
  };

  const modalSpacing = {
    padding: '16px 32px',
  };

  const { switchNetworkAsync } = useSwitchNetwork();
  const { chain } = useNetwork();

  const delegate = async (chainId: number, contractAddress: string) => {
    const delegateContract = config.DAO_DELEGATE_CONTRACT?.find(
      contract => contract.chain.id === chainId
    );

    if (!delegateContract) {
      throw new Error('Delegate contract not found');
    }

    const contractAddressHex = contractAddress as `0x${string}`;

    const prepareConfig = await prepareWriteContract({
      address: contractAddressHex,
      functionName: daoInfo.config.DAO_DELEGATE_FUNCTION || 'delegate',
      args: [delegatedUser.address],
      abi: daoInfo.DELEGATE_ABI,
      chainId,
    });

    mixpanel.reportEvent({
      event: 'delegateButtonClick',
    });

    const { hash } = await writeContract(prepareConfig);
    await waitForTransaction({
      confirmations: 1,
      hash,
    }).then(async () => {
      toast({
        title: 'Success',
        description: `You have successfully delegated to ${delegatedUser.ensName || delegatedUser.address
          } on ${chain?.name}`,
        status: 'success',
      });
      handleModal();
      // Refresh delegated info and votes
      await getDelegatedBefore();
    });
  };

  const multiChainDelegate = async () => {
    if (!selectedToken) return;
    try {
      setIsLoading(true);
      setIsDelegating(false);
      if (
        config.ALLOW_BULK_DELEGATE &&
        config.BULK_DELEGATE_MAXSIZE &&
        delegatePoolList.length > config.BULK_DELEGATE_MAXSIZE
      ) {
        toast({
          title: 'Too many delegates',
          description: `You can only delegate to ${config.BULK_DELEGATE_MAXSIZE} user at a time.`,
          status: 'error',
        });
      }

      if (!chain) {
        openConnectModal?.();
        return;
      }

      if (chain.id !== selectedToken.chainId) {
        await switchNetworkAsync?.(selectedToken.chainId).then(
          async ({ id }) => {
            await delegate(id, selectedToken.contractAddress);
          }
        );
        return;
      }

      if (!config.DAO_DELEGATE_CONTRACT)
        throw new Error('No DELEGATE_CONTRACT in config');

      await delegate(selectedToken.chainId, selectedToken.contractAddress);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Group tokens by chain
  const tokensByChain = config.DAO_TOKEN_CONTRACT?.reduce((acc, contract) => {
    const chainId = contract.chain.id;
    const chainTokens: Array<{
      address: string;
      symbol: string;
      value: string;
      delegatedTo?: string;
    }> = [];

    contract.contractAddress.forEach(address => {
      // Get symbol from the symbols state
      const symbolResult = symbol.find(
        s => s.chain.id === chainId && s.contractAddress === address
      );

      // Try to get symbol from the token contract config first
      const contractConfig = config.DAO_TOKEN_CONTRACT?.find(
        c => c.chain.id === chainId && c.contractAddress.includes(address)
      );

      // Get the actual token symbol
      let tokenSymbol = 'TOKEN';
      if (symbolResult?.value && typeof symbolResult.value === 'string') {
        tokenSymbol = symbolResult.value;
      }

      const tokenVote = votes.find(
        v => v.chain.id === chainId && v.contractAddress === address
      );
      const voteValue = tokenVote?.value || '0';

      const delegatedTo = delegatedBefore.find(
        d => d.chain.id === chainId && d.contractAddress === address
      )?.value;

      if (+voteValue > 0) {
        chainTokens.push({
          address,
          symbol: tokenSymbol,
          value: voteValue,
          delegatedTo,
        });
      }
    });

    // Only add the chain if it has tokens with balance
    if (chainTokens.length > 0) {
      acc[chainId] = chainTokens;
    }

    return acc;
  }, {} as Record<number, Array<{ address: string; symbol: string; value: string; delegatedTo?: string }>>);

  if (!daoData) return null;
  const { name: daoName, socialLinks } = daoData;
  const { logoUrl } = socialLinks;

  return (
    <Flex
      flexDir="column"
      width={['340px', '390px', '550px']}
      height="max-content"
      backgroundColor="white"
      borderRadius="6px"
    >
      <DelegateModalHeader handleModal={handleModal} />
      <DelegateModalBody
        flexProps={{
          ...modalSpacing,
          boxShadow: '0px 15px 10px rgba(0, 0, 0, 0.05)',
          paddingBottom: 7,
        }}
      >
        {Object.keys(tokensByChain || {}).length === 0 ? (
          <Flex
            background="rgba(244, 171, 104, 0.11)"
            borderRadius="4px"
            color="#ffa552"
            flexDirection="row"
            gap="8px"
            display="flex"
            position="absolute"
            top="12px"
            right="12px"
            padding="8px 12px"
            mr={10}
            alignItems="center"
          >
            <Icon as={IoAlertCircleOutline} boxSize="20px" />
            <Text
              color="#ffa552"
              fontStyle="normal"
              fontWeight={['400', '400', '700']}
              fontSize={['10px', '10px', '12px']}
            >
              No tokens to delegate
            </Text>
          </Flex>
        ) : null}
        <Flex flex="1" flexDirection="column">
          <Flex
            flex="1"
            alignItems="center"
            flexWrap="wrap"
            gap="2"
            margin="0 0 23px 0"
          >
            <Text
              fontStyle="normal"
              fontSize="14px"
              marginRight="3"
              color="black"
            >
              You are delegating to
            </Text>
            <Flex alignItems="center" gap="4" flex="2">
              <Flex
                paddingX={2}
                paddingY={1}
                border="1px solid #ebedf0"
                boxSizing="border-box"
                borderRadius="6px"
                wordBreak="break-all"
                position="relative"
                background="#ebedf0"
                flexDirection="column"
              >
                <Flex
                  display="flex"
                  flexDirection="row"
                  gap="8px"
                  alignItems="center"
                >
                  <ImgWithFallback
                    fallback={
                      delegatedUser.realName ||
                      delegatedUser.ensName ||
                      delegatedUser.address
                    }
                    src={delegatedUser.profilePicture}
                    boxSize="20px"
                    borderRadius="full"
                  />
                  <Text
                    fontStyle="normal"
                    fontWeight="500"
                    fontSize="14px"
                    color="#000000"
                    textOverflow="ellipsis"
                    maxW={[100, 100, 130]}
                    whiteSpace="nowrap"
                    overflow="hidden"
                  >
                    {delegatedUser.ensName ||
                      truncateAddress(delegatedUser.address)}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
          <Flex flexDir="column" gap="4" mb="6">
            {Object.entries(tokensByChain || {}).map(([chainId, tokens]) => (
              <Flex
                key={chainId}
                flexDir="column"
                gap="2"
                backgroundColor="gray.50"
                p="4"
                borderRadius="lg"
              >
                <Flex alignItems="center" gap="2" mb="2">
                  <Image
                    src={`/images/chains/${config.DAO_TOKEN_CONTRACT?.find(
                      c => c.chain.id === +chainId
                    )?.chain.network
                      }.svg`}
                    alt={
                      config.DAO_TOKEN_CONTRACT?.find(
                        c => c.chain.id === +chainId
                      )?.chain.name
                    }
                    boxSize="24px"
                    borderRadius="full"
                  />
                  <Text fontWeight="600">
                    {
                      config.DAO_TOKEN_CONTRACT?.find(
                        c => c.chain.id === +chainId
                      )?.chain.name
                    }
                  </Text>
                </Flex>
                {tokens.map(token => (
                  <Flex
                    key={token.address}
                    flexDir="row"
                    alignItems="center"
                    gap="3"
                    backgroundColor="white"
                    p="3"
                    borderRadius="md"
                  >
                    <Radio
                      isChecked={
                        selectedToken?.chainId === +chainId &&
                        selectedToken?.contractAddress === token.address
                      }
                      onChange={() =>
                        handleTokenSelection(+chainId, token.address)
                      }
                      colorScheme="blue"
                      backgroundColor="gray.100"
                    />
                    <Flex flexDir="column" flex="1">
                      <Text fontSize="14px" fontWeight="500">
                        {token.symbol}
                      </Text>
                      <Text fontSize="12px" color="gray.600">
                        Balance: {formatNumber(token.value)}
                      </Text>
                    </Flex>
                    {token.delegatedTo && token.delegatedTo !== zeroAddress && (
                      <Text fontSize="12px" color="gray.500">
                        Currently delegated to:{' '}
                        {truncateAddress(token.delegatedTo)}
                      </Text>
                    )}
                  </Flex>
                ))}
              </Flex>
            ))}
          </Flex>
        </Flex>
        <Button
          disabled={!selectedToken}
          isDisabled={!selectedToken}
          bgColor="black"
          color="white"
          _focus={{ opacity: 0.8 }}
          _focusWithin={{ opacity: 0.8 }}
          _focusVisible={{ opacity: 0.8 }}
          _active={{ opacity: 0.8 }}
          _hover={{ opacity: 0.8 }}
          _disabled={{ opacity: 0.2 }}
          isLoading={isLoading}
          onClick={() => multiChainDelegate()}
        >
          Delegate
        </Button>
      </DelegateModalBody>
    </Flex>
  );
};
