import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type Table } from '@tanstack/react-table';
import { userTypes } from '../data/data';
import { DataTableFacetedFilter } from '@/components/datatable/data-table-faceted-filter';
import { DataTableViewOptions } from '@/components/datatable/data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchValue: string;
  setSearchValue: (value: string) => void;
  roleFilter: string[];
  setRoleFilter: (value: string[]) => void;
}

export function DataTableToolbar<TData>({
  table,
  searchValue,
  setSearchValue,
  roleFilter,
  setRoleFilter,
}: DataTableToolbarProps<TData>) {

  const isFiltered = searchValue !== '' || roleFilter.length > 0;

  const resetFilters = () => {
    setSearchValue('');
    setRoleFilter([]);
  };

  return (
    <div className='flex items-center justify-between'>
      <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
        <Input
          placeholder='Search users...'
          value={searchValue}
          onChange={(event) =>
            setSearchValue(event.target.value)
          }
          className='h-8 w-[150px] lg:w-[250px]'
        />
        {table.getColumn('role') && (
          <DataTableFacetedFilter
            column={table.getColumn('role')}
            title='Role'
            options={userTypes.map((t) => ({ ...t }))}
            onFilterChange={setRoleFilter}
          />
        )}
        {isFiltered && (
          <Button
            variant='ghost'
            onClick={resetFilters}
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
