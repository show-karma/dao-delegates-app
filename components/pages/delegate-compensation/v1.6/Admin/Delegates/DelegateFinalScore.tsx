/* eslint-disable no-param-reassign */
import {
  Box,
  Code,
  Flex,
  Icon,
  Img,
  List,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { formatSimpleNumber } from 'utils';

export const DelegateFinalScoreModal = ({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}) => {
  const { theme } = useDAO();
  const { delegateInfo } = useDelegateCompensation();

  const stats = {
    participationRate: delegateInfo?.stats?.participationRate || 0,
    snapshotVoting: delegateInfo?.stats?.snapshotVoting.score || 0,
    onChainVoting: delegateInfo?.stats?.onChainVoting.score || 0,
    communicatingRationale:
      delegateInfo?.stats?.communicatingRationale.score || 0,
    delegateFeedback: delegateInfo?.stats?.delegateFeedback?.finalScore || 0,
    bonusPoint: delegateInfo?.stats?.bonusPoint || 0,
  };

  const statsLabel = {
    participationRate: 'Participation Rate (PR)',
    snapshotVoting: 'Snapshot Voting (SV)',
    onChainVoting: 'On-Chain Voting (TV)',
    bonusPoint: 'Bonus Point (BP)',
    communicatingRationale: 'Communicating Rationale (CR)',
    delegateFeedback: 'Delegate Feedback (DF)',
  };

  const statsFormula = {
    participationRate: (
      <Flex flexDir="column" py="1" gap="2">
        <Text fontWeight={600}>Participation Rate (PR) - Weight 15</Text>
        <Text fontWeight="normal">
          Percentage of the total participation of the member in votes in the
          last 90 days. Karma pulls the participation activity directly from
          onchain transactions. This parameter will be calculated at the end of
          each month.
        </Text>
        <Code fontWeight="normal">PR90 formula: (PR90 * 15) / 100</Code>
      </Flex>
    ),
    snapshotVoting: (
      <Flex flexDir="column" py="1" gap="2">
        <Text fontWeight={600}>Snapshot Voting (SV) - Weight 20</Text>
        <Text fontWeight="normal">
          Percentage of delegate participation in snapshot voting. This
          parameter is reset at the beginning of each month.
        </Text>
        <List fontWeight="normal">
          <ListItem>
            <b>Tn</b>: Number of total proposals that were sent to snapshots for
            voting in the month.
          </ListItem>
          <ListItem>
            <b>Rn:</b> Number of proposals the delegate voted on in the month.
          </ListItem>
        </List>
        <Code fontWeight="normal">SV formula: (SV(Rn) / SV(Tn)) * 20</Code>
      </Flex>
    ),
    onChainVoting: (
      <Flex flexDir="column" py="1" gap="2">
        <Text fontWeight={600}>Onchain Voting (TV) - Weight 25</Text>
        <Text fontWeight="normal">
          Percentage of delegate participation in onchain voting. This parameter
          is reset at the beginning of each month.
        </Text>
        <List fontWeight="normal">
          <ListItem>
            <b>Tn</b>: Number of total proposals that were sent onchain for
            voting in the month.
          </ListItem>
          <ListItem>
            <b>Rn:</b> Number of proposals the delegate voted onchain in the
            month.
          </ListItem>
        </List>
        <Code fontWeight="normal">TV formula: (TV(Rn) / TV(Tn)) * 25</Code>
      </Flex>
    ),
    bonusPoint: (
      <Flex flexDir="column" py="1" gap="2">
        <Text fontWeight={600}>Bonus Point (BP) - Extra +30% TP</Text>
        <Text fontWeight="normal">
          This parameter is extra. If the delegate makes a significant
          contribution to the DAO, he/she is automatically granted +30% extra
          TP. This parameter is at the discretion of the program administrator.
          This parameter is reset at the beginning of each month
        </Text>
      </Flex>
    ),
    communicatingRationale: (
      <Flex flexDir="column" py="1" gap="2">
        <Text fontWeight={600}>Communication Rationale (CR) - Weight 10</Text>
        <Text fontWeight="normal">
          Percentage of communication threads with the justification of the
          delegate’s vote on the proposals sent to snapshots and onchain (if
          necessary if the vote does not change). This parameter is reset at the
          beginning of each month.
        </Text>
        <List fontWeight="normal">
          <ListItem>
            <b>Tn</b>: Total number of proposals that were submitted to a vote.
          </ListItem>
          <ListItem>
            <b>Rn:</b> Number of real communication rational threads where the
            delegate communicated and justified his/her decision.
          </ListItem>
        </List>
        <Code fontWeight="normal">CR formula: (CR(Rn) / CR(Tn)) * 10</Code>
      </Flex>
    ),
    delegateFeedback: (
      <Flex flexDir="column" py="1" gap="2">
        <Text fontWeight={600}>Delegates Feedback (DF) - Weight 40</Text>
        <Text fontWeight="normal">
          This is the score given by the program administrator regarding the
          feedback provided by the delegate during the month. Since version
          v1.5, we use a rubric with a scoring system detailed.
        </Text>

        <Code fontWeight="normal">
          DF formula: (Σ qualitative criteria) / 20 * 100 * Presence in
          discussions multiplier * 40 (DF weight)
        </Code>
      </Flex>
    ),
  };

  return (
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
      <ModalOverlay />
      <ModalContent rounded="4px" w="full" maxW="860px">
        <ModalHeader
          bg={theme.compensation?.card.bg}
          textColor={theme.compensation?.card.text}
          rounded="4px"
        >
          <Text
            fontSize="lg"
            textAlign="center"
            fontWeight="bold"
            color={theme.compensation?.card.text}
          >
            Final Score
          </Text>
        </ModalHeader>
        <ModalCloseButton textColor={theme.compensation?.card.text} />
        <ModalBody
          bg={theme.compensation?.card.bg}
          textColor={theme.compensation?.card.text}
          maxH="80vh"
          overflowY="auto"
          rounded="4px"
          px="10"
          py="8"
        >
          <Box bg={theme.card.background} borderRadius="lg" p={4} width="full">
            <VStack spacing={4} align="stretch">
              <Flex
                flexDir="row"
                gap="8"
                align="center"
                justify="center"
                h="100%"
                flex="1"
              >
                <Flex flexDir="column" gap={2} wrap="wrap">
                  {Object.entries(stats).map(([key, value]) => (
                    <Flex
                      flexDir="row"
                      align="center"
                      justify="space-between"
                      key={key}
                      flex="1"
                      minW="150px"
                      gap="8"
                    >
                      <Flex flexDir="row" align="center" gap="2">
                        <Text
                          color={theme.compensation?.card.text}
                          fontWeight="600"
                          fontSize="16px"
                          mb={1}
                        >
                          {statsLabel[key as keyof typeof statsLabel]}
                        </Text>
                        <Tooltip
                          placement="top"
                          label={statsFormula[key as keyof typeof statsFormula]}
                          hasArrow
                          bgColor={theme.compensation?.card.bg}
                          color={theme.compensation?.card.text}
                          fontWeight="normal"
                          fontSize="sm"
                          borderRadius={10}
                          p="3"
                        >
                          <Text as="span">
                            <Icon
                              boxSize="12px"
                              as={BsFillInfoCircleFill}
                              cursor="help"
                            />
                          </Text>
                        </Tooltip>
                      </Flex>

                      <Text
                        fontSize="20px"
                        fontWeight={700}
                        color={theme.compensation?.card.secondaryText}
                        lineHeight="32px"
                        minW="60px"
                        minH="32px"
                        bg={theme.compensation?.bg}
                        textAlign="end"
                        px="1"
                      >
                        {formatSimpleNumber(value) || '0'}
                      </Text>
                    </Flex>
                  ))}
                </Flex>
                <Flex
                  flexDir="column"
                  gap="3"
                  justify="center"
                  align="center"
                  borderRadius="8px"
                  bg={theme.compensation?.icons.delegateFeedback}
                  maxH="330px"
                  h="full"
                  minH="full"
                  px="32px"
                  py="72px"
                  flex="1"
                >
                  <Img
                    src="/icons/delegate-compensation/delegateFeedback.png"
                    w="40px"
                    h="40px"
                  />
                  <Flex
                    flexDir="column"
                    gap="0"
                    align="center"
                    justify="center"
                  >
                    <Flex flexDir="row" gap="1" align="center" justify="center">
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        color={theme.compensation?.card.text}
                        textAlign="center"
                      >
                        Final Score
                      </Text>
                      <Tooltip
                        placement="top"
                        label={
                          <Flex flexDir="column" py="1" gap="2">
                            <Text fontWeight={600}>
                              Total Participation (TP)
                            </Text>
                            <Text fontWeight="normal">
                              Sum of the results of activities performed by the
                              delegate. A TP% of 100 indicates full
                              participation.
                            </Text>

                            <Code fontWeight="normal">
                              TP% formula: PR + SV + TV + CR + DF + BP
                            </Code>
                          </Flex>
                        }
                        hasArrow
                        bgColor={theme.compensation?.card.bg}
                        color={theme.compensation?.card.text}
                        fontWeight="normal"
                        fontSize="sm"
                        borderRadius={10}
                        p="3"
                      >
                        <Text as="span">
                          <Icon
                            boxSize="12px"
                            as={BsFillInfoCircleFill}
                            cursor="help"
                          />
                        </Text>
                      </Tooltip>
                    </Flex>
                    <Text
                      fontSize="36px"
                      fontWeight={600}
                      color={theme.compensation?.card.secondaryText}
                      w="120px"
                      textAlign="center"
                    >
                      {formatSimpleNumber(
                        delegateInfo?.stats?.totalParticipation || 0
                      ) || '0'}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </VStack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
