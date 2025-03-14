import { Box, Flex, Heading, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FiInfo } from 'react-icons/fi';
import numbro from 'numbro';

interface CirculatingSupplyCardProps {
  circulatingSupply: number;
  isLoading: boolean;
}

/**
 * Component to display the circulating supply in a card
 */
export const CirculatingSupplyCard: React.FC<CirculatingSupplyCardProps> = ({
  circulatingSupply,
  isLoading,
}) => {
  const { theme } = useDAO();

  // Format the circulating supply with numbro
  const formattedSupply = numbro(circulatingSupply).format({
    average: true,
    mantissa: 2,
    abbreviations: {
      thousand: 'K',
      million: 'M',
      billion: 'B',
    },
  });

  return (
    <Box
      bg={theme.card.background}
      borderRadius="lg"
      p={6}
      boxShadow="md"
      height="100%"
      borderWidth="1px"
      borderColor={theme.card.border}
    >
      <Flex direction="column" height="100%">
        <Flex alignItems="center" mb={4}>
          <Heading size="md" color={theme.title} mr={2}>
            Circulating Supply
          </Heading>
          <Tooltip
            label="Total number of tokens currently in circulation"
            placement="top"
            hasArrow
          >
            <Box color={theme.card.text.secondary} cursor="help">
              <FiInfo />
            </Box>
          </Tooltip>
        </Flex>

        <Flex flex={1} alignItems="center" justifyContent="center">
          {isLoading ? (
            <Skeleton height="60px" width="180px" />
          ) : (
            <Text fontSize="3xl" fontWeight="bold" color={theme.text}>
              {formattedSupply}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}; 