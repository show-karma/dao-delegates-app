import { compensation } from '../compensation';

export const getDelegateCompensationVersion = (
  daoId: string,
  selectedDate: Date
): string => {
  const daoConfig = compensation.compensationDates[daoId];

  if (!daoConfig) {
    throw new Error(`Invalid DAO ID: ${daoId}`);
  }

  if (!daoConfig.versions.length) {
    throw new Error(`No versions configured for DAO: ${daoId}`);
  }

  // Sort versions by startDate to ensure proper order
  const sortedVersions = [...daoConfig.versions].sort(
    (a, b) => b.startDate.getTime() - a.startDate.getTime()
  );

  // Find the matching version based on date range
  const matchingVersion = sortedVersions.find(version => {
    const isAfterStart = selectedDate >= version.startDate;
    const isBeforeEnd = version.endDate
      ? selectedDate <= version.endDate
      : true;
    return isAfterStart && isBeforeEnd;
  });

  if (!matchingVersion) {
    // If selected date is before all versions, use the earliest version
    const earliestVersion = sortedVersions[sortedVersions.length - 1];
    if (selectedDate < earliestVersion.startDate) {
      return earliestVersion.version;
    }

    // If selected date is after all versions with endDates, use the latest version
    const latestVersion = sortedVersions[0];
    if (!latestVersion.endDate || selectedDate > latestVersion.startDate) {
      return latestVersion.version;
    }

    // Fallback to the earliest version if no other match
    return earliestVersion.version;
  }

  return matchingVersion.version;
};
