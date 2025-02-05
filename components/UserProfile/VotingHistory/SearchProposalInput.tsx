import {
  Flex,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { useDAO, useVotes } from 'contexts';
import { FC } from 'react';
import { BiSearch } from 'react-icons/bi';

export const SearchProposalInput: FC = () => {
  const { searchProposal } = useVotes();
  const { theme } = useDAO();
  return (
    <Flex flexDir="column" maxW="170px" flex="1" align="center">
      <InputGroup alignItems="center" display="flex">
        <InputLeftElement pointerEvents="none">
          <Icon as={BiSearch} color={theme.modal.votingHistory.headline} />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Find a proposal"
          w="full"
          bg={`${theme.modal.votingHistory.headline}0D`}
          onChange={event => searchProposal(event.target.value)}
          boxShadow={theme.card.shadow}
          color={theme.modal.votingHistory.headline}
          borderRadius="full"
          _placeholder={{
            color: theme.modal.votingHistory.reason.text,
          }}
          _focusVisible={{
            borderColor: theme.modal.votingHistory.reason.text,
            boxShadow: `0 0 0 0.1px ${theme.modal.votingHistory.reason.text}`,
          }}
          fontSize="sm"
        />
      </InputGroup>
    </Flex>
  );
};
