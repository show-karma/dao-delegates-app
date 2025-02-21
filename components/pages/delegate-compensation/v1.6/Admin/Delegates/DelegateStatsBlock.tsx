import { Box, Flex, Text } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { ReactNode } from 'react';

interface DelegateStatsBlockProps {
  blockName: string;
  totalProposals?: number;
  totalVotedOn?: number;
  formula: string | ReactNode;
  score: number;
}
export const DelegateStatsBlock = ({
  blockName,
  totalProposals,
  totalVotedOn,
  formula,
  score,
}: DelegateStatsBlockProps) => {
  const { theme } = useDAO();

  return (
    <Box bg={theme.card.background} borderRadius="lg" p={4} width="full">
      <Text fontSize="lg" fontWeight="bold" color={theme.text} mb={2}>
        {blockName}
      </Text>
      <Flex direction="column" gap={2}>
        {totalProposals ? (
          <Flex justify="space-between">
            <Text color={theme.text}>Total Proposals:</Text>
            <Text color={theme.text}>{totalProposals}</Text>
          </Flex>
        ) : null}
        {totalVotedOn ? (
          <Flex justify="space-between">
            <Text color={theme.text}>Total voted on:</Text>
            <Text color={theme.text}>{totalVotedOn}</Text>
          </Flex>
        ) : null}
        <Flex justify="space-between">
          <Text color={theme.text}>Formula:</Text>
          <Text color={theme.text}>{formula}</Text>
        </Flex>
        <Flex justify="space-between">
          <Text color={theme.text}>Score:</Text>
          <Text color={theme.text}>{score}</Text>
        </Flex>
      </Flex>
    </Box>
  );
};
