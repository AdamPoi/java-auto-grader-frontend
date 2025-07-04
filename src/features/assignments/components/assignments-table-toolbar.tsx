import { Cross2Icon } from '@radix-ui/react-icons';
import { type Table } from '@tanstack/react-table';

import { DataTableViewOptions } from '@/components/datatable/data-table-view-options';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AssignmentsTableToolbarProps<TData> {
  table: Table<TData>;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
}

export function AssignmentsTableToolbar<TData>({
  table,
  searchValue,
  setSearchValue,
}: AssignmentsTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 items-center space-x-2'>
        <Input
          placeholder='Filter assignments...'
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className='h-8 w-[150px] lg:w-[250px]'
        />
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