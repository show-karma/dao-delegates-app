import { Checkbox, Flex, Link } from '@chakra-ui/react';
import { useDAO, useEditProfile } from 'contexts';
import { FC } from 'react';

// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-md-editor/markdown-editor.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import '@uiw/react-markdown-preview/markdown.css';
// eslint-disable-next-line import/no-extraneous-dependencies
import rehypeSanitize from 'rehype-sanitize';

import dynamic from 'next/dynamic';
// eslint-disable-next-line import/no-extraneous-dependencies
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export const EditStatement: FC = () => {
  const {
    newStatement,
    editStatementText,
    acceptedTerms,
    changeAcceptedTerms,
  } = useEditProfile();
  const newStatementValue = newStatement.value as string;

  const { daoInfo, theme } = useDAO();

  return (
    <Flex flexDir="column" gap="1">
      <Flex
        maxW={{ base: '18rem', sm: 'full', lg: '30rem' }}
        minW={{ base: 'full', sm: '18rem', lg: '30rem' }}
        w="full"
        gap="4"
        flexDir="column"
        flex="1"
        h="full"
        minH={{ base: 'full', sm: '18rem', lg: '16rem' }}
        maxH={{ base: 'full', sm: '18rem', lg: '16rem' }}
      >
        <MDEditor
          value={newStatementValue}
          onChange={value => editStatementText(value || '')}
          height={300}
          preview="edit"
          previewOptions={{
            rehypePlugins: [[rehypeSanitize]],
          }}
          overflow={false}
        />
      </Flex>
      {daoInfo.config.TOS_URL ? (
        <Checkbox
          defaultChecked={acceptedTerms}
          onChange={event => changeAcceptedTerms(event.target.checked)}
          color={theme.modal.statement.sidebar.section}
        >
          I accept the{' '}
          <Link
            href={daoInfo.config.TOS_URL}
            isExternal
            textDecor="underline"
            color={theme.modal.statement.sidebar.section}
          >
            Code of Conduct
          </Link>
          .
        </Checkbox>
      ) : null}
    </Flex>
  );
};

export default EditStatement;
