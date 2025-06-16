import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type User } from '@/features/users/data/types';
import { cn } from '@/lib/utils';
import { type ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';

interface StudentColumnsProps {
    onRemoveStudent?: (studentId: string) => void;
}

export const createStudentColumns = (props?: StudentColumnsProps): ColumnDef<User>[] => [
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
        meta: {
            className: cn(
                'sticky md:table-cell left-0 z-10 rounded-tl',
                'bg-background transition-colors duration-200 group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted'
            ),
        },
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
        accessorKey: 'firstName',
        header: 'First Name',
    },
    {
        accessorKey: 'lastName',
        header: 'Last Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    ...(props?.onRemoveStudent ? [{
        id: 'actions',
        header: 'Actions',
        cell: ({ row }: { row: any }) => (
            <Button
                variant='destructive'
                size='sm'
                onClick={(e) => {
                    e.stopPropagation();
                    props.onRemoveStudent?.(row.original.id);
                }}
            >
                <Trash2 className='h-4 w-4' />
            </Button>
        ),
        enableSorting: false,
        size: 100,
    }] : []),
];

export const studentColumns: ColumnDef<User>[] = createStudentColumns();