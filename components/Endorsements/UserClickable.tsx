import { Text } from '@chakra-ui/react';
import { blo } from 'blo';
import { ChakraLink } from 'components/ChakraLink';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { useDAO } from 'contexts';
import { LINKS } from 'helpers';
import { FC } from 'react';

interface UserClickableProps {
  address: string;
  imageURL?: string;
  nameToShow: string;
}

export const UserClickable: FC<UserClickableProps> = ({
  address,
  imageURL,
  nameToShow,
}) => {
  const { theme, rootPathname } = useDAO();
  return (
    <ChakraLink
      href={LINKS.PROFILE(rootPathname, address, 'endorsements-received')}
      flexDir="row"
      gap="2"
      p="0"
      bg="transparent"
      _hover={{ bg: 'transparent' }}
      _active={{ bg: 'transparent' }}
      _focus={{ bg: 'transparent' }}
      _focusVisible={{ bg: 'transparent' }}
      _focusWithin={{ bg: 'transparent' }}
      maxW={{ base: '120px', md: 'none' }}
      w="100%"
      justifyContent="flex-start"
    >
      <ImgWithFallback
        fallback={address}
        src={imageURL || blo(address as `0x${string}`)}
        boxSize="20px"
        borderRadius="full"
      />
      <Text
        textDecoration="underline"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        overflow="hidden"
        color={theme.text}
        fontSize={{ base: '12px', sm: '14px' }}
        maxW={{ base: '120px', md: 'none' }}
      >
        {nameToShow}
      </Text>
    </ChakraLink>
  );
};
