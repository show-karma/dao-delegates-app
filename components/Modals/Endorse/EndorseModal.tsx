import {
  Button,
  Flex,
  Icon,
  IconButton,
  Modal,
  ModalContent,
  ModalOverlay,
  Text,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { useDAO, useDelegates } from 'contexts';
import { ethers } from 'ethers';
import { api } from 'helpers';
import { useToasty } from 'hooks';
import { FC, useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { IActiveTab } from 'types';
import { attest, getEASChainInfo } from 'utils';
import { useSigner } from 'utils/eas-wagmi-utils';
import { useAccount, useConnect, useSwitchNetwork } from 'wagmi';

interface EndorseModalProps {
  endorsingAddress: string;
  endorsingName: string;
  endorsingImage?: string;
  changeTab: (selectedTab: IActiveTab) => void;
}

export interface GetDaoRes {
  name: string;
  logoUrl: string;
  description: string;
  fullName: string;
  forumTopicURL?: string;
  tokenAddress?: string[];
}

export type DaoProps = Record<string, { name: string; token: string[] }>;

export const EndorseModal: FC<EndorseModalProps> = ({
  endorsingAddress,
  endorsingName,
  endorsingImage,
  changeTab,
}) => {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
  const { changeRefreshEndorsements } = useDelegates();
  const { daoInfo, theme } = useDAO();
  const { config } = daoInfo;
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToasty();
  const { openConnectModal } = useConnectModal();
  const { connector, isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const { switchNetworkAsync } = useSwitchNetwork();
  const [daoTokens, setDaoTokens] = useState<string[]>([]);

  const [reason, setReason] = useState('');

  const signer = useSigner();

  const endorse = async (newChainId?: number) => {
    setIsLoading(true);
    try {
      if (
        !endorsingAddress ||
        endorsingAddress.length !== 42 ||
        !ethers.utils.isAddress(endorsingAddress)
      ) {
        toast({ description: 'Please enter a valid address' });
        return;
      }

      if (!connector) {
        openConnectModal?.();
        return;
      }

      let wallet = await connector.getAccount();
      const walletChainId = (await connector.getChainId()) || -1;

      const { chainId, easContract, schemaId } = getEASChainInfo(
        config.DAO_KARMA_ID
      );
      if (!isConnected) {
        const { account } = await connectAsync({
          chainId,
          connector,
        });
        wallet = account;
      }

      if (wallet && endorsingAddress.toLowerCase() === wallet.toLowerCase()) {
        toast({ description: 'You cannot endorse yourself' });
        return;
      }

      if ((newChainId || walletChainId) !== chainId && switchNetworkAsync) {
        await switchNetworkAsync(chainId);
        return;
      }

      const schema = [
        { type: 'bool', name: 'endorse', value: true },
        { type: 'string', name: 'comment', value: reason },
        {
          type: 'address',
          name: 'tokenAddress',
          value:
            daoTokens.flat()?.[0] ||
            '0x0000000000000000000000000000000000000000',
        },
        {
          type: 'uint24',
          name: 'tokenChainId',
          value: config.DAO_CHAINS[0].id || 1,
        },
      ];

      await attest(
        signer as any,
        schema,
        endorsingAddress,
        schemaId,
        easContract
      );
      toast({
        description: `You successfully endorsed ${endorsingName}.`,
      });
      changeRefreshEndorsements(true);
      onClose();
      changeTab('endorsements-received');
    } catch (error: any) {
      console.log(error);
      if (error.message?.includes('ACTION_REJECTED')) {
        toast({
          title: 'Endorsement failed',
          description: `User rejected the transaction.`,
          status: 'error',
        });
      } else {
        toast({
          title: 'Endorsement failed',
          description: `Transaction failed.`,
          status: 'error',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getDaoList = async () => {
    try {
      setIsLoading(true);

      const {
        data: { data },
      } = await api.get<{ data: { daos: GetDaoRes[] } }>('/dao');

      const daoFound = data.daos.find(
        item => item.name === daoInfo.config.DAO_KARMA_ID
      );
      setDaoTokens(daoFound?.tokenAddress || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDaoList();
  }, []);

  return (
    <>
      <Button
        fontSize="16px"
        fontWeight="600"
        color={theme.buttonTextSec}
        backgroundColor={theme.card.statBg}
        onClick={onOpen}
        py="6"
        _hover={{
          opacity: 0.8,
        }}
      >
        Endorse
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        aria-labelledby="delegate-modal-title"
        aria-describedby="delegate-modal-description"
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxW="max-content">
          <Flex
            flexDir="column"
            width={['340px', '390px', '550px']}
            height="max-content"
            backgroundColor="white"
            borderRadius="6px"
          >
            <Flex
              gap="100px"
              alignItems="center"
              justifyContent="space-between"
              borderBottom="1px solid #dcdcdc"
              marginBottom={5}
            >
              <Flex padding="16px 32px">
                <Text
                  fontStyle="normal"
                  fontWeight="700"
                  fontSize="20px"
                  color="#000000"
                  width="100%"
                >
                  Endorse Delegate
                </Text>
              </Flex>
              <IconButton
                bgColor="transparent"
                aria-label="close"
                onClick={() => onToggle?.()}
                color="gray.500"
                mr={3}
              >
                <Icon as={IoClose} boxSize="6" />
              </IconButton>
            </Flex>
            <Flex
              fontWeight="500"
              fontSize="14px"
              color="#687785"
              flexDir="column"
              padding="16px 32px"
              boxShadow="0px 15px 10px rgba(0, 0, 0, 0.05)"
              paddingBottom={7}
              gap="2"
            >
              <Flex flex="1" alignItems="center" flexWrap="wrap" gap="2">
                <Text fontStyle="normal" fontSize="14px" color="black">
                  You are endorsing
                </Text>
                <Flex
                  alignItems="center"
                  justifyContent="flex-start"
                  gap="4"
                  flex="2"
                >
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
                        fallback={endorsingAddress}
                        src={endorsingImage}
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
                        {endorsingName}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <Text color="black" fontWeight="normal">
                If you believe {endorsingName} will be a good delegate, endorse
                them onchain.
              </Text>
              <Flex flexDir="column" gap="2" mb="6" mt="2">
                <Text color="black">Additional comment</Text>
                <Textarea
                  placeholder=""
                  bg="gray.100"
                  color="black"
                  value={reason}
                  onChange={event => setReason(event.target.value)}
                />
              </Flex>
              <Button
                fontStyle="normal"
                fontSize="16px"
                color="#FFF"
                bg="black"
                boxSizing="border-box"
                borderRadius="6px"
                width="100%"
                padding="12px 0"
                textTransform="none"
                // disabled={isConnected}
                // isDisabled={isConnected}
                isLoading={isLoading}
                _disabled={{
                  border: '2px solid #adb8c0',
                  backgroundColor: '#adb8c0',
                  cursor: 'not-allowed',
                  color: 'white',
                }}
                _hover={{}}
                _active={{}}
                _focus={{}}
                _focusVisible={{}}
                _focusWithin={{}}
                onClick={() => endorse()}
              >
                Endorse
              </Button>
            </Flex>
          </Flex>
        </ModalContent>
      </Modal>
    </>
  );
};
