import { Flex, Icon, Text, useClipboard } from '@chakra-ui/react';
import { blo } from 'blo';
import { CheckIcon } from 'components/Icons/CheckIcon';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { useToasty } from 'hooks';
import { IoCopy } from 'react-icons/io5';
import { truncateAddress } from 'utils';

export const DelegateBlock = () => {
  const { delegateInfo } = useDelegateCompensation();
  const { theme } = useDAO();
  const { onCopy } = useClipboard(delegateInfo?.publicAddress || '');
  const { toast } = useToasty();

  const handleCopy = () => {
    onCopy();
    toast({
      title: 'Address copied successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <Flex flexDir="row" gap="5" align="center">
      <Flex position="relative">
        <ImgWithFallback
          fallback={delegateInfo?.publicAddress}
          src={
            delegateInfo?.profilePicture || delegateInfo?.publicAddress
              ? blo(delegateInfo?.publicAddress as `0x${string}`)
              : undefined
          }
          boxSize="64px"
          borderRadius="full"
        />
        <CheckIcon
          color={theme.compensation?.card.success}
          boxSize="24px"
          borderRadius="full"
          position="absolute"
          left="52px"
        />
      </Flex>
      <Flex flexDir="column" gap="1" align="flex-start">
        <Text
          color={theme.compensation?.card.text}
          fontWeight={700}
          fontSize="16px"
        >
          {delegateInfo?.name ||
            delegateInfo?.ensName ||
            delegateInfo?.publicAddress}
        </Text>
        <Flex align="center" gap="2">
          <Text
            color={theme.compensation?.card.text}
            fontWeight={400}
            fontSize="14px"
          >
            {truncateAddress(delegateInfo?.publicAddress as string)}
          </Text>
          <Icon
            as={IoCopy}
            color={theme.compensation?.card.text}
            boxSize="4"
            cursor="pointer"
            onClick={handleCopy}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
