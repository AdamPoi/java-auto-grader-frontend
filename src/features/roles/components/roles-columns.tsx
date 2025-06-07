import { type ColumnDef } from '@tanstack/react-table';
import type { Role } from '../data/schema';
import { RolesTableRowActions } from './roles-table-row-actions';
import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';

export const columns: ColumnDef<Role>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title='Name' />
        ),
        cell: ({ row }) => <div>{row.getValue('name')}</div>,
        enableSorting: true,
        enableHiding: false,
    },
    {
        accessorKey: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => {
            const permissions: any[] | null | undefined = row.getValue('permissions');
            const permissionCount = permissions && Array.isArray(permissions) ? permissions.length : 0;
            return (
                <div>{permissionCount}</div>
            );
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <RolesTableRowActions row={row} />,
    },
];
