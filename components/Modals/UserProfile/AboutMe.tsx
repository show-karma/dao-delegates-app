import { Flex, Text } from '@chakra-ui/react';
import { FC } from 'react';
import { useDAO } from 'contexts';
import { IProfile } from 'types';

interface ITextSection {
  text?: string;
}
const TextSection: FC<ITextSection> = ({ text }) => {
  const { theme } = useDAO();

  return (
    <Flex maxW="30rem" gap="4" flexDir="column" flex="1">
      {text ? (
        <Text
          color={theme.modal.statement.text}
          fontWeight="light"
          fontSize="md"
          fontFamily="body"
          textAlign="left"
          whiteSpace="pre-line"
        >
          {text}
        </Text>
      ) : (
        <Text
          color={theme.modal.statement.text}
          fontWeight="light"
          fontSize="md"
          fontFamily="body"
          textAlign="left"
          whiteSpace="pre-line"
        >
          {`This user doesn't have an About section yet`}
        </Text>
      )}
    </Flex>
  );
};

interface IStatement {
  profile: IProfile;
}

export const AboutMe: FC<IStatement> = ({ profile }) => (
  <Flex
    mt={{ base: '5', lg: '10' }}
    mb={{ base: '10', lg: '20' }}
    gap={{ base: '2rem', lg: '4rem' }}
    flexDir={{ base: 'column', lg: 'row' }}
    px="0"
  >
    <TextSection text={profile.aboutMe} />
  </Flex>
);
