import React, {
  useContext,
  createContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { Chain } from 'wagmi';
// eslint-disable-next-line import/no-extraneous-dependencies
import { readContracts, readContract } from '@wagmi/core';
import { formatEther } from 'utils';
import { BigNumber } from 'ethers';
import { Hex, IBalanceOverview, MultiChainResult } from 'types';
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
      if (!acc[contract.chain.id]) acc[contract.chain.id] = [];
      acc[contract.chain.id].push(contract);
      return acc;
    },
    {} as Record<string, any[]>
  );
  const chainKeys = groupContractsByChain
    ? Object.keys(groupContractsByChain as object)
    : null;

  const getVotes = async () => {
    setLoadedVotes(false);
    setIsLoadingVotes(true);
    try {
      if (!daoInfo.config.DAO_TOKEN_CONTRACT || !groupContractsByChain)
        throw new Error(`No Token contract found`);
      if (!chainKeys) throw new Error(`No chain keys found`);

      const multiChainAmounts = await Promise.all(
        chainKeys.map(async key => {
          const data = await readContracts({
            contracts: groupContractsByChain[key].map(contract => ({
              address: contract.contractAddress,
              abi: contract.ABI || daoInfo.TOKEN_ABI,
              functionName: contract.method,
              args: walletAddress ? [walletAddress] : undefined,
              chainId: contract.chain.id,
            })),
          });

          const amountsBN = data.map(amount => {
            if (amount && amount.result)
              return BigNumber.from(amount.result).toString();
            return '0';
          });
          const chain = daoInfo.config.DAO_TOKEN_CONTRACT?.find(
            contract => contract.chain.id === +key
          )?.chain as Chain;

          const sumBNs = amountsBN.reduce(
            (acc, amount) => acc.add(BigNumber.from(amount)),
            BigNumber.from('0')
          );

          const fromWeiAmount = formatEther(sumBNs.toString());
          setTokenBalance(fromWeiAmount);

          if (daoInfo.config.GET_LOCKED_TOKENS_ACTION) {
            const { GET_LOCKED_TOKENS_ACTION: getLocked } = daoInfo.config;
            const lockedVotes = await getLocked(walletAddress as Hex);
            return { chain, value: (+fromWeiAmount + +lockedVotes).toString() };
          }

          return { chain, value: fromWeiAmount };
        })
      );

      setVotes(multiChainAmounts);
    } catch {
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

      const promises = daoInfo.config.DAO_DELEGATE_CONTRACT.map(
        async contract => {
          const result = await readContract({
            address: contract.contractAddress,
            abi: daoInfo.DELEGATE_ABI,
            functionName:
              daoInfo.config.DAO_CHECK_DELEGATION_FUNCTION || 'delegates',
            args: daoInfo.config.DAO_CHECK_DELEGATION_ARGS
              ? [walletAddress].concat(daoInfo.config.DAO_CHECK_DELEGATION_ARGS)
              : [walletAddress],
            chainId: contract.chain.id,
          });
          return { chain: contract.chain, value: result };
        }
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

      const promises = daoInfo.config.DAO_TOKEN_CONTRACT.map(async contract => {
        const result = await readContract({
          address: contract.contractAddress,
          abi: daoInfo.TOKEN_ABI,
          functionName: 'symbol',
          args: [],
          chainId: contract.chain.id,
        }).then(value => value);
        return { chain: contract.chain, value: result };
      });

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
    ]
  );

  return (
    <GovernanceVotesContext.Provider value={providerValue}>
      {children}
    </GovernanceVotesContext.Provider>
  );
};

export const useGovernanceVotes = () => useContext(GovernanceVotesContext);
