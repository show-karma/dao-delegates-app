import { Button, ButtonProps, Flex } from '@chakra-ui/react';
import { ChakraLink } from 'components/ChakraLink';
import { useDAO, useDelegates, useWallet } from 'contexts';
import { useDelegation, useMixpanel, useToasty, useRariConfig } from 'hooks';
import { FC, useEffect, useState } from 'react';
import { convertHexToRGBA } from 'utils';
import { useAccount, useSwitchNetwork } from 'wagmi';

interface IDelegateButton extends ButtonProps {
  delegated: string;
  text?: string;
  successEmitter?: () => void;
  beforeOnClick?: () => void;
  shouldBlockModal?: boolean;
}

export const DelegateButton: FC<IDelegateButton> = ({
  delegated,
  text = 'Delegate',
  successEmitter,
  beforeOnClick,
  shouldBlockModal,
  ...props
}) => {
  const { toast } = useToasty();
  const { openConnectModal, chain, connectIsOpen } = useWallet();
  const { isConnected } = useAccount();
  const { daoInfo, theme } = useDAO();
  const { config } = daoInfo;
  const { mixpanel } = useMixpanel();
  const { delegateOnToggle, delegateIsOpen } = useWallet();
  const { delegatePoolList } = useDelegates();

  // Check if this is RARI DAO with custom delegation
  const { hasCustomDelegation, isRariDAO } = useRariConfig();

  const [writeAfterAction, setWriteAfterAction] = useState(false);

  // Only use delegation hook if NOT using RARI custom delegation
  const shouldUseStandardDelegation = !(hasCustomDelegation && isRariDAO);

  const standardDelegation = useDelegation({
    delegatee: shouldUseStandardDelegation ? delegated : '',
    onSuccessFunction: shouldUseStandardDelegation ? successEmitter : undefined,
  });

  // Use either the real delegation hook or mock values for RARI
  const { isLoading, write } = shouldUseStandardDelegation
    ? standardDelegation
    : { isLoading: false, write: undefined };

  const sameNetwork = !!config.DAO_CHAINS.find(
    chainToSearch => chainToSearch.id === chain?.id
  )?.id;

  useEffect(() => {
    if (isConnected && writeAfterAction && sameNetwork && !connectIsOpen) {
      setWriteAfterAction(false);
      delegateOnToggle();
    }
  }, [isConnected && writeAfterAction && sameNetwork && !connectIsOpen]);

  const { switchNetwork } = useSwitchNetwork({
    chainId: config.DAO_CHAINS[0].id,
  });

  const handleCase = () => {
    if (
      config.ALLOW_BULK_DELEGATE &&
      config.BULK_DELEGATE_MAXSIZE &&
      delegatePoolList.length > config.BULK_DELEGATE_MAXSIZE
    ) {
      toast({
        title: 'Too many delegates',
        description: `You can only delegate to ${config.BULK_DELEGATE_MAXSIZE} user at a time.`,
        status: 'error',
      });
      return;
    }

    mixpanel.reportEvent({
      event: 'delegateButtonClick',
    });

    // Call beforeOnClick (which opens RARI modal for RARI DAO)
    beforeOnClick?.();

    // If this is RARI with custom delegation, stop here - let the modal handle it
    if (hasCustomDelegation && isRariDAO) {
      return;
    }

    // Continue with standard delegation logic for non-RARI DAOs
    if (config.DAO_DELEGATE_ACTION) {
      config.DAO_DELEGATE_ACTION();
    } else if (!isConnected) {
      setWriteAfterAction(true);
      openConnectModal?.();
    } else if (chain && !sameNetwork) {
      setWriteAfterAction(true);
      switchNetwork?.();
    } else if (!delegateIsOpen && !shouldBlockModal) {
      delegateOnToggle();
    } else {
      write?.();
    }
  };

  if (config.DAO_DELEGATION_URL) {
    // return(
    //   <Button
    //   background={theme.branding}
    //   px={{ base: '3', sm: '4', md: '6' }}
    //   py={['6']}
    //   h="10"
    //   fontSize={['sm', 'md']}
    //   fontWeight="medium"
    //   // onClick={handleCase}
    //   _hover={{
    //     backgroundColor: convertHexToRGBA(theme.branding, 0.8),
    //   }}
    //   _focus={{}}
    //   _active={{}}
    //   disabled={isLoading}
    //   color={theme.buttonText}
    //   isLoading={isLoading}
    //   {...props}
    // >
    //   <Flex gap="2">{text}</Flex>
    // </Button>
    // )
    return (
      <Flex
        {...(theme.brandingImageColor && {
          style: {
            backgroundImage: theme.brandingImageColor,
            padding: '2px',
            borderRadius: '6px',
          },
        })}
      >
        <ChakraLink
          background={theme.branding}
          px={{ base: '3', sm: '4', md: '6' }}
          py={theme.brandingImageColor ? '22px' : '6'}
          h="10"
          fontSize={['sm', 'md']}
          fontWeight="medium"
          _hover={{
            backgroundColor: convertHexToRGBA(theme.branding, 0.8),
          }}
          _focus={{}}
          _active={{}}
          disabled={isLoading}
          color={theme.buttonText}
          isLoading={isLoading}
          href={config.DAO_DELEGATION_URL}
          isExternal
          rounded="md"
          alignItems="center"
          justifyContent="center"
          display="flex"
          w="full"
          maxW="max-content"
          {...(props as any)}
        >
          <Flex gap="2">{text}</Flex>
        </ChakraLink>
      </Flex>
    );
  }

  return config.DAO_DELEGATE_CONTRACT || config.ALLOW_BULK_DELEGATE ? (
    <Flex
      {...(theme.brandingImageColor && {
        style: {
          backgroundImage: theme.brandingImageColor,
          padding: '2px',
          borderRadius: '6px',
        },
      })}
    >
      <Button
        background={theme.branding}
        px={{ base: '3', sm: '4', md: '6' }}
        py={theme.brandingImageColor ? '22px' : '6'}
        h="10"
        fontSize={['sm', 'md']}
        fontWeight="medium"
        onClick={handleCase}
        _hover={{
          backgroundColor: convertHexToRGBA(theme.branding, 0.8),
        }}
        _focus={{}}
        _active={{}}
        disabled={isLoading}
        color={theme.buttonText}
        isLoading={isLoading}
        {...props}
      >
        <Flex gap="2">{text}</Flex>
      </Button>
    </Flex>
  ) : null;
};
