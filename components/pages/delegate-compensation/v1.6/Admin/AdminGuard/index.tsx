import { Flex, Text } from '@chakra-ui/react';
import { useAuth, useWallet } from 'contexts';
import { FC, ReactNode } from 'react';

interface AdminGuardProps {
  children: ReactNode;
  disableGuard?: boolean;
}

export const AdminGuard: FC<AdminGuardProps> = ({
  children,
  disableGuard = false,
}) => {
  const { isConnected } = useWallet();
  const { isAuthenticated, isDaoAdmin } = useAuth();
  if (disableGuard) {
    return <>{children}</>;
  }
  if (!isAuthenticated || !isConnected) {
    return (
      <Flex
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        py="10"
        h="full"
        w="full"
      >
        <Text>You must be logged in to access this page</Text>
      </Flex>
    );
  }
  if (!isDaoAdmin) {
    return (
      <Flex
        flexDir="column"
        alignItems="center"
        justifyContent="center"
        py="10"
        h="full"
        w="full"
      >
        <Text>You are not authorized to access this page</Text>
      </Flex>
    );
  }
  return <>{children}</>;
};
