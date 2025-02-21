/* eslint-disable react/no-unstable-nested-components */
import { Flex, Image, Text, Tooltip } from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { useDAO } from 'contexts';
import * as React from 'react';
import { DelegateCompensationStats } from 'types';
import { formatNumber, formatSimpleNumber, truncateAddress } from 'utils';
import { MonthNotFinishedTooltip } from '../../MonthNotFinishedTooltip';
import { DataTable } from './DataTable';

const columnHelper = createColumnHelper<DelegateCompensationStats>();

interface TableProps {
  delegates: DelegateCompensationStats[];
  refreshFn: () => Promise<void>;
  isMonthFinished: boolean;
  isAuthorized: boolean;
}

export const Table: React.FC<TableProps> = ({
  delegates,
  refreshFn,
  isMonthFinished,
  isAuthorized,
}) => {
  const { theme } = useDAO();

  const columns = [
    columnHelper.accessor('delegate.shouldUse', {
      cell: info => (
        <Flex flexDir="row" gap="4" alignItems="center">
          <Flex width="32px" height="32px" position="relative">
            <ImgWithFallback
              borderRadius="full"
              width="32px"
              height="32px"
              fallback={info.getValue()}
              src={info.row.original.delegateImage}
            />
            {info.row.original.incentiveOptedIn ? (
              <Flex position="absolute" top="0" right="-8px">
                <Tooltip
                  shouldWrapChildren
                  label="Opted-in to Incentive Program"
                  fontSize="md"
                >
                  <Image
                    src="/icons/delegate-compensation/check-circle.svg"
                    w="16px"
                    h="16px"
                    alt="Opted-in to Incentive Program"
                  />
                </Tooltip>
              </Flex>
            ) : null}
          </Flex>
          <Flex flexDir="column" gap="0" alignItems="flex-start" maxW="200px">
            <Text
              textOverflow="ellipsis"
              maxW="200px"
              overflow="hidden"
              whiteSpace="nowrap"
            >
              {info.getValue()}
            </Text>
            <Flex flexDir="row" gap="3" alignItems="center">
              <Text fontSize="xs" fontWeight="medium" maxW="200px">
                {truncateAddress(info.row.original.delegate.publicAddress)}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      ),
      header: 'Delegate',
    }),
    // columnHelper.accessor('ranking', {
    //   cell: info => info.getValue(),
    //   header: () => (
    //     <Tooltip
    //       bg={theme.collapse.bg || theme.card.background}
    //       color={theme.collapse.text}
    //       label="Ranking is based on the score they achieve each month."
    //     >
    //       Ranking
    //     </Tooltip>
    //   ),
    //   meta: {
    //     isNumeric: true,
    //   },
    // }),
    // columnHelper.accessor('fundsARB', {
    //   cell: info => info.getValue(),
    //   header: () => (
    //     <Tooltip
    //       bg={theme.collapse.bg || theme.card.background}
    //       color={theme.collapse.text}
    //       label="The amount of ARB allocated per month to the delegates’ payment."
    //     >
    //       Funds(ARB)
    //     </Tooltip>
    //   ),
    //   meta: {
    //     isNumeric: true,
    //   },
    // }),
    columnHelper.accessor('votingPower', {
      cell: info => {
        if (!info) {
          return 0;
        }

        if (info.getValue()) {
          return formatNumber(info?.getValue());
        }

        return null;
      },
      header: 'Voting Power',
    }),
    columnHelper.accessor('participationRate', {
      cell: info => {
        if (info.getValue()) {
          return formatSimpleNumber(info.getValue());
        }
        if (info.getValue() === '0') {
          return 0;
        }
        return null;
      },
      header: 'Participation Rate',
    }),
    columnHelper.accessor('snapshotVoting.score', {
      cell: info => {
        if (info.getValue()) {
          return formatSimpleNumber(info.getValue());
        }
        if (info.getValue() === '0') {
          return 0;
        }
        return null;
      },
      header: 'Snapshot Voting',
    }),
    columnHelper.accessor('onChainVoting.score', {
      cell: info => {
        if (info.getValue()) {
          return formatSimpleNumber(info.getValue());
        }
        if (info.getValue() === '0') {
          return 0;
        }
        return null;
      },
      header: 'Onchain Voting',
    }),
    columnHelper.accessor('communicatingRationale.score', {
      cell: info => {
        if (!isMonthFinished && !isAuthorized) {
          return <MonthNotFinishedTooltip />;
        }
        if (info.getValue()) {
          return formatSimpleNumber(info.getValue());
        }
        if (info.getValue() === '0') {
          return 0;
        }
        return null;
      },
      header: 'Communication Rationale',
    }),
    columnHelper.accessor('delegateFeedback.score', {
      cell: info => {
        if (!isMonthFinished && !isAuthorized) {
          return <MonthNotFinishedTooltip />;
        }
        if (info.getValue()) {
          return formatSimpleNumber(info.getValue());
        }
        if (info.getValue() === '0') {
          return 0;
        }
        return null;
      },
      header: 'Delegates Feedback',
    }),
    columnHelper.accessor('totalParticipation', {
      cell: info => {
        if (!isMonthFinished && !isAuthorized) {
          return <MonthNotFinishedTooltip />;
        }
        if (info.getValue()) {
          return formatSimpleNumber(info.getValue());
        }
        if (info.getValue() === '0') {
          return 0;
        }
        return null;
      },
      header: 'Total Participation',
    }),
    columnHelper.accessor('bonusPoint', {
      cell: info => {
        if (!isMonthFinished && !isAuthorized) {
          return <MonthNotFinishedTooltip />;
        }
        if (info.getValue()) {
          return formatSimpleNumber(info.getValue());
        }
        if (info.getValue() === '0') {
          return 0;
        }
        return null;
      },
      header: 'Bonus Points',
    }),
    // columnHelper.accessor('payment', {
    //   cell: info => {
    //     if (info.getValue()) {
    //       return formatSimpleNumber(info.getValue(), {
    //         thousandSeparated: true,
    //       });
    //     }
    //     if (info.getValue() === '0') {
    //       return 0;
    //     }
    //     return null;
    //   },
    //   header: () => (
    //     <Flex flexDir="row" gap="2" alignItems="center">
    //       Payment (ARB)
    //       <Tooltip
    //         bg={theme.collapse.bg || theme.card.background}
    //         color={theme.collapse.text}
    //         label={
    //           <Flex flexDir="column" py="1" gap="2">
    //             <Text fontWeight={600}>Payment ARB (PARB)</Text>
    //             <Text fontWeight="normal">
    //               Final amount of ARB that the delegate will receive based on
    //               his TP% and his position in the table.
    //             </Text>

    //             <Code fontWeight="normal">
    //               PARB formula:
    //               <br />
    //               {`IF(TP% >=100; 5000;(5000 * TP% / 100))`}
    //             </Code>
    //           </Flex>
    //         }
    //       >
    //         <Flex w="5" h="5" cursor="pointer">
    //           <Icon as={AiFillQuestionCircle} w="5" h="5" />
    //         </Flex>
    //       </Tooltip>
    //     </Flex>
    //   ),
    //   meta: {
    //     isNumeric: true,
    //   },
    // }),
  ];

  return <DataTable refreshFn={refreshFn} columns={columns} data={delegates} />;
};
