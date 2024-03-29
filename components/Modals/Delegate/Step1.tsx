import React from 'react';
import { useDAO } from 'contexts';
import { Flex, Text } from '@chakra-ui/react';
import { IDelegate } from 'types';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { DelegateModalHeader } from './DelegateModalHeader';
import { DelegateModalFooter } from './DelegateModalFooter';
import { DelegateModalBody } from './DelegateModalBody';
import { ModalDelegateButton } from './ModalDelegateButton';
import { VotesToDelegate } from './VotesToDelegate';

interface StepProps {
  handleModal: () => void;
  votes: string;
  delegatedUser: IDelegate;
  walletAddress?: string;
}

export const Step1: React.FC<StepProps> = ({
  handleModal,
  votes,
  delegatedUser,
  walletAddress,
}) => {
  const { daoData } = useDAO();
  if (!daoData) return null;
  const { name: daoName, socialLinks } = daoData;
  const { logoUrl } = socialLinks;

  const modalSpacing = {
    padding: '16px 32px',
  };

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
        <Flex
          flex="1"
          alignItems="center"
          flexWrap="wrap"
          gap="2"
          justifyContent="flex-start"
          margin="0 0 23px 0"
        >
          <Text
            fontStyle="normal"
            fontSize="14px"
            marginRight="3"
            color="black"
          >
            You are delegating
          </Text>
          <Flex
            alignItems="center"
            justifyContent="flex-start"
            gap="2"
            flex="2"
          >
            <VotesToDelegate
              logoUrl={logoUrl}
              daoName={daoName}
              votes={votes}
            />
            <Text fontStyle="normal" fontSize="14px" color="black">
              to
            </Text>
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
                  {delegatedUser.realName ||
                    delegatedUser.ensName ||
                    delegatedUser.address}
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <ModalDelegateButton delegated={delegatedUser.address} votes={votes} />
      </DelegateModalBody>
      <DelegateModalFooter
        flexProps={{ ...modalSpacing }}
        handleModal={handleModal}
        delegateInfo={delegatedUser}
        publicAddress={walletAddress}
      />
    </Flex>
  );
};
