/* eslint-disable no-nested-ternary */
import {
  Button,
  Flex,
  Skeleton,
  SkeletonText,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { useDAO, useEditProfile } from 'contexts';
import dynamic from 'next/dynamic';
import { FC, useEffect, useState } from 'react';
import { ICustomFields } from 'types';
import { convertHexToRGBA } from 'utils';
import { Sidebar } from '../Modals/Sidebar';
import { NoStatement } from './NoStatement';
import { SelectSavingMethod } from './SelectSavingMethod';

// eslint-disable-next-line import/no-extraneous-dependencies
const MDPreview = dynamic(() => import('@uiw/react-markdown-preview'), {
  ssr: false,
});
interface ITextSection {
  statement?: ICustomFields;
}
const TextSection: FC<ITextSection> = ({ statement }) => {
  const { theme } = useDAO();

  return (
    <Flex
      maxW={{ base: 'full' }}
      gap="4"
      flexDir="column"
      flex="1"
      w="full"
      borderBottomRadius="md"
    >
      {statement && statement.value && (
        <Flex
          color={theme.modal.statement.text}
          fontWeight="light"
          fontSize="md"
          fontFamily="body"
          textAlign="left"
          whiteSpace="pre-line"
          flexDir="column"
          wordBreak="break-word"
          listStyleType="none"
          maxW={{ base: 'full' }}
          sx={{
            ol: {
              marginLeft: '32px',
            },
            // eslint-disable-next-line id-length
            a: {
              color: 'blue.400',
            },
            li: {
              marginLeft: '24px',
            },
            pre: {
              maxWidth: '30rem',
              wordWrap: 'break-word',
              whiteSpace: 'pre-line',
            },
          }}
        >
          <MDPreview
            source={(statement.value as string) || ''}
            style={{
              backgroundColor: 'transparent',
              color: theme.modal.statement.text,
            }}
          />
          {/* {htmlFrom(statement.value)} */}
        </Flex>
      )}
    </Flex>
  );
};

interface IStatementCases {
  isLoading: boolean;
  isEditing: boolean;
  statement?: ICustomFields;
}

const EditStatement = dynamic(() => import('./EditStatement'), { ssr: false });

const StatementCases: FC<IStatementCases> = ({
  isEditing,
  isLoading,
  statement,
}) => {
  if (isLoading) return <SkeletonText w="full" noOfLines={4} spacing="4" />;
  if (isEditing) return <EditStatement />;
  if (!statement || !statement?.value.length) return <NoStatement />;
  return <TextSection statement={statement} />;
};

export const Statement: FC = () => {
  const { theme } = useDAO();
  const {
    isEditing,
    statement,
    interests,
    isLoadingStatement,
    isEditSaving,
    saveEdit,
  } = useEditProfile();

  const { daoInfo } = useDAO();

  const {
    ENABLE_ONCHAIN_REGISTRY,
    DELEGATE_REGISTRY_CONTRACT,
    DAO_TOKEN_CONTRACT,
  } = daoInfo.config;

  const [savingStep, setSavingStep] = useState<0 | 1>(0);

  useEffect(() => {
    if (!isEditing) setSavingStep(0);
  }, [isEditing]);

  const handleSubmit = (method: 'on-chain' | 'off-chain' | null) => {
    if (method !== 'on-chain') {
      saveEdit();
    }
  };

  const handleOnClick = () => {
    if (
      ENABLE_ONCHAIN_REGISTRY &&
      DELEGATE_REGISTRY_CONTRACT &&
      DAO_TOKEN_CONTRACT
    ) {
      setSavingStep(1);
    } else {
      handleSubmit('off-chain');
    }
  };

  return (
    <Flex flexDir="column" gap="1" mb="10" w="full" flex="2">
      {isEditing && (
        <Flex flexDir="column" gap="1.5" mb={{ base: '5', lg: '5' }}>
          <Text
            fontSize={{ base: 'xl', lg: '2xl' }}
            fontWeight="medium"
            color={theme.modal.statement.sidebar.section}
          >
            Statement
          </Text>
          <Flex w="full" flexWrap="wrap">
            <Flex maxW={['100%', '100%', '50%']} gap="10">
              <Text
                fontSize={{ base: 'md', lg: 'lg' }}
                fontWeight="normal"
                color={theme.modal.statement.sidebar.item.border}
              >
                Add a statement explaining your intention for becoming a
                delegate and your skillset. This will help token holders
                determine if you are the right candidate to delegate their
                tokens to.
              </Text>
            </Flex>
            {savingStep === 0 && (
              <Flex
                justifyContent="center"
                mb={12}
                w="full"
                maxW={['100%', '100%', '50%']}
                mt={['5', '5', '0']}
              >
                <Flex
                  {...(theme.brandingImageColor && {
                    style: {
                      backgroundImage: theme.brandingImageColor,
                      padding: '2px',
                      borderRadius: '6px',
                    },
                  })}
                  h="max-content"
                >
                  <Button
                    background={theme.branding}
                    px={['4', '6']}
                    py={['3', '3']}
                    h="10"
                    fontSize={['md']}
                    fontWeight="medium"
                    onClick={handleOnClick}
                    _hover={{
                      backgroundColor: convertHexToRGBA(theme.branding, 0.8),
                    }}
                    _focus={{}}
                    _active={{}}
                    isDisabled={isEditSaving}
                    color={theme.buttonText}
                  >
                    <Flex gap="2" align="center">
                      {isEditSaving && <Spinner size="sm" color="white" />}
                      Save profile
                    </Flex>
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
      <Flex
        mb={{ base: '10', lg: '20' }}
        gap={{ base: '2rem' }}
        flexDir={{ base: 'column', lg: 'row-reverse' }}
        px="0"
        w="full"
      >
        {isLoadingStatement ? (
          <Flex flexDir="column" w="full" maxW="40" gap="10">
            <Skeleton w="full" h="10" />
            <Skeleton w="full" h="10" />
          </Flex>
        ) : savingStep === 1 && isEditing ? (
          <SelectSavingMethod
            isLoading={isEditSaving}
            onCancel={() => setSavingStep(0)}
            onSubmit={handleSubmit}
          />
        ) : (
          <Sidebar isEditMode={isEditing} interests={interests} />
        )}
        <Flex flex="2">
          <StatementCases
            isEditing={isEditing}
            isLoading={isLoadingStatement}
            statement={statement}
          />
        </Flex>
      </Flex>
    </Flex>
  );
};
