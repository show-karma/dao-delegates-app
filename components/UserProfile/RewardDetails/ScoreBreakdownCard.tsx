import { Flex, Text } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FC } from 'react';
import { formatSimpleNumber } from 'utils';

interface ScoreBreakdownCardProps {
  totalScore?: number;
}

export const ScoreBreakdownCard: FC<ScoreBreakdownCardProps> = ({
  totalScore = 0,
}) => {
  const { theme } = useDAO();

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
      <Text color={theme.title} fontSize="lg" fontWeight="600">
        Score Breakdown: {formatSimpleNumber(totalScore)}
      </Text>
    </Flex>
  );
};
