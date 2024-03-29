import {
  Box,
  Flex,
  SkeletonText,
  SystemStyleObject,
  Table,
  Td,
  Text,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { useDAO } from 'contexts';
import { useScoreBreakdown } from 'contexts/scoreBreakdown';
import { ScoreCalculator } from 'karma-score';
import { useMemo } from 'react';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import { formatNumber } from 'utils';
import { InputTree } from './InputTree';

export const ScoreBreakdown: React.FC = () => {
  const { score, address, period, breakdown, loading, type } =
    useScoreBreakdown();
  const {
    theme,
    daoInfo: {
      config: { DAO_KARMA_ID },
    },
  } = useDAO();

  const [formulaWithLabels, formula] = useMemo(
    () => [
      ScoreCalculator.breakdownToString(breakdown, true),
      ScoreCalculator.breakdownToString(breakdown),
    ],
    [score]
  );

  const formattedPeriod = useMemo(
    () => (period === 'lifetime' ? 'Lifetime' : period?.replace('d', ' days')),
    [period]
  );

  const [roundType, roundedResult] = useMemo((): [
    'Round' | 'Floor',
    number
  ] => {
    if (type === 'gitcoinHealthScore') return ['Floor', Math.floor(score)];
    return ['Round', Math.round(score)];
  }, [score, DAO_KARMA_ID]);

  const totalScoreLeftOffset = useMemo(() => {
    const roundedScore = roundedResult.toString();
    switch (roundedScore.length) {
      case 1:
        return -1.5;
      case 2:
        return -2;
      default:
        return -2.5;
    }
  }, [score]);

  const tooltipText =
    'Clicking on a “Weight” number below will allow you to edit the value for preview purposes.';

  const breakdownTableStyles: SystemStyleObject = {
    'tr:first-of-type,': {
      borderBottom: `2px ${theme.background} solid`,
    },
    'tr:not(:last-of-type) td:not(:last-of-type)': {
      borderRight: `${theme.background} 2px solid`,
    },
    'tr td, thead th': {
      border: 'none',
      height: '3.5em',
    },
    'tr:not(:last-of-type) td:nth-of-type(2)': {
      textAlign: 'center',
    },
    'tr:nth-of-type(2n)': {
      background: 'rgba(0,0,0,0.075)',
    },
    'tr:last-of-type, tr:first-of-type': {
      background: 'rgba(0,0,0,0.125)',
    },
    'tr:last-of-type': {
      borderTop: `2px ${theme.background} solid`,
      fontSize: 18,
    },
  };

  const resultTableStyles: SystemStyleObject = {
    'tr:nth-of-type(2n-1) td:not(:first-of-type)': {
      background: 'rgba(0,0,0,0.075)',
    },
    'tr td, thead th': {
      border: 'none',
      height: '3.5em',
    },
    'td:first-of-type': {
      background: 'rgba(0,0,0,0.125)',
    },
    'tr:not(:last-of-type),': {
      borderBottom: `2px ${theme.background} solid`,
    },
  };

  const formattedScoreType = useMemo(() => {
    const scores: Record<string, string> = {
      forumScore: 'Forum Score',
      gitcoinHealthScore: 'Gitcoin Health Score',
      karmaScore: 'Karma Score',
    };
    return scores[type ?? 'karmaScore'];
  }, [type]);

  return (
    <Box>
      <Flex flex="1">
        <Table
          style={{
            boxShadow: '0 0 1em 0.3em rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            overflow: 'hidden',
            color: theme.text,
          }}
          sx={breakdownTableStyles}
        >
          <Tr fontWeight="600">
            <Td px={{ base: '3', md: '6' }}>METRIC</Td>
            <Td px={{ base: '2', md: '6' }}>VALUE</Td>
            <Td
              display="flex"
              gap={2}
              alignItems="center"
              px={{ base: '3', md: '3' }}
            >
              WEIGHT
              <Tooltip
                placement="top"
                label={tooltipText}
                hasArrow
                bgColor="white"
                color="rgba(0,0,0,0.7)"
                fontWeight="normal"
                fontSize="sm"
                borderRadius={10}
                p="3"
              >
                <Text as="span">
                  <BsFillInfoCircleFill cursor="help" />
                </Text>
              </Tooltip>
            </Td>
          </Tr>

          <InputTree address={address} />

          <Tr>
            <Td colSpan={2}>Total</Td>
            <Td textAlign="start">
              <SkeletonText isLoaded={!loading}>
                <Text
                  fontSize="2em"
                  position="relative"
                  left={`${totalScoreLeftOffset}ch`}
                  w="4ch"
                  style={{ wordWrap: 'initial' }}
                  color={theme.text}
                >
                  {formatNumber(roundedResult)}
                </Text>
              </SkeletonText>
            </Td>
          </Tr>
        </Table>
      </Flex>
      <Table
        mt="14"
        sx={resultTableStyles}
        fontSize={14}
        style={{
          boxShadow: '0 0 1em 0.3em rgba(255, 255, 255, 0.05)',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        color={theme.text}
      >
        <Tr>
          <Td>Period</Td>
          <Td>
            <SkeletonText isLoaded={!loading}>{formattedPeriod}</SkeletonText>
          </Td>
        </Tr>
        <Tr>
          <Td>Score Type</Td>
          <Td>
            <SkeletonText isLoaded={!loading}>
              {formattedScoreType}
            </SkeletonText>
          </Td>
        </Tr>
        <Tr>
          <Td>Scoring Formula</Td>
          <Td>
            <SkeletonText isLoaded={!loading}>
              <Text fontWeight="light">{formulaWithLabels}</Text>
            </SkeletonText>
          </Td>
        </Tr>
        <Tr>
          <Td color={theme.text}>Score:</Td>
          <Td color={theme.text}>
            <SkeletonText isLoaded={!loading}>
              <Text fontWeight="light">{formula}</Text>= {roundType}({score}) ={' '}
              {roundedResult}
            </SkeletonText>
          </Td>
        </Tr>
      </Table>
    </Box>
  );
};
