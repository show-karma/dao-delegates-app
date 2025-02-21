import { Flex, Img, Text } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';

export const DelegatePeriodIndicator = () => {
  const { theme } = useDAO();
  const { delegateInfo, selectedDate } = useDelegateCompensation();
  return (
    <Flex
      flexDirection="column"
      bg={theme.compensation?.card.bg}
      p={4}
      borderRadius="lg"
      boxShadow="sm"
      maxW={['full', 'full', '300px']}
      w="full"
    >
      <Flex align="center" gap={2}>
        <Flex
          justify="center"
          align="center"
          bg="gray.100"
          p={2}
          borderRadius="md"
        >
          <Img src="/icons/delegate-compensation/calendar.png" boxSize="24px" />
        </Flex>
      </Flex>
      <Text fontSize="sm" color={theme.compensation?.card.text}>
        {delegateInfo?.name ||
          delegateInfo?.ensName ||
          delegateInfo?.publicAddress}{' '}
        stats for
      </Text>
      <Text fontSize="2xl" fontWeight="bold" mt={1}>
        {selectedDate?.name} <br /> {selectedDate?.value.year}
      </Text>
    </Flex>
  );
};
