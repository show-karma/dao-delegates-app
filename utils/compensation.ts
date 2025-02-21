interface IVersion {
  version: string;
  startDate: Date;
  endDate?: Date;
}

interface IDAOConfig {
  versions: IVersion[];
  AVAILABLE_MAX: Date;
  DEFAULT_SELECTED: Date;
}

interface ICompensationDates {
  daos: string[];
  daosOldVersion: string[];
  compensationDates: Record<string, IDAOConfig>;
}

const calculateDefaultSelected = () => {
  const now = new Date();
  const day = now.getDate();

  if (day < 15) {
    const prevMonth = new Date(now);
    prevMonth.setDate(1);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth;
  }

  return now;
};

// Helper to get DAOs with old version
const getDAOsWithOldVersion = (
  compensationDates: Record<string, IDAOConfig>
): string[] =>
  Object.entries(compensationDates)
    .filter(([_, config]) => config.versions.some(v => v.version === 'old'))
    .map(([daoId]) => daoId);

export const compensation: ICompensationDates = {
  daos: ['arbitrum', 'zksync'],
  compensationDates: {
    arbitrum: {
      versions: [
        {
          version: 'old',
          startDate: new Date('2024-02-11'),
          endDate: new Date('2024-10-10'),
        },
        {
          version: 'v1.5',
          startDate: new Date('2024-10-11'),
          endDate: new Date('2024-11-30'),
        },
        {
          version: 'v1.6',
          startDate: new Date('2024-12-01'),
          // No endDate means it's the current version
        },
      ],
      AVAILABLE_MAX: new Date(),
      DEFAULT_SELECTED: calculateDefaultSelected(),
    },
    zksync: {
      versions: [
        {
          version: 'v1.5',
          startDate: new Date('2024-12-31'),
          // No endDate means it's the current version
        },
      ],
      AVAILABLE_MAX: new Date(),
      DEFAULT_SELECTED: calculateDefaultSelected(),
    },
  },
  get daosOldVersion() {
    return getDAOsWithOldVersion(this.compensationDates);
  },
};
