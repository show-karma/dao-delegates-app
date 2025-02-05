import { Flex, Text } from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { FC, useState } from 'react';

interface IExpandableText {
  text: string;
  maxChars?: number;
}

export const ExpandableTitle: FC<IExpandableText> = props => {
  const { theme } = useDAO();

  const { text, maxChars = 60 } = props;
  const [isExpanded, setIsExpanded] = useState(false);
  const toggleIsExpanded = () => setIsExpanded(!isExpanded);

  return (
    <Flex flexDir="column" gap="2.5">
      {text.length <= maxChars ? (
        <Text
          maxW="full"
          fontSize="sm"
          fontWeight="medium"
          textAlign="left"
          color={theme.modal.votingHistory.proposal.title}
        >
          {text}
        </Text>
      ) : (
        <Flex flexDir="column" w="full">
          <Text
            w="full"
            maxW="full"
            fontSize="sm"
            fontWeight="medium"
            textAlign="left"
            color={theme.modal.votingHistory.proposal.title}
          >
            {isExpanded ? text : `${text.substring(0, maxChars)}... `}
            {isExpanded && <br />}
            <Text
              onClick={toggleIsExpanded}
              cursor="pointer"
              color={theme.modal.votingHistory.proposal.type}
              w="max-content"
              as="span"
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </Text>
          </Text>
          {/* <Button
            fontSize="sm"
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
          </Button> */}
        </Flex>
      )}
    </Flex>
  );
};
