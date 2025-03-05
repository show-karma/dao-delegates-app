export interface ScoringStat {
  title: string;
  iconUrl: string;
  description: string;
  weight?: number;
  formula: string;
  abbreviation: string;
  updatedIn?: string;
}

export const scoringStats: ScoringStat[] = [
  {
    title: 'Participation Rate (PR)',
    iconUrl: '/icons/delegate-compensation/lookup-bg.png',
    description:
      'The percentage of votes a delegate participated in over the past 90 days, based on on-chain activity. Updated monthly.',
    weight: 15,
    formula: '(Participation in the last 90 days × 15) ÷ 100',
    abbreviation: 'PR',
  },
  {
    title: 'Snapshot Voting (SV)',
    iconUrl: '/icons/delegate-compensation/thunder-bg.png',
    description:
      'The percentage of proposals a delegate voted on using Snapshot during the month. Resets monthly.',
    weight: 20,
    formula: '(Proposals Voted On ÷ Total Proposals) × 20',
    abbreviation: 'SV',
  },
  {
    title: 'Onchain Voting (TV)',
    iconUrl: '/icons/delegate-compensation/chain-bg.png',
    description:
      'The percentage of proposals a delegate voted on through onchain processes during the month. Resets monthly.',
    weight: 25,
    formula: '(Rationales Provided ÷ Total Proposals) × 25',
    abbreviation: 'TV',
  },
  {
    title: 'Voting Power Multiplier (VP)',
    iconUrl: '/icons/delegate-compensation/megaphone-bg.png',
    description:
      'The Voting Power Multiplier is a linear formula that assigns a minimum value of 0.8 (50K VP avg) and a maximum of 1 (4M VP or more) to the delegates participating in the program. This Multiplier affects only the scoring of voting parameters.',
    formula: '0.00000005063 * VP + 0.7974685',
    abbreviation: 'VP',
    updatedIn: 'v1.6',
  },
  {
    title: 'Delegate Feedback (DF)',
    iconUrl: '/icons/delegate-compensation/star-bg.png',
    description:
      'A score reflecting the quality of feedback provided by a delegate, based on a rubric evaluated by the program administrator. Resets monthly.',
    weight: 40,
    formula:
      '(Σ qualitative criteria) / 50 * Presence in discussions multiplier * 40 (DF weight)',
    abbreviation: 'DF',
    updatedIn: 'v1.6',
  },
  {
    title: 'Total Participation (TP)',
    iconUrl: '/icons/delegate-compensation/target-bg.png',
    description:
      'The combined score of all activities by the delegate. A score of 100% means full participation.',
    formula: '(PR + SV + TV) * VP Multiplier + DF + BP',
    abbreviation: 'TP',
  },
  {
    title: 'Bonus Points (BP)',
    iconUrl: '/icons/delegate-compensation/confetti-bg.png',
    description:
      'Extra recognition for significant contributions to the DAO, granting an automatic +30% boost to Total Participation. Determined by the program administrator. Resets monthly.',
    weight: 30,
    formula: '+30% TP',
    abbreviation: 'BP',
  },
];
