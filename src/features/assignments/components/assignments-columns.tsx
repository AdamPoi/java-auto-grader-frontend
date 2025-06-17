import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import { Checkbox } from '@/components/ui/checkbox';
import type { ColumnDef } from '@tanstack/react-table';
import type { Assignment } from '../data/types';
import { AssignmentsTableRowActions } from './assignments-table-row-actions';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { ExternalLinkIcon } from 'lucide-react';

export const columns: ColumnDef<Assignment>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label='Select all'
                className='translate-y-[2px]'
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label='Select row'
                className='translate-y-[2px]'
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'title',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Title' />
        ),
        cell: ({ row }) => <div className='w-[150px]'>{row.getValue('title')}</div>,
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'description',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Description' />
        ),
        cell: ({ row }) => <div className='w-[200px] truncate'>{row.getValue('description')}</div>,
        enableSorting: false,
        enableHiding: true,
    },
    {
        accessorKey: 'dueDate',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Due Date' />
        ),
        cell: ({ row }) => {
            const dueDate = row.getValue('dueDate') as string;
            return dueDate ? (
                <div className='w-[150px]'>
                    {new Date(dueDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}
                </div>
            ) : null;
        },
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'totalPoints',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Points' />
        ),
        cell: ({ row }) => <div className='w-[80px]'>{row.getValue('totalPoints')}</div>,
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'isPublished',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Published' />
        ),
        cell: ({ row }) => (
            <div className='w-[100px]'>
                {row.getValue('isPublished') ? 'Yes' : 'No'}
            </div>
        ),
        enableSorting: true,
        enableHiding: true,
    },
    {
        accessorKey: 'manages',
        header: 'Manages',
        cell: ({ row }) => {
            const navigate = useNavigate();
            return <Button
                type='button'
                variant='outline'
                onClick={() => {
                    navigate({
                        to: '/assignments/$assignmentId',
                        params: { assignmentId: row.original.id },
                    });
                }}>
                Manage <ExternalLinkIcon className='ml-2 h-4 w-4' />
            </Button>;
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => <AssignmentsTableRowActions row={row} />,
    },
];