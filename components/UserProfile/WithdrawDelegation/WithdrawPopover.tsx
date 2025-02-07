import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  Text,
  Flex,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';
import { useAuth, useDAO, useDelegates } from 'contexts';
import { KARMA_API } from 'helpers';
import { useToasty } from 'hooks';
import { FC, useState } from 'react';

export const WithdrawPopover: FC = () => {
  const { theme, daoInfo } = useDAO();
  const { config } = daoInfo;
  const { profileSelected } = useDelegates();
  const { authToken } = useAuth();
  const { toast, updateState } = useToasty();
  const { searchProfileModal } = useDelegates();
  const [isLoading, setLoading] = useState(false);

  const { isOpen, onClose, onToggle } = useDisclosure();

  const withdrawDelegation = async () => {
    if (!profileSelected) return;
    try {
      setLoading(true);
      const authorizedAPI = axios.create({
        timeout: 30000,
        baseURL: KARMA_API.base_url,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
      });
      toast({
        title: 'Withdrawing nomination',
        description: 'Please wait...',
        status: 'info',
        duration: 10000,
      });
      await authorizedAPI
        .put(
          `${KARMA_API.base_url}/dao/delegate/status/${config.DAO_KARMA_ID}/${profileSelected.address}`,
          {
            status: 'withdrawn',
          }
        )
        .then(() => {
          onClose();
          updateState({
            title: 'Nomination withdrawn',
            description:
              'You have successfully withdrawn your nomination to be a delegate.',
            status: 'success',
            duration: 5000,
          });
          const addressToOpen = profileSelected.address;
          searchProfileModal(addressToOpen, 'withdraw');
        });
    } catch (error) {
      updateState({
        title: 'Error withdrawing nomination',
        description: 'There was an error withdrawing your nomination.',
        status: 'error',
        duration: 5000,
      });
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popover
      placement="bottom-start"
      isOpen={isOpen}
      arrowSize={24}
      arrowShadowColor="none"
    >
      <PopoverTrigger>
        <Button
          w="max-content"
          px="6"
          py="4"
          borderRadius="base"
          background="transparent"
          color={theme.modal.header.title}
          borderColor={theme.modal.header.divider}
          borderWidth="1px"
          borderStyle="solid"
          my="6"
          _hover={{}}
          _active={{}}
          _focus={{}}
          _focusVisible={{}}
          _focusWithin={{}}
          disabled={profileSelected?.status === 'withdrawn'}
          isDisabled={profileSelected?.status === 'withdrawn'}
          onClick={onToggle}
        >
          Withdraw nomination
        </Button>
      </PopoverTrigger>
      <PopoverContent
        background={theme.modal.background}
        border="1px solid"
        borderColor={theme.modal.header.border}
        maxW="max-content"
        w={{ base: '300px', md: '500px', xl: 'full' }}
        px="5"
        mt="4"
      >
        <PopoverArrow bg={theme.modal.header.border} border="none" />
        <PopoverHeader border="none" pt="4" pb="0" px="0">
          <Text
            color={theme.modal.header.title}
            fontWeight="semibold"
            fontSize={{ base: 'md', lg: 'lg' }}
          >
            Really withdraw your nomination?
          </Text>
        </PopoverHeader>
        <PopoverBody px="0">
          <Text
            fontWeight="normal"
            fontSize={{ base: 'md', lg: 'lg' }}
            mb="5"
            fontFamily="heading"
            wordBreak="break-word"
            color={theme.modal.header.subtitle}
          >
            After withdrawing, token holders will not be able to delegate tokens
            to you through our dashboard.
          </Text>
          <Flex gap="4" flexDir={{ base: 'column', lg: 'row' }} mb="6">
            <Button
              px="6"
              py="4"
              borderRadius="4px"
              fontWeight="semibold"
              fontSize={{ base: 'sm', lg: 'lg' }}
              color="black"
              background="white"
              _hover={{ opacity: 0.8 }}
              _active={{}}
              _focus={{}}
              _focusVisible={{}}
              _focusWithin={{}}
              onClick={withdrawDelegation}
              disabled={profileSelected?.status === 'withdrawn'}
              isDisabled={profileSelected?.status === 'withdrawn'}
              isLoading={isLoading}
              w={{ base: 'full', lg: 'max-content' }}
            >
              Yes I am sure, withdraw nomination
            </Button>
            <Button
              px="6"
              py="4"
              borderRadius="base"
              background="transparent"
              color={theme.modal.header.title}
              borderColor={theme.modal.header.divider}
              borderWidth="1px"
              borderStyle="solid"
              _hover={{ opacity: 0.8 }}
              _active={{}}
              _focus={{}}
              _focusVisible={{}}
              _focusWithin={{}}
              onClick={onClose}
              disabled={isLoading}
              isDisabled={isLoading}
              w={{ base: 'full', lg: 'max-content' }}
            >
              Cancel
            </Button>
          </Flex>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
