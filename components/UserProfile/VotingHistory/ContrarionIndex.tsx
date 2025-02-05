import { Flex, Spinner, Text } from '@chakra-ui/react';
import { InfoIcon } from 'components/Icons';
import { useDAO, useVotes } from 'contexts';
import { FC } from 'react';
import { formatNumberPercentage } from 'utils';

interface IContrarionBoxProps {
  contrarionIndex: number;
}

const ContrarionBox: FC<IContrarionBoxProps> = ({ contrarionIndex }) => {
  const { theme } = useDAO();
  return (
    <Flex
      align="center"
      gap="2"
      bg={theme.modal.votingHistory.proposal.bg}
      px="5"
      py="3"
      w="full"
      borderRadius="md"
      flexDir="column"
    >
      <Flex align="center" flexDir="row" gap="1" justify="flex-start" w="full">
        <Text
          color={theme.modal.votingHistory.proposal.title}
          fontWeight="semibold"
          fontSize="md"
        >
          Contrarian Index:
        </Text>
        <Text
          color={theme.modal.votingHistory.proposal.title}
          fontWeight="semibold"
          fontSize="22px"
        >
          {formatNumberPercentage(contrarionIndex)}
        </Text>
      </Flex>
      <Flex flexDir="row" align="flex-start" gap="2">
        <InfoIcon
          w="4"
          h="4"
          mt="1"
          color={theme.modal.votingHistory.proposal.title}
        />
        <Text
          fontWeight="light"
          fontSize="14px"
          color={`${theme.modal.votingHistory.proposal.title}80`}
        >
          Contrarian index represents the percentage of votes cast against the
          majority.
        </Text>
      </Flex>
    </Flex>
  );
};

export const ContrarionIndexComponent: FC = () => {
  const { theme } = useDAO();
  const {
    isOffChainVoteBreakdownError: isVoteBreakdownError,
    isOffChainVoteBreakdownLoading: isVoteBreakdownLoading,
    offChainVoteBreakdown: voteBreakdown,
  } = useVotes();

  if (isVoteBreakdownLoading) {
    return (
      <Flex w="full" align="center" justify="center" position="relative">
        <Flex
          top="0"
          right="0"
          position="absolute"
          w="100%"
          h="100%"
          align="center"
          justify="center"
        >
          <Spinner
            position="absolute"
            zIndex="10000"
            color={theme.modal.votingHistory.headline}
          />
        </Flex>
        <Flex
          bg="rgba(217, 217, 217, 0.05)"
          w="100%"
          h="100%"
          backdropFilter="blur(15px)"
          position="absolute"
        />
        <ContrarionBox contrarionIndex={1} />
      </Flex>
    );
  }

  if (isVoteBreakdownError || !voteBreakdown) return null;

  // if (isVoteBreakdownError || !voteBreakdown) {
  //   return (
  //     <Flex w="full" align="center" justify="center" position="relative">
  //       <Flex
  //         top="0"
  //         right="0"
  //         position="absolute"
  //         w="100%"
  //         h="100%"
  //         align="center"
  //         justify="center"
  //       >
  //         <Flex
  //           zIndex="10000"
  //           align="center"
  //           justify="center"
  //           flexDir="column"
  //           color={theme.modal.buttons.navText}
  //         >
  //           <InfoIcon w="10" h="10" />
  //           <Text
  //             textAlign="center"
  //             fontWeight="400"
  //             fontSize="14px"
  //             maxW="270px"
  //           >
  //             There is no contrarian index for this contributor yet.
  //           </Text>
  //         </Flex>
  //       </Flex>
  //       <Flex
  //         bg="rgba(217, 217, 217, 0.05)"
  //         w="100%"
  //         h="100%"
  //         backdropFilter="blur(15px)"
  //         position="absolute"
  //       />
  //       <ContrarionBox contrarionIndex={1} />
  //     </Flex>
  //   );
  // }

  const { contrarionIndex } = voteBreakdown;

  return <ContrarionBox contrarionIndex={contrarionIndex} />;
};
