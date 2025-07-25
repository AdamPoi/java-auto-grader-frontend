import { Cross2Icon } from '@radix-ui/react-icons';
import { type Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from '@/components/datatable/data-table-view-options';

interface RolesTableToolbarProps<TData> {
    table: Table<TData>;
    searchValue: string;
    setSearchValue: React.Dispatch<React.SetStateAction<string>>;
    // permissionFilter: string[]; // TODO: Implement permission filter
    // setPermissionFilter: React.Dispatch<React.SetStateAction<string[]>>; // TODO: Implement permission filter
}

export function RolesTableToolbar<TData>({
    table,
    searchValue,
    setSearchValue,
    // permissionFilter, // TODO: Implement permission filter
    // setPermissionFilter, // TODO: Implement permission filter
}: RolesTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0;

    return (
        <div className='flex items-center justify-between'>
            <div className='flex flex-1 items-center space-x-2'>
                <Input
                    placeholder='Filter roles...'
                    value={searchValue}
                    onChange={(event) => setSearchValue(event.target.value)}
                    className='h-8 w-[150px] lg:w-[250px]'
                />
                {/* TODO: Implement permission filter */}
                {isFiltered && (
                    <Button
                        variant='ghost'
                        onClick={() => table.resetColumnFilters()}
                        className='h-8 px-2 lg:px-3'
                    >
                        Reset
                        <Cross2Icon className='ml-2 h-4 w-4' />
                    </Button>
                )}
            </div>
            <DataTableViewOptions table={table} />
        </div>
    );
}
