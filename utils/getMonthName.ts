// Array of month names for conversion
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Converts a numeric month (0-11) to its name (January-December)
 * @param monthNumber - Month as a number (0-11)
 * @returns Month name as a string
 */
export const getMonthName = (monthNumber: number | string): string => {
  const monthIndex =
    typeof monthNumber === 'string' ? parseInt(monthNumber, 10) : monthNumber;

  // Ensure the month index is valid (0-11)
  if (monthIndex >= 0 && monthIndex < 12) {
    return MONTH_NAMES[monthIndex];
  }

  // Default to current month if invalid
  return MONTH_NAMES[new Date().getMonth()];
};
