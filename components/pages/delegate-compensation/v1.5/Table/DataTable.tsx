import { Flex, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useDAO } from 'contexts';
import { useDelegateCompensation } from 'contexts/delegateCompensation';
import { useState } from 'react';
import { DelegateCompensationStats } from 'types';

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  refreshFn: () => Promise<void>;
};

export const DataTable = <Data extends object>({
  data,
  columns,
  refreshFn,
}: DataTableProps<Data>) => {
  const { theme, daoInfo } = useDAO();
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });
  const { selectedDate } = useDelegateCompensation();

  return (
    <Flex
      backgroundColor={theme.card.background}
      rounded="8px"
      overflowX="scroll"
    >
      <Table>
        <Thead>
          {table.getHeaderGroups().map(headerGroup => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header, index) => {
                const { meta } = header.column.columnDef;
                return (
                  <Th
                    paddingX={{ base: '8px', '2xl': '16px' }}
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    textAlign="left"
                    color={theme.text}
                    textTransform="none"
                    fontSize="14px"
                    fontWeight="700"
                    lineHeight="20px"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody>
          {table.getRowModel().rows.map(row => (
            <Tr
              key={row.id}
              onClick={() => {
                // open a new tab with link
                if (!window) return;
                window.open(
                  `/delegate-compensation/delegate/${
                    (row.original as DelegateCompensationStats).delegate
                      .publicAddress
                  }?month=${selectedDate?.name}&year=${
                    selectedDate?.value.year
                  }`,
                  '_blank'
                );
              }}
              cursor="pointer"
              _hover={{
                opacity: 0.8,
              }}
            >
              {row.getVisibleCells().map(cell => {
                const { meta } = cell.column.columnDef;
                return (
                  <Td
                    paddingX={{ base: '8px', '2xl': '16px' }}
                    key={cell.id}
                    textAlign="left"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                );
              })}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Flex>
  );
};
