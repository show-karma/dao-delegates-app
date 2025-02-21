import { Flex, Spinner, Switch, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useAuth, useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { useState, useEffect } from 'react';
import { DelegateCompensationStats } from 'types';
import { compensation } from 'utils/compensation';
import { fetchDelegates } from 'utils/delegate-compensation/fetchDelegates';
import { getProposals } from 'utils/delegate-compensation/getProposals';
import { getDelegateCompensationVersion } from 'utils/delegate-compensation/getVersion';
import { MonthDropdown } from './MonthDropdown';

export interface VersionComponents {
  DelegatePerformanceOverviewHeader?: React.ComponentType;
  Table: React.ComponentType<{
    delegates: DelegateCompensationStats[];
    refreshFn: () => Promise<void>;
    isMonthFinished: boolean;
    isAuthorized: boolean;
  }>;
  MonthDropdown: React.ComponentType<{
    minimumPeriod: Date;
    maximumPeriod: Date;
  }>;
  AdminDelegates: React.ComponentType<{
    delegateAddress?: string;
    shouldShowDelegate?: 'block' | 'dropdown' | 'none';
    isPublic?: boolean;
  }>;
  AdminForumActivity: React.ComponentType<{
    delegateAddress: string;
    isPublic?: boolean;
  }>;
  AdminHome?: React.ComponentType;
}

// Create a type from the available versions in the compensation config
export type AvailableVersions =
  (typeof compensation.compensationDates)[keyof typeof compensation.compensationDates]['versions'][number]['version'];

// Import all available versions dynamically
export const versionComponents: Record<
  string,
  () => Promise<VersionComponents>
> = {
  'v1.5': async () => {
    const components = await import('./v1.5');
    return {
      DelegatePerformanceOverviewHeader:
        components.DelegatePerformanceOverviewHeader,
      Table: components.Table,
      MonthDropdown,
      AdminDelegates: (await import('./v1.5/Admin/Delegates'))
        .DelegateCompensationAdminDelegates,
      AdminForumActivity: (await import('./v1.5/Admin/ForumActivity'))
        .DelegateCompensationAdminForumActivity,
      AdminHome: (await import('./v1.5/Admin/index')).DelegateCompensationAdmin,
    };
  },
  'v1.6': async () => {
    const components = await import('./v1.6');
    return {
      DelegatePerformanceOverviewHeader:
        components.DelegatePerformanceOverviewHeader,
      Table: components.Table,
      MonthDropdown,
      AdminDelegates: (await import('./v1.6/Admin/Delegates'))
        .DelegateCompensationAdminDelegates,
      AdminForumActivity: (await import('./v1.6/Admin/ForumActivity'))
        .DelegateCompensationAdminForumActivity,
      AdminHome: (await import('./v1.6/Admin/index')).DelegateCompensationAdmin,
    };
  },
  old: async () => {
    const oldTable = await import('./OldVersion/Table');
    return {
      Table: oldTable.Table,
      MonthDropdown,
      AdminDelegates: (await import('./v1.5/Admin/Delegates'))
        .DelegateCompensationAdminDelegates,
      AdminForumActivity: (await import('./v1.5/Admin/ForumActivity'))
        .DelegateCompensationAdminForumActivity,
    };
  },
};

const LoadingComponent = () => <Spinner w="32px" h="32px" />;

export const DefaultComponents: VersionComponents = {
  DelegatePerformanceOverviewHeader: LoadingComponent,
  Table: LoadingComponent,
  MonthDropdown: LoadingComponent,
  AdminDelegates: LoadingComponent,
  AdminForumActivity: LoadingComponent,
  AdminHome: LoadingComponent,
};

export const DelegateCompensation = () => {
  const { theme, daoInfo } = useDAO();
  const [onlyOptIn, setOnlyOptIn] = useState(true);
  const { selectedDate } = useDelegateCompensation();
  const [versionedComponents, setVersionedComponents] =
    useState<VersionComponents>(DefaultComponents);

  // Determine which version to use based on the selected date
  const version = getDelegateCompensationVersion(
    daoInfo.config.DAO_KARMA_ID,
    selectedDate?.value
      ? new Date(selectedDate.value.year, selectedDate.value.month - 1)
      : new Date()
  );

  // Reset versioned components when version changes
  useEffect(() => {
    setVersionedComponents(DefaultComponents);
  }, [version]);

  // Load version-specific components
  const { isLoading: isLoadingComponents } = useQuery({
    queryKey: ['version-components', version],
    queryFn: async () => {
      try {
        if (!versionComponents[version]) {
          console.error(`Version ${version} not found in available components`);
          // Fallback to v1.5 if version not found
          const components = await versionComponents['v1.5']();
          setVersionedComponents(components);
          return components;
        }

        const components = await versionComponents[version]();
        setVersionedComponents(components);
        return components;
      } catch (error) {
        console.error('Error loading components:', error);
        return DefaultComponents;
      }
    },
    enabled: !!version,
  });

  const {
    data: delegates,
    isLoading: isLoadingDelegates,
    refetch,
  } = useQuery<DelegateCompensationStats[]>({
    queryKey: [
      'delegate-compensation',
      daoInfo.config.DAO_KARMA_ID,
      selectedDate?.value.month,
      selectedDate?.value.year,
      onlyOptIn,
      version,
    ],
    initialData: [],
    queryFn: () =>
      fetchDelegates(
        daoInfo.config.DAO_KARMA_ID,
        onlyOptIn,
        selectedDate?.value.month as number,
        selectedDate?.value.year as number,
        version
      ),
    enabled:
      !!selectedDate?.value.month &&
      !!selectedDate?.value.year &&
      !!daoInfo.config.DAO_KARMA_ID,
  });

  const { data: proposalsData } = useQuery(
    [
      'delegate-compensation-proposals',
      selectedDate?.value.month,
      selectedDate?.value.year,
    ],
    () =>
      getProposals(
        daoInfo.config.DAO_KARMA_ID,
        selectedDate?.value.month as string | number,
        selectedDate?.value.year as string | number
      ),
    {
      initialData: {
        proposals: [],
        finished: false,
      },
      enabled:
        !!selectedDate?.value.month &&
        !!selectedDate?.value.year &&
        !!daoInfo.config.DAO_KARMA_ID,
      refetchOnWindowFocus: false,
    }
  );

  const isMonthFinished = proposalsData?.finished || false;

  const COMPENSATION_DATES =
    compensation.compensationDates[
      daoInfo.config.DAO_KARMA_ID as keyof typeof compensation.compensationDates
    ];

  const { isDaoAdmin: isAuthorized } = useAuth();

  // Show loading state while version components are loading
  if (!versionedComponents || isLoadingComponents) {
    return (
      <Flex justifyContent="center" alignItems="center" w="full" h="full">
        <Spinner w="32px" h="32px" />
      </Flex>
    );
  }

  const {
    DelegatePerformanceOverviewHeader,
    Table,
    MonthDropdown: VersionDropdown,
  } = versionedComponents;

  return (
    <Flex
      flexDir={{ base: 'column', lg: 'row' }}
      w="full"
      gap={{ base: '24px', '2xl': '48px' }}
      py="6"
    >
      <Flex
        paddingX={{ base: '2', lg: '0' }}
        flex="1"
        w="full"
        overflowX="auto"
        flexDirection="column"
        gap={{ base: '4', lg: '4' }}
      >
        {DelegatePerformanceOverviewHeader && (
          <DelegatePerformanceOverviewHeader />
        )}
        <Flex
          flexDir="row"
          w="full"
          justifyContent="space-between"
          align="center"
          bg={theme.compensation?.performanceOverview.header.bg.card}
          borderRadius="2xl"
          px="4"
          py="6"
          gap="4"
          flexWrap="wrap"
        >
          <Text
            color={theme.compensation?.performanceOverview.header.text}
            fontSize={{ base: '20px', lg: '24px' }}
            fontWeight="600"
          >
            Delegate Performance Overview
          </Text>
          <Flex
            flexDirection="row"
            gap={{ base: '3  ', lg: '6' }}
            alignItems="center"
            justifyContent="flex-start"
            flexWrap="wrap"
          >
            <Switch
              display="flex"
              defaultChecked={onlyOptIn}
              onChange={event => {
                setOnlyOptIn(event.target.checked);
              }}
              alignItems="center"
              gap="0"
              id="only-opt-in"
              fontWeight={400}
              fontSize={{ base: '14px', lg: '16px' }}
            >
              Show only opt-in
            </Switch>
            <Flex flexDirection="row" gap="4" alignItems="center">
              <Text
                display={{ base: 'none', lg: 'flex' }}
                color={theme.card.text}
                fontSize="16px"
                fontWeight="600"
              >
                Month
              </Text>
              <VersionDropdown
                minimumPeriod={COMPENSATION_DATES.versions[0].startDate}
                maximumPeriod={COMPENSATION_DATES.AVAILABLE_MAX}
              />
            </Flex>
          </Flex>
        </Flex>
        {isLoadingDelegates ? (
          <Flex justifyContent="center" alignItems="center" w="full">
            <Spinner w="32px" h="32px" />
          </Flex>
        ) : (
          <Table
            delegates={delegates}
            refreshFn={async () => {
              await refetch();
            }}
            isMonthFinished={isMonthFinished}
            isAuthorized={isAuthorized}
          />
        )}
      </Flex>
    </Flex>
  );
};
