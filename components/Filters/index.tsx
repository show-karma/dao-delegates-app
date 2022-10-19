import { Flex } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { OrderByFilters } from './OrderByFilters';
import { SearchFilter } from './SearchFilter';

export const Filters = () => {
  const { theme } = useDAO();
  return (
    <Flex
      bgColor={theme.card.background}
      boxShadow={theme.card.shadow}
      w="full"
      flexDir={['row']}
      flexWrap="wrap"
      gap="8"
      align="center"
      p="6"
      borderRadius="xl"
      justify="space-between"
    >
      <SearchFilter />
      <OrderByFilters />
    </Flex>
  );
};
