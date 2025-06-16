import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import { type ColumnDef } from '@tanstack/react-table';
import type { Classroom } from '../data/types';
import { ClassroomsTableRowActions } from './classrooms-table-row-actions';

export const columns: ColumnDef<Classroom>[] = [
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
        accessorKey: 'teacher',
        header: 'Teacher',
        cell: ({ row }) => {
            const teacher = row.original.teacher;
            return <div>{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'N/A'}</div>;
        },
    },
    {
        accessorKey: 'students',
        header: 'Students',
        cell: ({ row }) => {
            const students = row.original.students;
            return <div>{students?.length || 0}</div>;
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <ClassroomsTableRowActions row={row} />,
    },
];