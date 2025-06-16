'use client';

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

interface SearchableSelectProps {
    items: Item[];
    value?: string;
    onChange: (value: string | undefined) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    allowClear?: boolean;
    onSearch?: (searchTerm: string) => void;
}

export function SearchableSelect({
    items,
    value,
    onChange,
    placeholder = 'Select item...',
    className,
    disabled = false,
    allowClear = false,
    onSearch
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");

    const handleSearch = (search: string) => {
        setSearchValue(search);
        onSearch?.(search);
    };

    const handleSelect = (currentValue: string) => {
        // Find the item by label (since CommandItem uses label as value)
        const item = items.find(item => item.label.toLowerCase() === currentValue.toLowerCase());
        if (!item) return;

        if (value === item.value && allowClear) {
            onChange(undefined);
        } else {
            onChange(item.value);
        }
        setOpen(false);
    };

    const selectedItem = items.find(item => item.value === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between", className)}
                    disabled={disabled}
                >
                    {selectedItem ? (
                        selectedItem.label
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-[calc(500px-2rem)] p-0">
                <Command>
                    <CommandInput
                        placeholder={placeholder}
                        value={searchValue}
                        onValueChange={handleSearch}
                        disabled={disabled}
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
                                        value === item.value ? "opacity-100" : "opacity-0"
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