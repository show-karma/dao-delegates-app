import { Flex, Text, Table, Thead, Tbody, Tr, Th, Td, Link } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FC } from 'react';

// Helper function for pluralization
const pluralize = (word: string, count: number) => {
  return count === 1 ? word : `${word}s`;
};

interface Proposal {
  proposalId: string;
  title: string;
  votedAt: string | null;
  voted: boolean;
}

interface VotingProposalsCardProps {
  proposals: Proposal[];
  totalProposals: number;
  votedOnCount: number;
  votedPct: number; // Participation rate as decimal (e.g., 0.8333 for 83.33%)
  type: 'onChain' | 'offChain';
}

export const VotingProposalsCard: FC<VotingProposalsCardProps> = ({
  proposals,
  totalProposals,
  votedOnCount,
  votedPct,
  type,
}) => {
  const { theme } = useDAO();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTableTitle = () => {
    return type === 'onChain' ? 'Onchain Proposals' : 'Snapshot Proposals';
  };

  const formatParticipationRate = (rate: number) => {
    return Math.round(rate * 100);
  };

  return (
    <Flex
      flexDir="column"
      gap="4"
      p="6"
      borderRadius="md"
      bg={theme.card.background}
      borderWidth="1px"
      borderColor={theme.card.border}
    >
      <Flex
        flexDir={['column', 'row']}
        gap={['1', '4']}
        alignItems={['flex-start', 'center']}
        w="full"
      >
        <Text
          color={theme.title}
          fontSize="lg"
          fontWeight="600"
        >
          {getTableTitle()}
        </Text>
        <Flex flexDir="row" gap="2" alignItems="center" flexWrap="wrap">
          <Text
            fontSize="14px"
            fontWeight={500}
            color={theme.title}
          >
            {totalProposals} Total{' '}
            {pluralize('Proposal', totalProposals)}
            {', '}
            <Text
              as="span"
              fontSize="14px"
              fontWeight={500}
              color={theme.text}
            >
              {votedOnCount} Voted On
            </Text>
          </Text>
          <Text
            fontSize="14px"
            fontWeight={500}
            color={theme.subtitle}
          >
            • Participation Rate - {formatParticipationRate(votedPct)}%
          </Text>
        </Flex>
      </Flex>

      {/* Table */}
      <Table
        variant="simple"
        bg={theme.card.background}
        borderRadius="8px"
        border="1px solid"
        borderColor={theme.card.border}
      >
        <Thead>
          <Tr>
            <Th
              borderColor={theme.card.border}
              color={theme.title}
              textTransform="none"
              fontSize="14px"
              fontWeight="700"
            >
              Proposal Name
            </Th>
            <Th
              borderColor={theme.card.border}
              color={theme.title}
              textTransform="none"
              fontSize="14px"
              fontWeight="700"
            >
              Voted On
            </Th>
          </Tr>
        </Thead>
        <Tbody>
          {proposals.length > 0 ? (
            proposals.map((proposal, index) => (
              <Tr key={proposal.proposalId || index}>
                <Td
                  borderColor={theme.card.border}
                  color={theme.text}
                  fontSize="14px"
                >
                  {proposal.title}
                </Td>
                <Td
                  borderColor={theme.card.border}
                  color={theme.text}
                  fontSize="14px"
                >
                  {formatDate(proposal.votedAt)}
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td 
                colSpan={2} 
                textAlign="center" 
                color={theme.subtitle}
                fontSize="14px"
              >
                No proposals data available
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Flex>
  );
}; 