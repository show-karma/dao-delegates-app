import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Text,
} from '@chakra-ui/react';
import { blo } from 'blo';
import { DownChevron } from 'components/Icons';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { useMemo } from 'react';
import { getDelegateInfo } from 'utils/delegate-compensation/getDelegateInfo';
import { useQuery } from 'wagmi';

export const DelegatesDropdown = () => {
  const { theme, daoInfo } = useDAO();
  const { changeDelegateAddress, selectedDate, delegateInfo, delegateAddress } =
    useDelegateCompensation();

  const {
    data: allDelegates,
    isLoading,
    isFetching,
  } = useQuery(
    [
      'delegate-compensation-delegates-info',
      selectedDate?.value.month,
      selectedDate?.value.year,
    ],
    async () => {
      const delegates = await getDelegateInfo(
        daoInfo.config.DAO_KARMA_ID,
        selectedDate?.value.month,
        selectedDate?.value.year
      );
      // Sort delegates alphabetically by name, ensName, or address
      return delegates.sort((d1, d2) => {
        const nameA = (
          d1.name ||
          d1.ensName ||
          d1.publicAddress ||
          ''
        ).toLowerCase();
        const nameB = (
          d2.name ||
          d2.ensName ||
          d2.publicAddress ||
          ''
        ).toLowerCase();
        return nameA.localeCompare(nameB);
      });
    },
    {
      enabled: !!selectedDate?.value.month && !!selectedDate?.value.year,
    }
  );

  useMemo(() => {
    if (!delegateAddress && !isLoading && !isFetching) {
      const firstAddress = allDelegates?.[0]?.publicAddress;
      if (!firstAddress) return;
      changeDelegateAddress(firstAddress as string);
    }
  }, [delegateAddress, isLoading, isFetching]);

  if (isLoading || isFetching) {
    return (
      <Flex w="full" justify="center" align="center">
        <Spinner size="md" />
      </Flex>
    );
  }

  return (
    <Menu isLazy id="order-filter">
      <MenuButton
        as={Button}
        rightIcon={
          <DownChevron
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxSize="4"
          />
        }
        borderWidth="1px"
        borderStyle="solid"
        bg={theme.compensation?.card.dropdown.bg}
        borderColor={theme.compensation?.card.dropdown.border}
        color={theme.compensation?.card.dropdown.text}
        _hover={{
          opacity: 0.8,
        }}
        _active={{
          opacity: 0.8,
        }}
        gap="1"
        fontFamily="heading"
        fontWeight="normal"
        textAlign="left"
        fontSize="md"
        minW="min-content"
        w="full"
        maxW={{ base: 'full', md: 'max-content' }}
        px="4"
        py="3"
        borderRadius="4px"
        _focus={{}}
        _focusWithin={{}}
      >
        <Flex flexDir="row" gap="3" align="center">
          {delegateInfo ? (
            <ImgWithFallback
              fallback={delegateInfo?.publicAddress}
              src={
                delegateInfo?.profilePicture ||
                blo(delegateInfo?.publicAddress as `0x${string}`)
              }
              boxSize="24px"
              borderRadius="full"
            />
          ) : null}
          {delegateInfo?.name ||
            delegateInfo?.ensName ||
            delegateInfo?.publicAddress ||
            'Select a Delegate'}
        </Flex>
      </MenuButton>
      <MenuList
        bgColor={theme.filters.listBg}
        color={theme.filters.listText}
        h={{ base: 'max-content' }}
        maxH={{ base: '64' }}
        overflowY="auto"
        sx={{
          '&::-webkit-scrollbar': {
            width: '8px',
            marginX: '4px',
            borderRadius: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            borderRadius: '8px',
            bgColor: theme.filters.activeBg,
          },
        }}
        maxW={['240px', 'full']}
        w="full"
        minW={['auto']}
      >
        {allDelegates?.map((option, index) => (
          <MenuItem
            key={+index}
            onClick={() => changeDelegateAddress(option.publicAddress)}
            bgColor="transparent"
            _hover={{
              bg: theme.filters.activeBg,
            }}
            maxW={['full']}
          >
            <Text
              textOverflow="ellipsis"
              overflow="hidden"
              whiteSpace="nowrap"
              flexDir="row"
              gap="3"
              align="center"
            >
              {/* <ImgWithFallback
                fallback={option?.publicAddress}
                src={
                  option?.profilePicture ||
                  blo(option?.publicAddress as `0x${string}`)
                }
                boxSize="24px"
                borderRadius="full"
              /> */}
              {option.name || option.ensName || option.publicAddress}
            </Text>
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};
