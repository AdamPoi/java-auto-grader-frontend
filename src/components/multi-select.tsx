'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CheckIcon, ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

interface Item {
    label: string;
    value: string;
}

interface MultiSelectProps {
    value: string[];
    onChange: (value: string[]) => void;
    items: { label: string; value: string }[];
    placeholder?: string;
    className?: string;
    onSearch?: (searchTerm: string) => void;
}

export function MultiSelect({
    items,
    value,
    onChange,
    placeholder = 'Select items...',
    className,
    onSearch
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    const handleSearch = (search: string) => {
        setSearchValue(search);
        onSearch?.(search);
    };

    const handleSelect = (currentValue: string) => {
        const item = items.find(item => item.label.toLowerCase() === currentValue.toLowerCase());
        if (!item) return;

        const selectedValues = [...value];
        const index = selectedValues.indexOf(item.value);

        if (index === -1) {
            selectedValues.push(item.value);
        } else {
            selectedValues.splice(index, 1);
        }
        onChange(selectedValues);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                >
                    {value && value.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {value.map((itemValue) => {
                                const item = items.find(i => i.value === itemValue);
                                return item ? (
                                    <Badge key={itemValue} variant="secondary">
                                        {item.label}
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    ) : (
                        placeholder
                    )}
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[calc(500px-2rem)] p-0">
                <Command>
                    <CommandInput
                        placeholder="Search..."
                        value={searchValue}
                        onValueChange={handleSearch}
                    />
                    <CommandEmpty>No item found.</CommandEmpty>
                    <CommandGroup>
                        {items.map((item) => (
                            <CommandItem
                                key={item.value}
                                value={item.label}
                                onSelect={handleSelect}
                            >
                                <CheckIcon
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value.includes(item.value) ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {item.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}