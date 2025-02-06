import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { DownChevron } from 'components/Icons';
import { useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { useRouter } from 'next/router';
import { FC } from 'react';
import { compensation } from 'utils/compensation';

interface IMonthDropdown {
  minimumPeriod: Date;
  maximumPeriod: Date;
}

export const MonthDropdown: FC<IMonthDropdown> = ({
  minimumPeriod,
  maximumPeriod,
}) => {
  const router = useRouter();
  const { rootPathname } = useDAO();
  const { theme } = useDAO();
  const { selectedDate, setSelectedDate } = useDelegateCompensation();
  const { daoInfo } = useDAO();

  const renderMonthList = () => {
    const supportedDates = [];
    const startYear = 2024;
    const currentDate = maximumPeriod || new Date();

    // Get the latest available date from compensation config
    const latestAvailableDate = daoInfo.config.DAO_KARMA_ID
      ? compensation.compensationDates[daoInfo.config.DAO_KARMA_ID]
          .AVAILABLE_MAX
      : new Date();

    for (
      let year = startYear;
      year <= latestAvailableDate.getFullYear();
      year += 1
    ) {
      for (let month = 0; month < 12; month += 1) {
        const dateToCheck = new Date(year, month, 1);

        if (maximumPeriod && dateToCheck > maximumPeriod) {
          break;
        }
        if (dateToCheck > minimumPeriod && dateToCheck <= latestAvailableDate) {
          supportedDates.push({
            name: dateToCheck.toLocaleString('en-US', {
              month: 'long',
            }),
            value: {
              month: month + 1,
              year,
            },
          });
        }
      }
    }

    return supportedDates.map(itemDate => (
      <MenuItem
        key={itemDate.name}
        bg={theme.filters.bg}
        opacity={
          selectedDate?.value.month === itemDate.value.month &&
          selectedDate?.value.year === itemDate.value.year
            ? 0.5
            : 1
        }
        _hover={{ opacity: 0.7 }}
        onClick={() => {
          setSelectedDate({
            name: itemDate.name,
            value: itemDate.value,
          });

          const lastPath = router.asPath.split('/')?.at(-1);

          if (lastPath?.includes('delegate-compensation')) {
            const isOldVersion = router.pathname.includes('-old');
            if (
              (itemDate.value.month >= 11 && itemDate.value.year === 2024) ||
              itemDate.value.year > 2024
            ) {
              router.push(
                {
                  pathname: `${rootPathname}/delegate-compensation`,
                  query: {
                    month: itemDate.name.toLowerCase(),
                    year: itemDate.value.year,
                  },
                },
                undefined,
                { shallow: !isOldVersion }
              );
            } else {
              router.push(
                {
                  pathname: `${rootPathname}/delegate-compensation-old`,
                  query: {
                    month: itemDate.name.toLowerCase(),
                    year: itemDate.value.year,
                  },
                },
                undefined,
                { shallow: !!isOldVersion }
              );
            }
          } else {
            const removeQueryParams = router.asPath.split('?')[0];
            router.push(
              {
                pathname: `${rootPathname}${removeQueryParams}`,
                query: {
                  month: itemDate.name.toLowerCase(),
                  year: itemDate.value.year,
                },
              },
              undefined,
              { shallow: true }
            );
          }
        }}
      >
        {itemDate.name} {itemDate.value.year}
      </MenuItem>
    ));
  };
  return (
    <Menu>
      <MenuButton
        w="max-content"
        as={Button}
        borderWidth="1px"
        borderStyle="solid"
        bg={theme.compensation?.card.dropdown.bg}
        borderColor={theme.compensation?.card.dropdown.border}
        color={theme.compensation?.card.dropdown.text}
        rightIcon={
          <DownChevron
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="4"
          />
        }
        fontSize="14px"
        fontWeight={400}
        maxW="full"
        px="3"
        py="3"
      >
        {selectedDate?.name} {selectedDate?.value.year}
      </MenuButton>
      <MenuList
        _hover={{
          opacity: 0.7,
        }}
        bg={theme.filters.bg}
        maxH={300}
        overflowY="auto"
      >
        {renderMonthList()}
      </MenuList>
    </Menu>
  );
};
