import { Button, Flex, Text } from '@chakra-ui/react';
import { useDAO, useWallet, useAuth } from 'contexts';
import { FC } from 'react';

export const NoStatement: FC = () => {
  const { theme } = useDAO();
  const { isConnected } = useWallet();
  const { authenticate } = useAuth();

  return (
    <Flex flexDir="column" w="full" pt="4">
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

      {!isConnected ? (
        <Button
          w="min-content"
          py="3"
          px="6"
          color={theme.buttonTextSec}
          backgroundColor={theme.card.statBg}
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
      ) : null}
    </Flex>
  );
};
