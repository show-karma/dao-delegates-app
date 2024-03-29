import React from 'react';
import { ImgWithFallback } from 'components';
import { Flex, Text, Icon, Skeleton } from '@chakra-ui/react';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { useGovernanceVotes } from 'contexts';
import { formatNumber } from 'utils';

interface IVotesToDelegate {
  logoUrl?: string;
  daoName: string;
  votes: string;
  hideNoTokens?: boolean;
}

export const VotesToDelegate: React.FC<IVotesToDelegate> = ({
  logoUrl,
  daoName,
  votes,
  hideNoTokens,
}) => {
  const { isLoadingVotes, symbol } = useGovernanceVotes();
  return (
    <Flex alignItems="center">
      <Flex
        flexDirection="row"
        alignItems="center"
        gap="4px"
        paddingX={2}
        paddingY={1}
        borderRadius={5}
        backgroundColor="rgba(217, 217, 217, 0.5)"
      >
        {isLoadingVotes ? (
          <Skeleton height="24px" width="100px" bg="gray.100" />
        ) : (
          <Text
            fontStyle="normal"
            fontWeight="500"
            fontSize="1.15em"
            color="#000000"
          >{`${formatNumber(votes)} ${symbol?.[0]?.value || ''}`}</Text>
        )}
        <ImgWithFallback
          fallback={daoName}
          src={logoUrl}
          boxSize="20px"
          borderRadius="full"
        />
      </Flex>
      {(votes === '0' || !votes) && !hideNoTokens ? (
        <Flex
          background="rgba(244, 171, 104, 0.11)"
          borderRadius="4px"
          color="#ffa552"
          flexDirection="row"
          gap="8px"
          display="flex"
          position="absolute"
          top="12px"
          right="12px"
          padding="8px 12px"
          mr={10}
          alignItems="center"
        >
          <Icon as={IoAlertCircleOutline} boxSize="20px" />
          <Text
            color="#ffa552"
            fontStyle="normal"
            fontWeight={['400', '400', '700']}
            fontSize={['10px', '10px', '12px']}
          >
            No tokens to delegate
          </Text>
        </Flex>
      ) : null}
    </Flex>
  );
};
