import { Flex, Text } from '@chakra-ui/react';
import { ChakraLink } from 'components/ChakraLink';
import { useDAO } from 'contexts';
import { LINKS } from 'helpers';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { removeHtmlTagWithRegex } from 'utils';

// eslint-disable-next-line import/no-extraneous-dependencies
const MDPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
});
interface IExpandableText {
  text: string;
  maxChars?: number;
  isExpanded: boolean;
  toggleIsExpanded: () => void;
  color?: string;
  address: string;
}

export const ExpandableCardText: FC<IExpandableText> = props => {
  const { theme, rootPathname } = useDAO();

  const {
    text,
    maxChars = 78,
    isExpanded,
    toggleIsExpanded,
    color,
    address,
  } = props;

  const formattedText = removeHtmlTagWithRegex(text.replaceAll(/\s/g, ' '));

  return (
    <Flex flexDir="column" gap="2.5" h="full">
      {formattedText.length <= maxChars ? (
        <Flex
          maxW="full"
          fontSize="sm"
          fontWeight="medium"
          textAlign="left"
          color={theme.text}
          dangerouslySetInnerHTML={{ __html: text as string }}
          wordBreak="break-word"
        />
      ) : (
        <Flex flexDir="column" w="full">
          <Flex
            flexDir="column"
            w="full"
            sx={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: '2',
            }}
            textOverflow="ellipsis"
            overflow="hidden"
            maxH="max-content"
          >
            <Text
              maxW="full"
              fontSize="sm"
              fontWeight="normal"
              textAlign="left"
              color={theme.text}
              onClick={isExpanded ? toggleIsExpanded : undefined}
              _hover={{
                cursor: isExpanded ? 'pointer' : 'unset',
                opacity: isExpanded ? 0.9 : 'unset',
              }}
              flex="1"
              wordBreak="break-word"
            >
              <MDPreview
                source={(formattedText as string) || ''}
                style={{
                  backgroundColor: 'transparent',
                  color: color || theme.modal.statement.text,
                }}
              />
            </Text>
          </Flex>
          <ChakraLink
            href={LINKS.PROFILE(rootPathname, address)}
            color={theme.card.text.primary}
            isExternal
            w="max-content"
            as="span"
            fontWeight="bold"
            _hover={{
              textDecoration: 'underline',
              cursor: 'pointer',
            }}
          >
            view statement
          </ChakraLink>
        </Flex>
      )}
    </Flex>
  );
};
