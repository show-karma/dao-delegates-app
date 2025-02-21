import { Flex, Text } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FC, useState } from 'react';

interface IExpandableText {
  text: string;
  maxChars?: number;
}

export const Expandable: FC<IExpandableText> = props => {
  const { theme } = useDAO();

  const { text, maxChars = 48 } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleIsExpanded = () => setIsExpanded(!isExpanded);

  return (
    <Flex flexDir="column" gap="2.5">
      {text.length <= maxChars ? (
        <Text color={theme.text} lineHeight="14px">
          {text}
        </Text>
      ) : (
        <Flex flexDir="column" w="full">
          <Text
            fontSize="base"
            fontWeight="medium"
            textAlign="left"
            color={theme.text}
            lineHeight="14px"
          >
            {isExpanded ? text : `${text.substring(0, maxChars)}... `}
            {isExpanded && <br />}
          </Text>
          <Text
            onClick={toggleIsExpanded}
            cursor="pointer"
            color={theme.compensation?.card.link}
            w="max-content"
            as="span"
            mt="12px"
          >
            {isExpanded ? 'Read Less' : 'Read More'}
          </Text>
        </Flex>
      )}
    </Flex>
  );
};
