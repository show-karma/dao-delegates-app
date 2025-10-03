import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Chain, erc20ABI } from 'wagmi';
// eslint-disable-next-line import/no-extraneous-dependencies
import { readContract } from '@wagmi/core';
import { BigNumber, ethers } from 'ethers';
import { Hex, IBalanceOverview, MultiChainResult } from 'types';
import { formatEther } from 'utils';
import { zeroAddress } from 'viem';
import { useDAO } from './dao';
import { useWallet } from './wallet';

interface IGovernanceVotesProps {
  votes: MultiChainResult[];
  balanceOverview?: IBalanceOverview;
  isLoadingVotes: boolean;
  delegatedBefore: MultiChainResult[];
  symbol: MultiChainResult[];
  walletAddress?: string;
  getVotes: () => Promise<void>;
  getDelegatedBefore: () => Promise<void>;
  loadedVotes: boolean;
}

export const GovernanceVotesContext = createContext(
  {} as IGovernanceVotesProps
);

interface ProviderProps {
  children: React.ReactNode;
}

export const GovernanceVotesProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const { daoInfo } = useDAO();
  const { address: walletAddress, isConnected } = useWallet();
  const [votes, setVotes] = useState<MultiChainResult[]>([]);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [symbol, setSymbol] = useState<MultiChainResult[]>([]);
  const [loadedVotes, setLoadedVotes] = useState(false);
  const [isLoadingVotes, setIsLoadingVotes] = useState(false);
  const [balanceOverview, setBalanceOverview] = useState<
    IBalanceOverview | undefined
  >();

  const [delegatedBefore, setDelegatedBefore] = useState<MultiChainResult[]>(
    []
  );

  const groupContractsByChain = daoInfo.config.DAO_TOKEN_CONTRACT?.reduce(
    (acc, contract) => {
      const chainId = contract.chain.id.toString();
      if (!acc[chainId]) acc[chainId] = [];
      acc[chainId].push(contract);
      return acc;
    },
    {} as Record<string, typeof daoInfo.config.DAO_TOKEN_CONTRACT>
  );

  const chainKeys = groupContractsByChain
    ? Object.keys(groupContractsByChain)
    : null;

  const getVotes = async () => {
    setLoadedVotes(false);
    setIsLoadingVotes(true);
    try {
      if (!daoInfo.config.DAO_TOKEN_CONTRACT || !groupContractsByChain)
        throw new Error(`No Token contract found`);
      if (!chainKeys) throw new Error(`No chain keys found`);

      // Clear previous symbols
      setSymbol([]);

      // First, collect all symbols
      let symbolsToSet: MultiChainResult[] = [];

      const multiChainAmounts = await Promise.all(
        chainKeys.map(async chainId => {
          const contracts = groupContractsByChain[chainId];
          const chain = contracts[0].chain as Chain;

          // Get votes and symbols in parallel for all contracts on this chain
          const [balanceResults, _] = await Promise.all([
            Promise.all(
              contracts.flatMap(contract =>
                contract.contractAddress.map(async address => {
                  try {
                    const args = walletAddress ? [walletAddress] : [];
                    const balance = await readContract({
                      address: address as Hex,
                      abi: contract.ABI || daoInfo.TOKEN_ABI,
                      functionName: contract.method[0],
                      args,
                      chainId: contract.chain.id,
                    });
                    const fromWeiAmount = balance
                      ? formatEther(BigNumber.from(balance))
                      : '0';
                    return {
                      chain,
                      value: fromWeiAmount,
                      contractAddress: address,
                    } as MultiChainResult;
                  } catch (error) {
                    console.error('Error fetching balance for', address, error);
                    return {
                      chain,
                      value: '0',
                      contractAddress: address,
                    } as MultiChainResult;
                  }
                })
              )
            ),
            Promise.all(
              contracts.flatMap(contract =>
                contract.contractAddress.map(async address => {
                  try {
                    // First try with the token's own ABI
                    const symbolValue = await readContract({
                      address: address as Hex,
                      abi: contract.ABI || daoInfo.TOKEN_ABI,
                      functionName: 'symbol',
                      args: [],
                      chainId: contract.chain.id,
                    });

                    symbolsToSet = [
                      ...symbolsToSet,
                      {
                        chain,
                        value: String(symbolValue),
                        contractAddress: address,
                      },
                    ];
                  } catch (error) {
                    // Try with standard ERC20 ABI if the first attempt fails
                    try {
                      const symbolValue = await readContract({
                        address: address as Hex,
                        abi: erc20ABI,
                        functionName: 'symbol',
                        args: undefined,
                        chainId: contract.chain.id,
                      });
                      symbolsToSet = [
                        ...symbolsToSet,
                        {
                          chain,
                          value: String(symbolValue),
                          contractAddress: address,
                        },
                      ];
                    } catch (err) {
                      console.error('Error fetching symbol for', address, err);
                      symbolsToSet = [
                        ...symbolsToSet,
                        {
                          chain,
                          value: 'TOKEN',
                          contractAddress: address,
                        },
                      ];
                    }
                  }
                })
              )
            ),
          ]);

          // Update total token balance
          const totalAmount = balanceResults.reduce((acc, balance) => {
            if (balance.value) {
              return acc.add(
                BigNumber.from(ethers.utils.parseEther(balance.value))
              );
            }
            return acc;
          }, BigNumber.from('0'));

          setTokenBalance(prev => {
            const currentBalance = BigNumber.from(
              ethers.utils.parseEther(prev || '0')
            );
            return formatEther(currentBalance.add(totalAmount));
          });

          if (daoInfo.config.GET_LOCKED_TOKENS_ACTION) {
            const { GET_LOCKED_TOKENS_ACTION: getLocked } = daoInfo.config;
            const lockedVotes = await getLocked(walletAddress as Hex);
            // Add locked votes to each token balance
            return balanceResults.map(balance => ({
              ...balance,
              value: (+balance.value + +lockedVotes).toString(),
            }));
          }

          return balanceResults;
        })
      );

      // Update symbols state with all collected symbols
      setSymbol(symbolsToSet);

      // Flatten the array since we now have multiple tokens per chain
      setVotes(multiChainAmounts.flat());
    } catch (error) {
      setVotes([]);
    } finally {
      setLoadedVotes(true);
      setIsLoadingVotes(false);
    }
  };

  const getBalanceOverview = async () => {
    if (walletAddress && daoInfo.config.GET_BALANCE_OVERVIEW_ACTION) {
      const { GET_BALANCE_OVERVIEW_ACTION: fn } = daoInfo.config;
      const overview = await fn(walletAddress as Hex);
      setBalanceOverview({ ...overview, balance: tokenBalance });
    }
  };

  useEffect(() => {
    getVotes();
  }, [walletAddress, isConnected]);

  useEffect(() => {
    if (walletAddress && isConnected) getBalanceOverview();
  }, [tokenBalance, walletAddress, isConnected]);

  const getDelegatedBefore = async () => {
    try {
      if (!daoInfo.config.DAO_DELEGATE_CONTRACT || !groupContractsByChain)
        return;

      const promises = daoInfo.config.DAO_DELEGATE_CONTRACT.flatMap(contract =>
        contract.contractAddress.map(async address => {
          const result = await readContract({
            address: address as Hex,
            abi: daoInfo.DELEGATE_ABI,
            functionName:
              daoInfo.config.DAO_CHECK_DELEGATION_FUNCTION || 'delegates',
            args: daoInfo.config.DAO_CHECK_DELEGATION_ARGS
              ? [walletAddress].concat(daoInfo.config.DAO_CHECK_DELEGATION_ARGS)
              : [walletAddress],
            chainId: contract.chain.id,
          }).catch(() => zeroAddress);
          return {
            chain: contract.chain,
            value: result as string,
            contractAddress: address,
          } as MultiChainResult;
        })
      );
      const promisedResults = await Promise.all(promises);
      setDelegatedBefore(promisedResults);
    } catch (error) {
      console.log(error);
      setDelegatedBefore([]);
    }
  };

  useEffect(() => {
    if (isConnected && walletAddress) {
      getDelegatedBefore();
    }
  }, [walletAddress, isConnected]);

  const getSymbol = async () => {
    try {
      if (!daoInfo.config.DAO_TOKEN_CONTRACT || !groupContractsByChain) return;

      const promises = daoInfo.config.DAO_TOKEN_CONTRACT.flatMap(contract =>
        contract.contractAddress.map(async address => {
          const result = await readContract({
            address: address as Hex,
            abi: daoInfo.TOKEN_ABI,
            functionName: 'symbol',
            args: [],
            chainId: contract.chain.id,
          })
            .then(value => value)
            .catch(() => undefined);
          return {
            chain: contract.chain,
            value: result || address,
            contractAddress: address,
          } as MultiChainResult;
        })
      );

      const promisedResults = await Promise.all(promises);
      setSymbol(promisedResults);
    } catch (error) {
      console.log(error);
      setSymbol([]);
    }
  };

  useEffect(() => {
    getSymbol();
  }, [isConnected]);

  const providerValue = useMemo(
    () => ({
      votes,
      balanceOverview,
      isLoadingVotes,
      delegatedBefore,
      symbol,
      isConnected,
      walletAddress,
      getVotes,
      loadedVotes,
      getDelegatedBefore,
    }),
    [
      votes,
      balanceOverview,
      isLoadingVotes,
      delegatedBefore,
      symbol,
      isConnected,
      walletAddress,
      getVotes,
      loadedVotes,
      getDelegatedBefore,
    ]
  );

  return (
    <GovernanceVotesContext.Provider value={providerValue}>
      {children}
    </GovernanceVotesContext.Provider>
  );
};

export const useGovernanceVotes = () => useContext(GovernanceVotesContext);
