import { Button, ButtonProps } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FC, ReactNode } from 'react';

interface INavButton extends ButtonProps {
  children: ReactNode;
  isActive: boolean;
}

export const NavButton: FC<INavButton> = ({ children, isActive, ...props }) => {
  const { theme } = useDAO();

  return (
    <Button
      // bg={
      //   isActive ? theme.modal.buttons.navBg : `${theme.modal.buttons.navBg}80`
      // }
      bg="transparent"
      color={
        isActive ? theme.modal.header.title : `${theme.modal.header.title}70`
      }
      borderBottomWidth="2px"
      borderBottomStyle="solid"
      borderBottomColor={isActive ? theme.modal.header.title : 'transparent'}
      borderRadius="0"
      px="5"
      py="4"
      _hover={{
        color: theme.modal.header.hoverText || theme.modal.header.title,
        borderBottomColor:
          theme.modal.header.hoverText || theme.modal.header.title,
      }}
      fontSize={{ base: 'sm', lg: '15px' }}
      _focus={{}}
      _focusWithin={{}}
      _active={{}}
      w="max-content"
      minH="52px"
      minW="122px"
      maxW="max-content"
      {...props}
    >
      {children}
    </Button>
  );
};
