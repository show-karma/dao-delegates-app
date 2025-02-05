import { Button, Flex, Icon, Text } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FC, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface IExpandableText {
  text: string;
  maxChars?: number;
}

export const ExpandableReason: FC<IExpandableText> = props => {
  const { theme } = useDAO();

  const { text, maxChars = 250 } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleIsExpanded = () => setIsExpanded(!isExpanded);

  return (
    <Flex flexDir="column" gap="2.5">
      <Flex flexDir="row" justify="space-between" mr="4">
        <Text
          fontSize="sm"
          fontWeight="medium"
          color={theme.modal.votingHistory.reason.title}
        >
          Reason
        </Text>
        {text.length > maxChars && (
          <Icon
            as={isExpanded ? FaChevronUp : FaChevronDown}
            w="4"
            h="4"
            color={
              isExpanded
                ? theme.modal.votingHistory.reason.title
                : theme.modal.votingHistory.reason.text
            }
          />
        )}
      </Flex>
      {text.length <= maxChars ? (
        <Text
          fontFamily="heading"
          fontWeight="light"
          color={theme.modal.statement.text}
          fontSize="sm"
        >
          {text}
        </Text>
      ) : (
        <Flex flexDir="column" w="full">
          <Text
            fontFamily="heading"
            fontWeight="light"
            color={theme.modal.statement.text}
            fontSize="sm"
          >
            {isExpanded ? text : `${text.substring(0, maxChars)}...`}
          </Text>
          <Flex w="full" flexDir="row-reverse">
            <Button
              onClick={toggleIsExpanded}
              bgColor="transparent"
              fontFamily="body"
              fontWeight="normal"
              px="4"
              py="0"
              _hover={{
                opacity: 0.8,
              }}
              _active={{}}
              _focus={{}}
              _focusVisible={{}}
              _focusWithin={{}}
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </Button>
          </Flex>
        </Flex>
      )}
    </Flex>
  );
};
