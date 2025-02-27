/* eslint-disable no-param-reassign */
import {
  Box,
  Flex,
  Icon,
  Img,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { ChakraLink } from 'components/ChakraLink';
import { StarIcon } from 'components/Icons/Compensation/StarIcon';
import { useAuth, useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { useToasty } from 'hooks';
import { useState } from 'react';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { formatNumber } from 'utils';
import { getProposals } from 'utils/delegate-compensation/getProposals';

export const DelegateFeedback = ({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}) => {
  const { theme, daoInfo, rootPathname } = useDAO();
  const { selectedDate } = useDelegateCompensation();
  const { refreshDelegateInfo, delegateInfo, delegateAddress } =
    useDelegateCompensation();
  const { authToken, isDaoAdmin: isAuthorized } = useAuth();
  const { toast } = useToasty();
  const [feedbackScores, setFeedbackScores] = useState({
    relevance: delegateInfo?.stats?.delegateFeedback?.relevance || 0,
    depthOfAnalysis:
      delegateInfo?.stats?.delegateFeedback?.depthOfAnalysis || 0,
    timing: delegateInfo?.stats?.delegateFeedback?.timing || 0,
    clarityAndCommunication:
      delegateInfo?.stats?.delegateFeedback?.clarityAndCommunication || 0,
    impactOnDecisionMaking:
      delegateInfo?.stats?.delegateFeedback?.impactOnDecisionMaking || 0,
    presenceMultiplier:
      delegateInfo?.stats?.delegateFeedback?.presenceMultiplier || 0,
  });
  const [isSavingFeedback, setIsSavingFeedback] = useState(false);
  const inputTitle = {
    relevance: 'Relevance',
    depthOfAnalysis: 'Depth of Analysis',
    timing: 'Timing',
    clarityAndCommunication: 'Clarity & Communication',
    impactOnDecisionMaking: 'Impact',
    presenceMultiplier: 'Presence Multiplier',
  };
  const inputLabel = {
    relevance:
      'Analyzes whether the delegate’s feedback throughout the month is relevant to the discussion.',
    depthOfAnalysis:
      'It evaluates the depth of analysis provided by the delegate concerning the proposals or discussions. This serves as a metric to assess whether the delegate takes the time to thoroughly meditate on the discussion and demonstrates attention to the details. Key elements include solid arguments, relevant questions, and thorough reasoning.',
    timing:
      'Considers when the delegate provides feedback, rewarding those who provide feedback earlier, as long as they meet the above criteria.',
    clarityAndCommunication:
      'This is a review of the clarity, structured communication, and overall readability of the delegate’s feedback. Clear and well-written feedback is rewarded.',
    impactOnDecisionMaking:
      'While the proposer ultimately decides whether to incorporate feedback, high-quality feedback from a delegate often influences the final proposal that goes to vote. This criterion evaluates whether the delegate’s feedback tends to drive changes in proposals/discussions.',
    presenceMultiplier:
      'This is a more quantitative analysis, intended to reflect the effort of delegates who participate in most discussions. This parameter serves as a multiplier to the score obtained across the previous five criteria. Note that the percentage of participation in monthly discussions could be not linear across all DAO’s discussions. Some proposals may carry more weight in the overall discussions (special cases such as LTIPP/STIP, gaming, treasury, etc.).',
  };

  const { data: proposalsData } = useQuery(
    [
      'delegate-compensation-proposals',
      selectedDate?.value.month,
      selectedDate?.value.year,
    ],
    () =>
      getProposals(
        daoInfo.config.DAO_KARMA_ID,
        selectedDate?.value.month as string | number,
        selectedDate?.value.year as string | number
      ),
    {
      initialData: {
        proposals: [],
        finished: false,
      },
      enabled:
        !!selectedDate?.value.month &&
        !!selectedDate?.value.year &&
        !!daoInfo.config.DAO_KARMA_ID,
      refetchOnWindowFocus: false,
    }
  );

  // const handleSaveFeedback = async () => {
  //   setIsSavingFeedback(true);
  //   try {
  //     const authorizedAPI = axios.create({
  //       timeout: 30000,
  //       baseURL: KARMA_API.base_url,
  //       headers: {
  //         Accept: 'application/json',
  //         'Content-Type': 'application/json',
  //         Authorization: authToken ? `Bearer ${authToken}` : '',
  //       },
  //     });

  //     await authorizedAPI
  //       .put(
  //         API_ROUTES.DELEGATE.CHANGE_INCENTIVE_PROGRAM_STATS(
  //           daoInfo.config.DAO_KARMA_ID,
  //           delegateInfo?.id || ''
  //         ),
  //         {
  //           stats: {
  //             delegateFeedback: {
  //               ...delegateInfo?.stats.delegateFeedback,
  //               ...feedbackScores,
  //             },
  //           },
  //         }
  //       )
  //       .then(() => {
  //         toast({
  //           title: 'Success',
  //           description: 'Delegate feedback saved successfully',
  //         });
  //         refreshDelegateInfo();
  //       });
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setIsSavingFeedback(false);
  //   }
  // };

  const numberInputs = ['presenceMultiplier'];

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
            Delegate Feedback
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
                  {Object.entries(feedbackScores).map(([key, value]) => (
                    <Flex
                      flexDir="row"
                      align="center"
                      justify="space-between"
                      key={key}
                      flex="1"
                      minW="150px"
                      gap="8"
                    >
                      <Flex flexDir="row" align="center" justify="end" gap="2">
                        <Text
                          color={theme.compensation?.card.text}
                          fontWeight="600"
                          fontSize="16px"
                          mb={1}
                        >
                          {inputTitle[key as keyof typeof inputTitle]}
                        </Text>
                        <Tooltip
                          placement="top"
                          label={inputLabel[key as keyof typeof inputLabel]}
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

                      {!numberInputs.includes(key) ? (
                        <Tooltip
                          placement="top"
                          label={`${value}`}
                          hasArrow
                          bgColor={theme.compensation?.card.bg}
                          color={theme.compensation?.card.text}
                        >
                          <Flex flexDir="row" gap="1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                              const starValue = Number(value) - (score - 1);
                              return (
                                <Icon
                                  key={score + key}
                                  color="yellow.400"
                                  opacity={starValue <= 0 ? 0.1 : starValue}
                                  data-key={key}
                                  as={StarIcon}
                                  w="32px"
                                  h="32px"
                                >
                                  {starValue}
                                </Icon>
                              );
                            })}
                          </Flex>
                        </Tooltip>
                      ) : (
                        <Text
                          fontSize="20px"
                          fontWeight={700}
                          color={theme.compensation?.card.secondaryText}
                          lineHeight="32px"
                          minW="60px"
                          minH="32px"
                          textAlign="end"
                          px="1"
                        >
                          {formatNumber(value.toString())}
                        </Text>
                      )}
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
                    <Text
                      fontSize="16px"
                      fontWeight={600}
                      color={theme.compensation?.card.text}
                      textAlign="center"
                    >
                      Delegate
                      <br />
                      Feedback
                    </Text>
                    <Text
                      fontSize="36px"
                      fontWeight={600}
                      color={theme.compensation?.card.secondaryText}
                      w="120px"
                      textAlign="center"
                    >
                      {formatNumber(
                        delegateInfo?.stats?.delegateFeedback?.finalScore || '0'
                      )}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </VStack>
            <Flex
              justifyContent="flex-start"
              w="full"
              gap="4"
              mt="4"
              alignItems="center"
            >
              <ChakraLink
                color={theme.compensation?.card.text}
                href={`${rootPathname}/delegate-compensation/delegate/${delegateAddress}/forum-activity?month=${selectedDate?.name}&year=${selectedDate?.value.year}`}
                isExternal
                bg={theme.compensation?.icons.delegateFeedback}
                borderRadius="8px"
                px="3"
                py="2"
                fontWeight="500"
                _hover={{
                  opacity: 0.7,
                }}
              >
                View forum activity
              </ChakraLink>
            </Flex>
          </Box>
        </ModalBody>
        <ModalFooter bg={theme.compensation?.card.bg} pt="0">
          {proposalsData.finished ? null : (
            <Flex
              flexDir="row"
              gap="2"
              align="flex-start"
              justify="flex-start"
              w="full"
              px="4"
            >
              <Text fontSize="medium" color={theme.compensation?.card.text}>
                ⚠️ These scores are subject to change and not finalized yet.
              </Text>
            </Flex>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
