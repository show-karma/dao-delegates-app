import {
  Button,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
} from '@chakra-ui/react';
import { useDAO, useDelegates } from 'contexts';
import { IoChevronDownOutline } from 'react-icons/io5';

export const WorkstreamFilter = () => {
  const { workstreams, workstreamsFilter, selectWorkstream } = useDelegates();
  const { theme } = useDAO();

  const defaultState = workstreamsFilter.length === 0;

  return (
    <Menu isLazy closeOnSelect={false}>
      <MenuButton
        as={Button}
        rightIcon={<IoChevronDownOutline />}
        borderWidth="1px"
        borderStyle="solid"
        bg={defaultState ? theme.filters.bg : theme.branding}
        color={defaultState ? theme.filters.title : theme.buttonText}
        _hover={{
          opacity: 0.8,
        }}
        _active={{
          opacity: 0.8,
        }}
        borderColor={theme.filters.border}
        boxShadow={theme.filters.shadow}
        borderRadius="sm"
        gap="4"
        fontFamily="heading"
        fontWeight="normal"
        textAlign="left"
        w={{ base: 'full', md: 'max-content' }}
        minW="min-content"
      >
        Workstream
      </MenuButton>
      <MenuList
        bgColor={theme.filters.listBg}
        color={theme.filters.listText}
        h={{ base: 'max-content' }}
        maxH={{ base: '64' }}
        overflowY="auto"
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
            marginX: '4px',
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '8px',
            bgColor: theme.filters.activeBg,
          },
        }}
      >
        <MenuOptionGroup type="checkbox" value={workstreamsFilter}>
          {workstreams.map((option, index) => (
            <MenuItemOption
              key={+index}
              value={option.id.toString()}
              onClick={() => selectWorkstream(index)}
              bgColor="transparent"
              _hover={{
                bg: theme.filters.activeBg,
              }}
            >
              {option.description}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
