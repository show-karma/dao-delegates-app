import { useQuery } from '@tanstack/react-query';
import { useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { getDelegateCompensationVersion } from 'utils/delegate-compensation/getVersion';
import {
  versionComponents,
  DefaultComponents,
} from 'components/pages/delegate-compensation';

export const useVersionedComponents = () => {
  const { daoInfo } = useDAO();
  const { selectedDate } = useDelegateCompensation();

  // Determine which version to use based on the selected date
  const version = getDelegateCompensationVersion(
    daoInfo.config.DAO_KARMA_ID,
    selectedDate?.value
      ? new Date(selectedDate.value.year, selectedDate.value.month - 1)
      : new Date()
  );

  const { data: components, isLoading } = useQuery({
    queryKey: ['version-components', version],
    queryFn: async () => {
      try {
        if (!versionComponents[version]) {
          console.error(`Version ${version} not found in available components`);
          // Fallback to v1.5 if version not found
          return await versionComponents['v1.5']();
        }
        return await versionComponents[version]();
      } catch (error) {
        console.error('Error loading components:', error);
        return DefaultComponents;
      }
    },
    enabled: !!version,
  });

  return {
    components: components || DefaultComponents,
    isLoading,
    version,
  };
};
