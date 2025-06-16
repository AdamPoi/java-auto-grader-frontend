import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useDebounce from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import type { SearchRequestParams, SearchResponse } from '@/types/api.types';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';

export interface BaseData {
    id: string;
    name: string;
}

interface DataSelectProps<T extends BaseData> {
    value?: string;
    onChange: (value?: string) => void;
    useDataHook: (params: SearchRequestParams) => {
        data: SearchResponse<T> | undefined;
        isLoading: boolean;
    };
    dataName: string;
    placeholder?: string;
}

export function DataSelect<T extends BaseData>({
    value,
    onChange,
    useDataHook,
    dataName,
    placeholder = `Select a ${dataName.toLowerCase()}`,
}: DataSelectProps<T>) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const searchParams = useMemo(() => ({
        page: 0,
        size: 50, // Fetch more for a good scrollable list
        filter: debouncedSearchTerm ? `search=like:${debouncedSearchTerm}` : undefined,
    }), [debouncedSearchTerm]);

    const { data, isLoading } = useDataHook(searchParams);

    const options = data?.content ?? [];

    const selectedValue = options.find((option) => option.id === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                >
                    {selectedValue ? selectedValue.name : placeholder}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput
                        placeholder={`Search ${dataName.toLowerCase()}...`}
                        onValueChange={setSearchTerm}
                    />
                    <CommandList>
                        {isLoading && <CommandItem>Loading...</CommandItem>}
                        <CommandEmpty>No {dataName.toLowerCase()} found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.id}
                                    value={option.name}
                                    onSelect={() => {
                                        onChange(option.id === value ? undefined : option.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === option.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {option.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
