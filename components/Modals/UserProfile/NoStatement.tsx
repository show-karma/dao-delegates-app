import { Button, Flex, Text } from '@chakra-ui/react';
import { useDAO, useWallet, useAuth } from 'contexts';
import { FC } from 'react';

export const NoStatement: FC = () => {
  const { theme } = useDAO();
  const { isConnected } = useWallet();
  const { isAuthenticated, authenticate } = useAuth();

  return (
    <Flex flexDir="column" w="full">
      <Text
        color={theme.modal.statement.headline}
        fontWeight="medium"
        fontSize="lg"
      >
        No contributor statement
      </Text>
      <Text
        color={theme.modal.statement.text}
        fontWeight="normal"
        fontSize="md"
        w="full"
      >
        Are you the owner of this address? To edit details and claim ownership
        you must hook up your wallet.
      </Text>

      {!isConnected ||
        (isConnected && !isAuthenticated && (
          <Button
            w="min-content"
            py="3"
            px="6"
            bgColor="white"
            color="black"
            mt="6"
            fontSize="md"
            fontWeight="semibold"
            _hover={{}}
            _active={{}}
            _focus={{}}
            _focusVisible={{}}
            _focusWithin={{}}
            onClick={authenticate}
          >
            Connect Wallet
          </Button>
        ))}
    </Flex>
  );
};
