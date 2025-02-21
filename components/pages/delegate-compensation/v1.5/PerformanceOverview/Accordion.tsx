import { Button, Flex, Icon, Image, Text } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useState } from 'react';
import { BiChevronDown, BiChevronRight } from 'react-icons/bi';
import { ScoringSystemCarousel } from '../../../../Carousels';
import { scoringStats } from './helper';

export const ScoringSystemAccordion = () => {
  const { theme } = useDAO();
  const stats = scoringStats.map((scoringStat, index) => ({
    id: scoringStat.title,
    component: (
      <Flex
        key={scoringStat.title}
        p="3"
        style={{
          border: `1px solid ${theme.compensation?.card.divider}`,
        }}
        borderRadius="8px"
        h="full"
        w="full"
        mx="0.5"
      >
        <Flex flexDir="column" gap="4" w="full">
          <Flex
            alignItems={['flex-start']}
            flexDir={['row']}
            justifyContent="space-between"
            gap="4"
          >
            <Image
              alt={scoringStat.title}
              src={scoringStat.iconUrl}
              width="40px"
              height="40px"
              style={{
                minWidth: '40px',
                minHeight: '40px',
                width: '40px',
                height: '40px',
                maxWidth: '40px',
                maxHeight: '40px',
              }}
            />
            {scoringStat.weight ? (
              <Flex
                flexDir="row"
                gap="2"
                bg={theme.compensation?.modal.emphasisBg}
                px="2"
                py="1"
                borderRadius="4px"
              >
                <Text
                  fontSize="14px"
                  fontWeight="700"
                  color={theme.compensation?.modal.emphasis}
                >
                  {scoringStat.weight}%
                </Text>
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color={theme.compensation?.modal.emphasis}
                >
                  Weight in Score
                </Text>
              </Flex>
            ) : null}
          </Flex>
          <Flex
            h="full"
            width="full"
            flexDir="column"
            justify="space-between"
            w="full"
            gap="4"
          >
            <Flex flexDir="column" gap="0">
              <Text
                fontSize="16px"
                fontWeight="600"
                color={theme.compensation?.card.text}
              >
                {scoringStat.title}
              </Text>
              <Text
                fontSize="14px"
                fontWeight={400}
                color={theme.compensation?.card.text}
              >
                {scoringStat.description}
              </Text>
            </Flex>
            <Flex
              flexDir="column"
              gap="0"
              bg={theme.compensation?.modal.block}
              borderRadius="8px"
              p="3"
            >
              <Flex flexDir="row" gap="3" alignItems="center">
                <Text
                  fontSize="14px"
                  fontWeight="700"
                  color={theme.compensation?.card.text}
                >
                  How it’s Calculated
                </Text>
              </Flex>
              <Flex flexDir="row" gap="1" alignItems="center">
                <Text
                  fontSize="14px"
                  fontWeight={700}
                  color={theme.compensation?.card.text}
                  w="full"
                  maxW="max-content"
                >
                  {scoringStat.abbreviation} =
                  <Text
                    ml="1"
                    as="span"
                    fontSize="14px"
                    fontWeight={500}
                    color={theme.compensation?.card.text}
                  >
                    {scoringStat.formula}
                  </Text>
                </Text>
              </Flex>
              {scoringStat.updatedIn ? (
                <Text
                  fontSize="12px"
                  fontWeight="700"
                  color={theme.compensation?.modal.emphasis}
                >
                  Updated Formula in {scoringStat.updatedIn}
                </Text>
              ) : null}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    ),
  }));
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Flex
      w="full"
      border="none"
      p="3"
      bg={theme.compensation?.performanceOverview.header.bg.card}
      borderRadius="8px"
      flexDir="column"
      gap="4"
    >
      <Button
        bg="transparent"
        w="full"
        p="0"
        onClick={() => setIsOpen(!isOpen)}
        _hover={{}}
        _focus={{}}
        _focusVisible={{}}
        _focusWithin={{}}
        _active={{}}
      >
        <Flex as="span" w="full" gap="2" align="center" textAlign="left">
          <Flex
            bg={theme.compensation?.performanceOverview.header.bg.scoringSystem}
            borderRadius="4px"
            p="1"
            width="32px"
            height="32px"
            alignItems="center"
            justifyContent="center"
          >
            <Image
              alt="Learn how Scoring System works"
              src="/icons/delegate-compensation/brain.png"
              width="24px"
              height="24px"
            />
          </Flex>
          <Text
            fontSize={{ base: '14px' }}
            fontWeight={600}
            color={theme.compensation?.performanceOverview.header.text}
          >
            Learn how Scoring System works
          </Text>
        </Flex>
        {!isOpen ? (
          <Icon boxSize="18px" as={BiChevronRight} />
        ) : (
          <Icon boxSize="18px" as={BiChevronDown} />
        )}
      </Button>
      {isOpen ? (
        <Flex w="full">
          {stats ? (
            <ScoringSystemCarousel
              controlStyle={{
                marginTop: '24px',
              }}
              items={stats}
            />
          ) : null}
        </Flex>
      ) : null}
    </Flex>
  );
};
