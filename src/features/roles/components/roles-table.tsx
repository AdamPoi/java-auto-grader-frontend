import {
    type ColumnDef,
    type PaginationState,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import * as React from 'react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '../../users/components/data-table-pagination';
import type { Role } from '../data/schema';
import { RolesTableToolbar } from './roles-table-toolbar'; // TODO: Create roles-table-toolbar

interface RolesTableProps {
    columns: ColumnDef<Role, any>[];
    data: Role[];
    isLoading: boolean;
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    // permissionFilter: string[]; // TODO: Implement permission filter
    // setPermissionFilter: React.Dispatch<React.SetStateAction<string[]>>; // TODO: Implement permission filter
    totalRowCount: number;
}

export function RolesTable({
    columns,
    data,
    isLoading,
    pagination,
    setPagination,
    sorting,
    setSorting,
    searchValue,
    setSearchValue,
    // permissionFilter, // TODO: Implement permission filter
    // setPermissionFilter, // TODO: Implement permission filter
    totalRowCount,
}: RolesTableProps) {
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
        },
        enableRowSelection: true,
        onSortingChange: setSorting,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        rowCount: totalRowCount,
    });

    return (
        <div className='space-y-4'>
            <RolesTableToolbar table={table} searchValue={searchValue} setSearchValue={setSearchValue} /> {/* TODO: Implement roles-table-toolbar */}
            <div className='rounded-md border'>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} colSpan={header.colSpan}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && 'selected'}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='h-24 text-center'
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination table={table} />
        </div>
    );
}
