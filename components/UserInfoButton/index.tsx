import { Text } from '@chakra-ui/react';
import { ChakraLink } from 'components/ChakraLink';
import { useDAO } from 'contexts';
import { LINKS } from 'helpers';
import { FC } from 'react';
import { IActiveTab, IDelegate } from 'types';

interface IUserInfoProps {
  onOpen: (profile: IDelegate, tab?: IActiveTab) => void;
  profile: IDelegate;
}

export const UserInfoButton: FC<IUserInfoProps> = ({ onOpen, profile }) => {
  const { theme, rootPathname } = useDAO();

  return (
    <ChakraLink
      href={LINKS.PROFILE(rootPathname, profile.ensName || profile.address)}
      fontSize={['sm', 'md']}
      fontWeight="medium"
      color={theme.buttonTextSec}
      backgroundColor={theme.card.statBg}
      _hover={{
        backgroundColor: theme.card.statBg,
        opacity: 0.8,
      }}
      _active={{}}
      _focus={{}}
      _focusVisible={{}}
      _focusWithin={{}}
      fontFamily="heading"
      gap="6px"
      h="10"
      px="3"
      py="6"
      display="flex"
      alignItems="center"
      justifyContent="center"
      borderRadius="md"
    >
      {/* <HistoryIcon boxSize="17px" /> */}
      <Text h="max-content">Overview</Text>
    </ChakraLink>
  );
};
