import { api } from 'helpers';
import { usePicasso } from 'hooks';
import React, { useContext, createContext, useMemo, useState } from 'react';
import { supportedDAOs } from 'resources';
import { IDAOData, IDAOInfo, IDAOTheme } from 'types';

interface IDAOProps {
  daoInfo: IDAOInfo;
  theme: IDAOTheme;
  daoData: IDAOData | undefined;
  selectedDAO: string;
  rootPathname: string;
}

export const DAOContext = createContext({} as IDAOProps);

interface ProviderProps {
  selectedDAO: string;
  children: React.ReactNode;
  shouldFetchInfo?: boolean;
  withPathname?: boolean;
}

export const DAOProvider: React.FC<ProviderProps> = ({
  children,
  selectedDAO,
  shouldFetchInfo = true,
  withPathname = false,
}) => {
  const [daoInfo, setDAOInfo] = useState<IDAOInfo>({} as IDAOInfo);
  const [daoData, setDAOData] = useState<IDAOData>();
  const theme = usePicasso({ light: daoInfo.light, dark: daoInfo.dark });

  const [rootPathname] = useState(
    withPathname ? `/${selectedDAO.toLowerCase()}` : ''
  );

  const searchConfig = (dao: string) => {
    const findDAO = supportedDAOs[dao];
    if (!findDAO) setDAOInfo({} as IDAOInfo);
    setDAOInfo(findDAO);
  };

  const setupDaoInfo = async () => {
    const { config } = daoInfo;
    await api
      .get(`/dao/delegates?name=${config.DAO_KARMA_ID}&pageSize=10&offset=0`)
      .then(res => setDAOData(res.data.data));

    await api
      .get(`/dao/${config.DAO_KARMA_ID}`)
      .then(res => {
        setDAOData(prevData => {
          if (!prevData) return res.data.data;
          return {
            ...prevData,
            lastUpdatedAt: res.data.data.lastUpdatedAt
          };
        });
      });
  };

  useMemo(() => {
    if (shouldFetchInfo && daoInfo?.config?.DAO_KARMA_ID) setupDaoInfo();
  }, [daoInfo]);

  useMemo(() => {
    searchConfig(selectedDAO);
  }, [selectedDAO]);

  const providerValue = useMemo(
    () => ({
      daoInfo,
      theme,
      daoData,
      selectedDAO,
      rootPathname,
    }),
    [daoInfo, theme, daoData, rootPathname]
  );

  return (
    <DAOContext.Provider value={providerValue}>{children}</DAOContext.Provider>
  );
};

export const useDAO = () => useContext(DAOContext);
