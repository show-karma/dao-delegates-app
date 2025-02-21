/* eslint-disable no-param-reassign */
import {
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { scoringStats } from './helper';

export const ScoringSystemModal = ({
  isModalOpen,
  setIsModalOpen,
}: {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}) => {
  const { theme } = useDAO();

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
            fontSize="30px"
            textAlign="center"
            fontWeight="700"
            color={theme.compensation?.card.text}
          >
            How our Scoring System Works
          </Text>
        </ModalHeader>
        <ModalCloseButton textColor={theme.compensation?.card.text} />
        <ModalBody
          bg={theme.compensation?.card.bg}
          textColor={theme.compensation?.card.text}
          maxH="80vh"
          overflowY="auto"
          rounded="4px"
          px="8"
          py="8"
        >
          <Flex
            bg={theme.card.background}
            width="full"
            flexDir="column"
            borderRadius="8px"
            border="1px solid"
            borderColor={theme.compensation?.card.divider}
          >
            {scoringStats.map((scoringStat, index) => (
              <Flex
                key={scoringStat.title}
                style={{
                  borderTop:
                    index !== 0
                      ? `1px solid ${theme.compensation?.card.divider}`
                      : 'none',
                }}
                p="3"
              >
                <Flex flexDir="column" gap="4" flex="1">
                  <Flex
                    alignItems={['flex-start', 'center']}
                    flexDir={['column', 'row']}
                    justifyContent="space-between"
                    gap="4"
                  >
                    <Flex gap="2" alignItems="center" flexDir={['row']}>
                      <Image
                        alt={scoringStat.title}
                        src={scoringStat.iconUrl}
                        width="40px"
                        height="40px"
                        style={{
                          minWidth: '40px',
                          minHeight: '40px',
                          width: '40px',
                          height: '40px',
                          maxWidth: '40px',
                          maxHeight: '40px',
                        }}
                      />
                      <Text
                        fontSize="16px"
                        fontWeight="600"
                        color={theme.compensation?.card.text}
                      >
                        {scoringStat.title}
                      </Text>
                    </Flex>
                    {scoringStat.weight ? (
                      <Flex
                        flexDir="row"
                        gap="2"
                        bg={theme.compensation?.modal.emphasisBg}
                        px="2"
                        py="1"
                        borderRadius="4px"
                      >
                        <Text
                          fontSize="14px"
                          fontWeight="700"
                          color={theme.compensation?.modal.emphasis}
                        >
                          {scoringStat.weight}%
                        </Text>
                        <Text
                          fontSize="14px"
                          fontWeight="500"
                          color={theme.compensation?.modal.emphasis}
                        >
                          Weight in Score
                        </Text>
                      </Flex>
                    ) : null}
                  </Flex>
                  <Text
                    fontSize="14px"
                    fontWeight={400}
                    color={theme.compensation?.card.text}
                  >
                    {scoringStat.description}
                  </Text>
                  <Flex
                    flexDir="column"
                    gap="0"
                    bg={theme.compensation?.modal.block}
                    borderRadius="8px"
                    p="3"
                  >
                    <Flex flexDir="row" gap="3" alignItems="center">
                      <Text
                        fontSize="14px"
                        fontWeight="700"
                        color={theme.compensation?.card.text}
                      >
                        How it’s Calculated
                      </Text>
                      {scoringStat.updatedIn ? (
                        <Text
                          fontSize="12px"
                          fontWeight="700"
                          color={theme.compensation?.modal.emphasis}
                        >
                          Updated Formula in {scoringStat.updatedIn}
                        </Text>
                      ) : null}
                    </Flex>
                    <Flex flexDir="row" gap="1" alignItems="center">
                      <Text
                        fontSize="14px"
                        fontWeight={700}
                        color={theme.compensation?.card.text}
                        w="max-content"
                        minW="max-content"
                        maxW="max-content"
                      >
                        {scoringStat.abbreviation} =
                      </Text>
                      <Text
                        fontSize="14px"
                        fontWeight={500}
                        color={theme.compensation?.card.text}
                      >
                        {scoringStat.formula}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            ))}
          </Flex>
        </ModalBody>
        <ModalFooter bg={theme.compensation?.card.bg}>
          <Flex justifyContent="end" w="full">
            <Button
              bg={theme.compensation?.modal.closeBtnBg}
              color={theme.compensation?.modal.closeBtn}
              fontWeight="600"
              fontSize="16px"
              py="2.5"
              px="10"
              borderRadius="2px"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
