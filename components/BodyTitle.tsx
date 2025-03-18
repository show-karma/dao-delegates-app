import {
  Button,
  Collapse,
  Flex,
  Icon,
  Link,
  Skeleton,
  Text,
} from '@chakra-ui/react';
import { useDAO, useDelegates } from 'contexts';
import { FC, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { TbExternalLink } from 'react-icons/tb';
import { IDAOTheme } from 'types';
import { formatNumber, getTimeFromNow } from 'utils';
import { DelegationPool } from './DelegationPool';
import { Filters } from './Filters';
import { SortBy } from './Filters/SortBy';

const DelegatesCounter: FC<{
  isLoading: boolean;
  theme: IDAOTheme;
  delegateCount?: number;
}> = ({ isLoading, theme, delegateCount = 0 }) => {
  const { delegates } = useDelegates();
  const { daoData } = useDAO();
  if (isLoading) return <Skeleton w="40" h="6" />;

  return (
    <Flex align="center" w="full" justifyContent="flex-start">
      <Flex flexDir="column">
        <Text
          fontSize="lg"
          color={theme.text}
          w="max-content"
          align="center"
          textAlign="start"
        >
          {formatNumber(delegateCount)} delegate{delegateCount > 1 && 's'}
        </Text>
        {delegates.length > 0 && (
          <Flex
            flexDir="row"
            gap="1"
            justifyContent="end"
            color={{
              base: theme.hat.text.lastUpdated,
              md: theme.hat.text.secondary,
            }}
            fontSize={{ base: 'sm', lg: 'xs' }}
            w="max-content"
          >
            <Text>Last updated</Text>
            {isLoading ? (
              <Skeleton w="16" h="5">
                00 hours ago
              </Skeleton>
            ) : (
              <Text>{getTimeFromNow(daoData?.lastUpdatedAt as unknown as Date)}</Text>
            )}
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export const BodyTitle: FC = () => {
  const { isLoading, delegateCount, delegatePoolList } = useDelegates();
  const { daoInfo, theme } = useDAO();
  const { config } = daoInfo;
  const [showHeaderText, setShowHeaderText] = useState(true);

  const hideHeaderText = () => {
    setShowHeaderText(false);
  };

  const getCustomDescription = () => {
    if (config.DAO_KARMA_ID === 'starknet') {
      return (
        <Text
          color={theme.collapse.text}
          textAlign={{ base: 'start' }}
          fontSize={{ base: 'lg', sm: '2xl' }}
          lineHeight="9"
          fontWeight="600"
          fontFamily="body"
        >
          Starknet delegates play a vital role in decentralizing the upgrade
          process for Starknet mainnet. Delegates vote to approve protocol
          upgrades before they go live on mainnet. Read more about delegate
          responsibilities{' '}
          <Link
            href="https://community.starknet.io/t/delegate-onboarding-announcement/4047"
            isExternal
            textDecor="underline"
          >
            here.
          </Link>
        </Text>
      );
    }
    return (
      <Text
        color={theme.collapse.text}
        textAlign={{ base: 'start' }}
        fontSize={{ base: 'lg', sm: '2xl' }}
        lineHeight="9"
        fontWeight="600"
        fontFamily="body"
      >
        {config.DAO_DESCRIPTION}
      </Text>
    );
  };

  return (
    <Flex
      flexDir="column"
      w={{ base: 'full' }}
      maxW={{ base: '400px', md: '820px', lg: '944px', xl: '1360px' }}
      px={{ base: '4', lg: '0' }}
      zIndex="4"
      py={showHeaderText ? '0' : { base: '0', md: '2rem' }}
      align={{ base: 'center', md: 'flex-start' }}
    >
      <Collapse
        in={showHeaderText}
        style={{
          width: '100%',
          boxShadow: theme.card.shadow,
          marginTop: '1.5rem',
          marginBottom: '1.5rem',
          borderRadius: '0.75rem',
        }}
      >
        <Flex
          align="center"
          justify="space-between"
          flexWrap="wrap"
          w="full"
          position="relative"
          textAlign="start"
          flexDir="row"
          px="4"
          bg={theme.collapse.bg || theme.card.background}
        >
          <Flex
            flexDir="column"
            gap="2"
            w="full"
            maxW={{ base: '100%', lg: '80%' }}
            py="5"
          >
            {getCustomDescription()}
            <Text
              color={theme.collapse.subtext}
              fontSize={{ base: 'md', md: 'xl' }}
              textAlign={{ base: 'start' }}
              fontWeight="light"
              fontFamily="heading"
              pt={{ base: '4', md: '0' }}
              pb={{ base: '8', md: '5px' }}
            >
              {config.DAO_SUBDESCRIPTION}
            </Text>
            <Flex
              alignItems={{ base: 'center' }}
              justifyContent={{ base: 'center', md: 'flex-start' }}
              gap={['4']}
              flexWrap="wrap"
              w="full"
            >
              {config.GOVERNANCE_FORUM && (
                <Link
                  href={config.GOVERNANCE_FORUM}
                  isExternal
                  _hover={{}}
                  w={{ base: 'full', md: 'max-content' }}
                  {...(theme.brandingImageColor && {
                    style: {
                      backgroundImage: theme.brandingImageColor,
                      padding: '2px',
                      borderRadius: '6px',
                    },
                  })}
                >
                  <Button
                    px={{ base: '3', md: '6' }}
                    py={{
                      base: theme.brandingImageColor ? '14px' : '4',
                      md: theme.brandingImageColor ? '22px' : '6',
                    }}
                    justifyContent={{ base: 'space-between', lg: 'center' }}
                    borderRadius="base"
                    borderWidth="1px"
                    borderColor={theme.branding}
                    borderStyle="solid"
                    background={theme.branding}
                    fontSize={{ base: 'sm', md: 'md' }}
                    fontFamily="heading"
                    color={theme.buttonText}
                    _hover={{
                      bgColor: theme.branding,
                      opacity: 0.8,
                    }}
                    _focusVisible={{
                      bgColor: theme.branding,
                      opacity: 0.8,
                    }}
                    _focusWithin={{
                      bgColor: theme.branding,
                      opacity: 0.8,
                    }}
                    _focus={{
                      opacity: 0.8,
                    }}
                    _active={{
                      opacity: 0.8,
                    }}
                    w={{ base: 'full', md: 'max-content' }}
                  >
                    View discussion
                    <Icon
                      as={TbExternalLink}
                      ml="2.5"
                      boxSize={{ base: '4', lg: '4' }}
                    />
                  </Button>
                </Link>
              )}
              <Link
                href={config.DAO_URL}
                isExternal
                _hover={{}}
                w={{ base: 'full', md: 'max-content' }}
              >
                <Button
                  px={{ base: '3', md: '6' }}
                  py={{ base: '4', md: '6' }}
                  color={theme.collapse.text}
                  justifyContent={{ base: 'space-between', lg: 'center' }}
                  borderRadius="base"
                  fontSize={{ base: 'sm', md: 'md' }}
                  fontFamily="heading"
                  background="none"
                  borderWidth="1px"
                  borderColor={theme.stroke || theme.collapse.text}
                  borderStyle="solid"
                  _hover={{
                    opacity: 0.8,
                  }}
                  _focusVisible={{
                    opacity: 0.8,
                  }}
                  _focusWithin={{
                    opacity: 0.8,
                  }}
                  _focus={{
                    opacity: 0.8,
                  }}
                  _active={{
                    opacity: 0.8,
                  }}
                  w={{ base: 'full', md: 'max-content' }}
                >
                  Learn more & Get Involved
                  <Icon
                    as={TbExternalLink}
                    ml="2.5"
                    boxSize={{ base: '4', lg: '4' }}
                  />
                </Button>
              </Link>
            </Flex>
          </Flex>
          <Icon
            as={IoClose}
            w="6"
            h="6"
            color={theme.themeIcon}
            onClick={hideHeaderText}
            position="absolute"
            top={{ base: '3' }}
            right="3"
            cursor="pointer"
          />
        </Flex>
      </Collapse>
      {config.ALLOW_BULK_DELEGATE && delegatePoolList.length ? (
        <DelegationPool />
      ) : undefined}
      <Filters />
      <Flex
        flexDir={{ base: 'column-reverse', md: 'row' }}
        w="full"
        gap="6"
        justify="space-between"
        px="0"
        py="6"
      >
        <DelegatesCounter
          isLoading={isLoading}
          theme={theme}
          delegateCount={delegateCount}
        />
        <SortBy />
      </Flex>
    </Flex>
  );
};
