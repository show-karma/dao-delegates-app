/* eslint-disable react/no-unstable-nested-components */
import * as React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { DelegateCompensationStats } from 'types';
import {
  Checkbox,
  Code,
  Flex,
  List,
  ListItem,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { ImgWithFallback } from 'components/ImgWithFallback';
import { isAddress } from 'ethers/lib/utils';
import { formatNumberPercentage, truncateAddress } from 'utils';
import { useDAO } from 'contexts';
import { DataTable } from './DataTable';

const columnHelper = createColumnHelper<DelegateCompensationStats>();

interface TableProps {
  delegates: DelegateCompensationStats[];
}

export const Table: React.FC<TableProps> = ({ delegates }) => {
  const { theme } = useDAO();
  const columns = [
    columnHelper.accessor('delegate', {
      cell: info => (
        <Flex flexDir="row" gap="3" alignItems="center" maxW="200px">
          <Tooltip
            shouldWrapChildren
            label="Opted-in to Incentive Program"
            fontSize="md"
          >
            {info.row.index % 2 === 0 ? (
              <Checkbox
                colorScheme="green"
                defaultChecked
                _hover={{
                  cursor: 'normal',
                }}
              />
            ) : (
              <Flex w="16px" />
            )}
          </Tooltip>
          <ImgWithFallback
            borderRadius="full"
            boxSize="32px"
            fallback={info.getValue()}
            src={info.row.original.delegateImage}
          />
          <Text textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {isAddress(info.getValue().toLowerCase())
              ? truncateAddress(info.getValue())
              : info.getValue()}
          </Text>
        </Flex>
      ),
      header: 'Delegate',
    }),
    columnHelper.accessor('ranking', {
      cell: info => info.getValue(),
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label="Ranking is based on the score they achieve each month."
        >
          Ranking
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
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
    columnHelper.accessor('participationRate', {
      cell: info => info.getValue() || null,
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label={
            <Flex flexDir="column" py="1" gap="2">
              <Text fontWeight={600}>Participation Rate (PR) - Weight 20</Text>
              <Text fontWeight="normal">
                Percentage of the total participation of the member in votes.
                Karma pulls the participation activity directly from onchain
                transactions. This is the only parameter that is not reset
                monthly.
              </Text>
              <Code fontWeight="normal">PR% formula: (PR * 20) / 100</Code>
            </Flex>
          }
        >
          PR(%)
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('snapshotVoting.score', {
      cell: info => info.getValue() || null,
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label={
            <Flex flexDir="column" py="1" gap="2">
              <Text fontWeight={600}>Snapshot Voting (SV) - Weight 15</Text>
              <Text fontWeight="normal">
                Percentage of delegate participation in snapshot voting. This
                parameter is reset at the beginning of each month.
              </Text>
              <List fontWeight="normal">
                <ListItem>
                  <b>Tn</b>: Number of total proposals that were sent to
                  snapshots for voting in the month.
                </ListItem>
                <ListItem>
                  <b>Rn:</b> Number of proposals the delegate voted on in the
                  month.
                </ListItem>
              </List>
              <Code fontWeight="normal">
                SV% formula: (SV(Rn) / SV(Tn)) * 15
              </Code>
            </Flex>
          }
        >
          SV(%)
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('onChainVoting.score', {
      cell: info => info.getValue() || null,
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label={
            <Flex flexDir="column" py="1" gap="2">
              <Text fontWeight={600}>Tally Voting (TV) - Weight 25</Text>
              <Text fontWeight="normal">
                Percentage of delegate participation in on-chain voting in
                Tally. This parameter is reset at the beginning of each month.
              </Text>
              <List fontWeight="normal">
                <ListItem>
                  <b>Tn</b>: Number of total proposals that were sent to Tally
                  for voting in the month.
                </ListItem>
                <ListItem>
                  <b>Rn:</b> Number of proposals the delegate voted in Tally in
                  the month.
                </ListItem>
              </List>
              <Code fontWeight="normal">
                TV% formula: (TV(Rn) / TV(Tn)) * 25
              </Code>
            </Flex>
          }
        >
          TV(%)
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('communicatingRationale.score', {
      cell: info => info.getValue() || null,
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label={
            <Flex flexDir="column" py="1" gap="2">
              <Text fontWeight={600}>
                Communicating Rationale (CR) - Weight 25
              </Text>
              <Text fontWeight="normal">
                Percentage of communication threads with the justification of
                the delegate’s vote on the proposals sent to snapshots and Tally
                (if necessary if the vote does not change). This parameter is
                reset at the beginning of each month.
              </Text>
              <List fontWeight="normal">
                <ListItem>
                  <b>Tn</b>: Total number of proposals that were submitted to a
                  vote.
                </ListItem>
                <ListItem>
                  <b>Rn:</b> Number of real communication rational threads where
                  the delegate communicated and justified his/her decision.
                </ListItem>
              </List>
              <Code fontWeight="normal">
                CR% formula: (CR(Rn) / CR(Tn)) * 25
              </Code>
            </Flex>
          }
        >
          CR(%)
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('commentingProposal.score', {
      cell: info => info.getValue() || null,
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label={
            <Flex flexDir="column" py="1" gap="2">
              <Text fontWeight={600}>Commenting Proposal (CP) - Weight 15</Text>
              <Text fontWeight="normal">
                Percentage of proposals where the delegate asked questions or
                generated important discussion for the advancement of the
                proposal. This parameter is reset at the beginning of each
                month.
              </Text>
              <List fontWeight="normal">
                <ListItem>
                  <b>Tn</b>: Total number of formal proposals posted on the
                  forum.
                </ListItem>
                <ListItem>
                  <b>Rn:</b> Number of actual proposals where the delegate made
                  a genuine and quality contribution. Spam messages will not be
                  considered.
                </ListItem>
              </List>
              <Code fontWeight="normal">
                CP% formula: (CP(Rn) / CP(Tn)) * 15
              </Code>
            </Flex>
          }
        >
          CP(%)
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('totalParticipation', {
      cell: info =>
        info.getValue() ? formatNumberPercentage(info.getValue()) : null,
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label={
            <Flex flexDir="column" py="1" gap="2">
              <Text fontWeight={600}>Total Participation (TP)</Text>
              <Text fontWeight="normal">
                Sum of the results of activities performed by the delegate. A
                TP% of 100 indicates full participation.
              </Text>

              <Code fontWeight="normal">
                TP% formula: PR% + SV% + TV% + CR% + CP% + BP
              </Code>
            </Flex>
          }
        >
          Total Participation(%)
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('bonusPoint', {
      cell: info => info.getValue() || null,
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label={
            <Flex flexDir="column" py="1" gap="2">
              <Text fontWeight={600}>Bonus Point (BP) - Extra +30% TP</Text>
              <Text fontWeight="normal">
                This parameter is extra. If the delegate makes a significant
                contribution to the DAO, he/she is automatically granted +40%
                extra TP. This parameter is at the discretion of the program
                administrator. This parameter is reset at the beginning of each
                month
              </Text>
            </Flex>
          }
        >
          Bonus Points(%)
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
    columnHelper.accessor('payment', {
      cell: info => (info.getValue() ? info.getValue() : null),
      header: () => (
        <Tooltip
          bg={theme.collapse.bg || theme.card.background}
          color={theme.collapse.text}
          label={
            <Flex flexDir="column" py="1" gap="2">
              <Text fontWeight={600}>Payment ARB (PARB)</Text>
              <Text fontWeight="normal">
                Final amount of ARB that the delegate will receive based on his
                TP% and his position in the table.
              </Text>

              <Code fontWeight="normal">
                PARB formula:
                <br />
                {`IF(TP% >=100; 5000;(5000 * TP% / 100))`}
              </Code>
            </Flex>
          }
        >
          Payment(ARB)
        </Tooltip>
      ),
      meta: {
        isNumeric: true,
      },
    }),
  ];
  return <DataTable columns={columns} data={delegates} />;
};
