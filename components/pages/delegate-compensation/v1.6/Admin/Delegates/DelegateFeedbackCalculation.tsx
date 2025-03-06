import { Text } from '@chakra-ui/react';
import { DelegateStatsFromAPI } from 'types';

interface DelegateFeedbackCalculationProps {
  delegateFeedback: NonNullable<
    DelegateStatsFromAPI['stats']['delegateFeedback']
  >;
}

export const DelegateFeedbackCalculation = ({
  delegateFeedback,
}: DelegateFeedbackCalculationProps) => {
  const {
    relevance = 0,
    depthOfAnalysis = 0,
    timing = 0,
    clarityAndCommunication = 0,
    impactOnDecisionMaking = 0,
    presenceMultiplier = 0,
    finalScore = 0,
  } = delegateFeedback;

  return (
    <Text>
      DF = ({relevance} + {depthOfAnalysis} + {timing} +{' '}
      {clarityAndCommunication} + {impactOnDecisionMaking}) / 50 *{' '}
      {presenceMultiplier} * 40 = {finalScore}
    </Text>
  );
};
