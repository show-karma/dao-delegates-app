import { Flex } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import React from 'react';

interface IMainLayout {
  children: React.ReactNode;
}

export const MainLayout: React.FC<IMainLayout> = ({ children }) => {
  const { theme } = useDAO();

  return (
    <Flex
      flexDir="column"
      minH="100vh"
      backgroundColor={theme.bodyBg}
      boxShadow={theme.bodyShadow}
      align="center"
      px={['0', '2', '16']}
    >
      {children}
    </Flex>
  );
};
