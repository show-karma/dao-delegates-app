import { Input, Text } from '@chakra-ui/react';
import { useDAO, useDelegates, useEditProfile } from 'contexts';
import { FC } from 'react';

interface INameEditableProps {
  name?: string;
}

export const NameEditable: FC<INameEditableProps> = ({ name }) => {
  const { theme } = useDAO();
  const { profileSelected } = useDelegates();
  const { isEditing, editName, newName } = useEditProfile();

  return isEditing ? (
    <Input
      w="full"
      fontFamily="body"
      fontWeight="500"
      fontSize={{ base: 'lg', lg: '2xl' }}
      color={`${theme.modal.header.title}CF`}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
      bg="transparent"
      border="none"
      outline="none"
      _focusVisible={{}}
      placeholder="Enter your name..."
      px="0"
      _placeholder={{
        color: `${theme.modal.header.title}80`,
      }}
      value={newName || ''}
      onChange={event => editName(event.target.value)}
      borderBottomWidth="1px"
      borderBottomStyle="solid"
      borderBottomColor={theme.modal.header.title}
      borderBottomRadius="none"
      autoFocus
    />
  ) : (
    <Text
      fontFamily="body"
      fontWeight="bold"
      fontSize={{ base: 'lg', lg: '2xl' }}
      color={theme.modal.header.title}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      {name || profileSelected?.address}
    </Text>
  );
};
