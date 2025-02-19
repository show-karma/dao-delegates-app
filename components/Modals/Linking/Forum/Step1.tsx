import { Button, Flex, IconButton, Input, Text, Icon } from '@chakra-ui/react';
import { ImgWithFallback } from 'components/ImgWithFallback';
import React from 'react';
import { IoClose } from 'react-icons/io5';
import { ESteps } from './ESteps';

interface IModal {
  handleModal: () => void;
  setStep: React.Dispatch<React.SetStateAction<ESteps>>;
  username: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  daoInfo: {
    name: string;
    logoUrl: string;
  };
}

export const Step1: React.FC<IModal> = ({
  handleModal,
  setStep,
  setUsername,
  username,
  daoInfo,
}) => {
  const nextStep = () => setStep(ESteps.SIGN);

  const sanitizeUsername = (usernameToSanitize: string) =>
    usernameToSanitize.match(/[A-Za-z0-9_]{1,40}$/gim)?.[0];

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value.length) {
      setUsername('');
    }
    const usernameFormatted = sanitizeUsername(event.target.value);
    if (usernameFormatted) {
      setUsername(usernameFormatted?.toLowerCase());
    }
  };
  const { name: daoName, logoUrl } = daoInfo;

  return (
    <Flex
      flexDir="column"
      width="full"
      maxWidth="550px"
      height="max-content"
      backgroundColor="white"
      padding="24px 32px"
      borderRadius="6px"
    >
      <Flex
        flexDir="row"
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        gap="24px"
        width="100%"
      >
        <Text
          fontStyle="normal"
          fontWeight="700"
          fontSize="20px"
          color="#000000"
          width="100%"
        >
          1/3 Enter your forum username
        </Text>
        <IconButton
          bgColor="transparent"
          aria-label="close"
          onClick={handleModal}
          color="gray.500"
        >
          <Icon as={IoClose} boxSize="6" />
        </IconButton>
      </Flex>
      <Flex
        fontWeight="500"
        fontSize="14px"
        lineHeight="17px"
        color="#687785"
        marginBottom="32px"
      >
        To display your forum handle in your delegate profile, link your handle
        to your wallet address.
      </Flex>
      <Flex
        display="flex"
        flexDirection="row"
        background="#ebedf0"
        padding="8px 10px"
        borderRadius="6px"
        justifyContent="space-between"
        position="relative"
        flexWrap="wrap"
        gap="10px"
      >
        <Input
          padding="0 20px"
          background="#ebedf0"
          fontStyle="normal"
          fontWeight="500"
          fontSize="14px"
          lineHeight="17px"
          color="rgba(104, 119, 133, 1)"
          border="none"
          flex="1"
          _placeholder={{
            color: 'rgba(104, 119, 133, 0.58)',
            fontStyle: 'normal',
            fontWeight: '500',
            fontSize: '14px',
            lineHeight: '17px',
          }}
          _active={{
            outline: 'none',
          }}
          _focusVisible={{
            outline: 'none',
          }}
          placeholder="Type your forum username"
          type="text"
          value={username}
          onChange={handleInput}
          onKeyDown={event => event.key === 'Enter' && nextStep()}
        />
        <Flex
          display="flex"
          flexDirection="row"
          alignItems=" center"
          justifyContent="center"
          gap="4px"
          background="rgba(173, 184, 192, 0.24)"
          borderRadius="200px"
          padding="4px 8px 4px 8px"
          width="max-content"
        >
          <ImgWithFallback
            fallback={daoInfo.name}
            src={logoUrl}
            width="22px"
            height="22px"
            borderRadius="1000px"
          />
          <Text
            width="max-content"
            fontStyle="normal"
            fontWeight="500"
            fontSize="14px"
            color="#2d1b33"
          >
            {daoName}
          </Text>
        </Flex>
      </Flex>
      <Button
        fontStyle="normal"
        fontWeight="700"
        fontSize="16px"
        lineHeight="20px"
        color="white"
        background="black"
        width="100%"
        padding="12px 0"
        text-transform="none"
        marginTop="32px"
        type="submit"
        textTransform="none"
        disabled={!username}
        isDisabled={!username}
        _hover={{
          opacity: 0.9,
        }}
        _disabled={{
          opacity: 0.25,
          cursor: 'not-allowed',
        }}
        _active={{}}
        _focus={{}}
        _focusVisible={{}}
        _focusWithin={{}}
        onClick={nextStep}
      >
        Next
      </Button>
    </Flex>
  );
};
