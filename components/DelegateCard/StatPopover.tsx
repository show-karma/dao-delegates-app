import {
  Divider,
  Flex,
  IconButton,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { LeftCircleArrowIcon } from 'components/Icons';
import { useDAO } from 'contexts';
import { AnimatePresence, motion } from 'framer-motion';
import { DELEGATOR_TRACKER_NOT_SUPPORTED_DAOS } from 'helpers';
import { FC } from 'react';
import { ICardStat, IDelegate } from 'types';

interface IStatPopoverCasesProps {
  stats: ICardStat[];
  stat: ICardStat;
  shouldOpenScoreBreakdown?: boolean;
  index: number;
  daoName: string;
  delegateAddress?: string;
}

const StatPopoverCases: FC<IStatPopoverCasesProps> = ({
  stat,
  shouldOpenScoreBreakdown,
  stats,
  index,
  daoName,
  delegateAddress,
}) => {
  const { theme } = useDAO();
  const daoNotSupportDelegatorPage = DELEGATOR_TRACKER_NOT_SUPPORTED_DAOS.find(
    dao => dao === daoName
  );
  if (stat.id === 'delegatorCount' && !daoNotSupportDelegatorPage) {
    return (
      <Link
        background="transparent"
        href={`https://karmahq.xyz/dao/${daoName}/delegators/${delegateAddress}`}
        _hover={{}}
        h="max-content"
        isExternal
        cursor="pointer"
      >
        <Flex flexDir="column">
          <Flex px="3" py="1.5" gap="2" flexDirection="row" align="center">
            <Text
              minW="6"
              fontFamily="heading"
              fontStyle="normal"
              fontWeight="700"
              fontSize="14px"
              color={theme.card.text.primary}
            >
              {stat.value}
            </Text>
            <Text
              fontFamily="heading"
              fontStyle="normal"
              fontWeight="400"
              fontSize="12px"
              color={theme.card.text.primary}
            >
              {stat.title}
            </Text>
          </Flex>
          {stats.length !== index + 1 && stats.length > 1 && (
            <Divider bgColor={theme.card.border} h="1px" />
          )}
        </Flex>
      </Link>
    );
  }

  return (
    <Flex
      flexDir="column"
      onClick={() => {
        if (shouldOpenScoreBreakdown) stat.statAction?.();
      }}
      cursor={shouldOpenScoreBreakdown ? 'pointer' : 'default'}
    >
      <Flex px="3" py="1.5" gap="2" flexDirection="row" align="center">
        <Text
          minW="6"
          fontFamily="heading"
          fontStyle="normal"
          fontWeight="700"
          fontSize="14px"
          color={theme.card.text.primary}
        >
          {stat.value}
        </Text>
        <Text
          fontFamily="heading"
          fontStyle="normal"
          fontWeight="400"
          fontSize="12px"
          color={theme.card.text.primary}
        >
          {stat.title}
        </Text>
      </Flex>
      {stats.length !== index + 1 && stats.length > 1 && (
        <Divider bgColor={theme.card.border} h="1px" />
      )}
    </Flex>
  );
};

interface IStatPopoverProps {
  stats: ICardStat[];
  data?: IDelegate;
}

export const StatPopover: FC<IStatPopoverProps> = ({ stats, data }) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const { theme, daoData, daoInfo } = useDAO();
  const { config } = daoInfo;

  const MotionIconButton = motion(IconButton);
  const MotionPopoverContent = motion(PopoverContent);

  const shouldOpenScoreBreakdown =
    !!data?.discourseHandles &&
    data?.discourseHandles?.length > 0 &&
    !!daoData?.socialLinks.forum &&
    !!config.DAO_FORUM_TYPE;

  return (
    <Popover isOpen={isOpen} onClose={onClose} placement="right">
      <PopoverTrigger>
        <Flex position="absolute" right="-16px">
          <Tooltip
            label={!isOpen && 'More info'}
            hasArrow
            bgColor="black"
            color="white"
            fontWeight="normal"
            fontSize="sm"
          >
            <MotionIconButton
              aria-label="Stat extension showing"
              icon={<LeftCircleArrowIcon boxSize="4" />}
              px="2"
              py="0"
              minWidth="max-content"
              minHeight="max-content"
              background="transparent"
              _hover={{}}
              _active={{}}
              _focus={{}}
              _focusWithin={{}}
              _focusVisible={{}}
              onClick={onToggle}
              color={theme.card.statBg}
              initial={{ rotate: isOpen ? 0 : 180 }}
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              h="max-content"
            />
          </Tooltip>
        </Flex>
      </PopoverTrigger>
      <AnimatePresence>
        {isOpen && (
          <MotionPopoverContent
            marginLeft="-8px"
            w="max-content"
            bg={theme.card.background}
            border="none"
            borderRadius="5px"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            <PopoverBody
              px="0"
              py="0"
              bg={theme.card.statBg}
              border="1px"
              borderStyle="solid"
              borderColor={theme.card.divider}
              borderRadius="5px"
            >
              {stats.map((stat, index) => (
                <StatPopoverCases
                  stat={stat}
                  key={+index}
                  index={index}
                  stats={stats}
                  shouldOpenScoreBreakdown={
                    stat.id === 'forumScore' && shouldOpenScoreBreakdown
                  }
                  daoName={config.DAO_KARMA_ID}
                  delegateAddress={data?.address}
                />
              ))}
            </PopoverBody>
          </MotionPopoverContent>
        )}
      </AnimatePresence>
    </Popover>
  );
};
