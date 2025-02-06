interface ICompensationDates {
  daos: string[];
  daosOldVersion: string[];
  compensationDates: Record<
    string,
    {
      OLD_VERSION_MIN?: Date;
      OLD_VERSION_MAX?: Date;
      NEW_VERSION_MIN: Date;
      AVAILABLE_MAX: Date;
      DEFAULT_SELECTED: Date;
    }
  >;
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

export const compensation: ICompensationDates = {
  daos: ['arbitrum', 'zksync'],
  daosOldVersion: ['arbitrum'],
  compensationDates: {
    arbitrum: {
      OLD_VERSION_MIN: new Date('2024-02-11'),
      OLD_VERSION_MAX: new Date('2024-10-10'),
      NEW_VERSION_MIN: new Date('2024-10-11'),
      AVAILABLE_MAX: new Date(),
      DEFAULT_SELECTED: calculateDefaultSelected(),
    },
    zksync: {
      NEW_VERSION_MIN: new Date('2024-12-31'),
      AVAILABLE_MAX: new Date(),
      DEFAULT_SELECTED: calculateDefaultSelected(),
    },
  },
};
