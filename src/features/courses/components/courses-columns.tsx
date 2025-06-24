import { DataTableColumnHeader } from '@/components/datatable/data-table-column-header';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { type ColumnDef } from '@tanstack/react-table';
import { ExternalLinkIcon } from 'lucide-react';
import type { Course } from '../data/types';
import { CoursesTableRowActions } from './courses-table-row-actions';

export const columns: ColumnDef<Course>[] = [
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
        accessorKey: 'assignments',
        header: 'Assignments',
        cell: ({ row }) => {
            const navigate = useNavigate();
            return <Button
                type='button'
                variant='outline'
                onClick={() => {
                    navigate({
                        to: '/admin/courses/$courseId/assignments',
                        params: { courseId: row.original.id },
                        search: { filter: `course=eq:${row.original.id}` },
                    });
                }}>
                {row.original.assignments?.length || 0} Assignments <ExternalLinkIcon className='ml-2 h-4 w-4' />
            </Button>;
        },
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => <CoursesTableRowActions row={row} />,
    },

];