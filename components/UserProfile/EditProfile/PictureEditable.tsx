import {
  Flex,
  IconButton,
  Icon,
  PopoverTrigger,
  Popover,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Text,
  Input,
  Img,
} from '@chakra-ui/react';
import { useDAO, useDelegates, useEditProfile } from 'contexts';
import { FC } from 'react';
import { AiFillEdit } from 'react-icons/ai';
import { GiCancel } from 'react-icons/gi';

const PopoverImage: FC<{ src?: string }> = ({ src }) => {
  const { theme } = useDAO();
  const { editProfilePicture, newProfilePicture } = useEditProfile();

  const savePreview = (text: string | null) => {
    editProfilePicture(text);
  };

  return (
    <Flex
      w={{ base: '5rem', md: '5.5rem', lg: '8.125rem' }}
      h={{ base: '5rem', md: '5.5rem', lg: '8.125rem' }}
      minW={{ base: '5rem', md: '5.5rem', lg: '8.125rem' }}
      minH={{ base: '5rem', md: '5.5rem', lg: '8.125rem' }}
      maxW={{ base: '5rem', md: '5.5rem', lg: '8.125rem' }}
      maxH={{ base: '5rem', md: '5.5rem', lg: '8.125rem' }}
      display="flex"
      position="relative"
      transition="all 0.2s ease-in-out"
    >
      <Img
        w="full"
        h="full"
        borderRadius="full"
        borderWidth="2px"
        borderStyle="solid"
        borderColor={theme.modal.header.border}
        objectFit="cover"
        src={newProfilePicture || src}
      />

      <Popover>
        <PopoverTrigger>
          <Flex
            opacity="0.5"
            w="full"
            h="full"
            position="absolute"
            bgColor="black"
            borderRadius="full"
            cursor="pointer"
            _hover={{
              opacity: '0.85',
            }}
            align="center"
            justify="center"
            transition="all 0.4s ease-in-out"
          >
            <IconButton
              aria-label="Edit profile button"
              icon={<Icon as={AiFillEdit} />}
              backgroundColor="gray.900"
              borderRadius="full"
            />
          </Flex>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow bg={theme.filters.bg} />
          <PopoverCloseButton />
          <PopoverBody bg={theme.filters.bg}>
            <Text fontSize="md">Paste your new image url</Text>
            <Flex flexDir="row" gap="2" pt="4" pb="2">
              <Input
                px="2"
                color={theme.filters.title}
                bg="transparent"
                fontSize="md"
                placeholder="Image url"
                type="url"
                _placeholder={{
                  color: `${theme.filters.title}90`,
                }}
                value={newProfilePicture || ''}
                onChange={event => savePreview(event.target.value)}
              />
              <IconButton
                aria-label="Cancel image preview button"
                icon={<Icon as={GiCancel} />}
                backgroundColor="gray.900"
                borderRadius="xl"
                onClick={() => savePreview(null)}
                _hover={{
                  opacity: 0.8,
                }}
                _active={{
                  opacity: 0.8,
                }}
                _focus={{
                  opacity: 0.8,
                }}
                _focusVisible={{
                  opacity: 0.8,
                }}
                _focusWithin={{
                  opacity: 0.8,
                }}
              />
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Flex>
  );
};

export const PictureEditable: FC<{ src: string }> = () => {
  const { profileSelected } = useDelegates();
  const { isEditing } = useEditProfile();
  const { newProfilePicture } = useEditProfile();
  const { theme, daoInfo } = useDAO();
  const { config } = daoInfo;

  const picture =
    newProfilePicture === null
      ? `${config.IMAGE_PREFIX_URL}${profileSelected?.address}`
      : profileSelected?.profilePicture ||
        `${config.IMAGE_PREFIX_URL}${profileSelected?.address}`;

  return isEditing ? (
    <PopoverImage src={picture} />
  ) : (
    <Flex
      w={{ base: '3.5rem', lg: '8.125rem' }}
      h={{ base: '3.5rem', lg: '8.125rem' }}
      minW={{ base: '3.5rem', lg: '8.125rem' }}
      minH={{ base: '3.5rem', lg: '8.125rem' }}
      maxW={{ base: '3.5rem', lg: '8.125rem' }}
      maxH={{ base: '3.5rem', lg: '8.125rem' }}
    >
      <Img
        w={{ base: '3.5rem', lg: '8.125rem' }}
        h={{ base: '3.5rem', lg: '8.125rem' }}
        borderRadius="full"
        borderWidth="2px"
        borderStyle="solid"
        borderColor={theme.modal.header.border}
        objectFit="cover"
        src={picture}
      />
    </Flex>
  );
};
