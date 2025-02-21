import { Flex, Text } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { MonthDropdown } from '../../../MonthDropdown';
import { DelegateBlock } from '../Delegates/DelegateBlock';
import { DelegatesDropdown } from '../Delegates/DelegatesDropdown';

export const DelegatePeriod = ({
  delegate = 'dropdown',
  period = true,
  minimumPeriod,
  maximumPeriod,
}: {
  delegate?: 'block' | 'dropdown' | 'none';
  period?: boolean;
  minimumPeriod: Date;
  maximumPeriod: Date;
}) => {
  const { theme } = useDAO();
  const renderDelegate = () => {
    if (delegate === 'block') return <DelegateBlock />;
    if (delegate === 'dropdown')
      return (
        <Flex
          flexDir="row"
          gap={['2', '4']}
          justify="flex-start"
          align="center"
          w="full"
          maxW="max-content"
          flexWrap="wrap"
        >
          <Text
            fontSize="16px"
            fontWeight="600"
            color={theme.compensation?.card.text}
          >
            Delegate
          </Text>
          <DelegatesDropdown />
        </Flex>
      );
    return null;
  };

  return (
    <Flex
      flexDir="row"
      gap={['2', '10']}
      justify="space-between"
      flexWrap="wrap"
      maxW="full"
    >
      {renderDelegate()}
      {period ? (
        <Flex
          flexDir="row"
          gap="4"
          justify="flex-start"
          align="center"
          bg={theme.compensation?.card.bg}
          w="full"
          px="4"
          py="4"
          borderRadius="8px"
          maxW="max-content"
        >
          <Text
            fontSize="16px"
            fontWeight="600"
            color={theme.compensation?.card.text}
          >
            Period
          </Text>
          <MonthDropdown
            minimumPeriod={minimumPeriod}
            maximumPeriod={maximumPeriod}
          />
        </Flex>
      ) : null}
    </Flex>
  );
};
