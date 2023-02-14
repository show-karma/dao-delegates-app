import axios from 'axios';
import { cookieNames } from 'helpers';
import jwtDecode from 'jwt-decode';
import React, {
  useContext,
  createContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { IExpirationStatus, ISession } from 'types';
import Cookies from 'universal-cookie';
import { checkExpirationStatus } from 'utils';
import { useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useDAO } from './dao';
import { useDelegates } from './delegates';
import { useWallet } from './wallet';

interface IAuthProps {
  isAuthenticated: boolean;
  authenticate: () => Promise<boolean>;
  authToken: string | null;
  disconnect: () => void;
}

export const AuthContext = createContext({} as IAuthProps);

interface ProviderProps {
  children: React.ReactNode;
}

const api = axios.create({
  timeout: 30000, // 30secs
  baseURL: process.env.NEXT_PUBLIC_KARMA_API,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export const AuthProvider: React.FC<ProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authToken, setToken] = useState<string | null>(null);
  const { openConnectModal } = useWallet();

  const { disconnect: disconnectWallet } = useDisconnect();
  const { searchProfileModal } = useDelegates();
  const { daoData, daoInfo } = useDAO();

  const cookies = new Cookies();

  const { signMessageAsync } = useSignMessage();

  const disconnect = async () => {
    setToken(null);
    setIsAuthenticated(false);
    disconnectWallet();
    cookies.remove(cookieNames.cookieAuth);
    window.location.reload();
  };

  const { address, isConnected } = useAccount({
    onDisconnect: () => {
      disconnect();
    },
  });

  const isTokenValid = (tokenValue: string | null) => {
    if (!tokenValue) return false;
    const decoded = jwtDecode(tokenValue) as ISession;
    const expiredStatus: IExpirationStatus = checkExpirationStatus(decoded);
    if (expiredStatus === 'expired') {
      return false;
    }
    return true;
  };

  const getNonce = async (publicAddress: string) => {
    try {
      const response = await api.post(`/auth/login`, {
        publicAddress,
        daoName: daoData?.name || daoInfo.config.DAO_KARMA_ID,
      });
      const { nonceMessage } = response.data.data;
      return nonceMessage;
    } catch (error) {
      console.error('Error in login:', error);
      return null;
    }
  };

  const signMessage = async (messageToSign: string) => {
    try {
      const signedMessage = await signMessageAsync({ message: messageToSign });
      return signedMessage;
    } catch (err) {
      console.log(err);
      return null;
    }
  };

  const saveToken = (token: string | null) => {
    setToken(token);
    if (token) cookies.set(cookieNames.cookieAuth, token);
    setIsAuthenticated(true);
  };

  const getAccountToken = async (
    publicAddress: string,
    signedMessage: string
  ) => {
    try {
      const response = await api.post('/auth/authentication', {
        publicAddress,
        signedMessage,
      });
      const { token } = response.data.data;
      setToken(token);
      return token;
    } catch (error) {
      console.log('Error in getAccountAssets', error);
      return null;
    }
  };

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
    if (!isConnected || !address) {
      setIsAuthenticating(true);
      openConnectModal?.();
      return false;
    }
    try {
      const nonceMessage = await getNonce(address);
      const signedMessage = await signMessage(nonceMessage);
      if (!signedMessage) return false;
      const token = await getAccountToken(address, signedMessage);
      if (token) saveToken(token);
      searchProfileModal(address, 'statement');
      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (isConnected && isAuthenticating && !isAuthenticated) {
      authenticate();
    }
  }, [isConnected, daoData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = cookies.get(cookieNames.cookieAuth);
      const isValid = isTokenValid(savedToken);
      if (savedToken && isValid) saveToken(savedToken);
    }
  }, []);

  const providerValue = useMemo(
    () => ({
      isAuthenticated,
      authenticate,
      authToken,
      disconnect,
    }),
    [isAuthenticated, authenticate, authToken, disconnect]
  );

  return (
    <AuthContext.Provider value={providerValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
