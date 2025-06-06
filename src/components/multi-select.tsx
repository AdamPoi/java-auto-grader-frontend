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
    items: Item[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    className?: string;
}

export function MultiSelect({
    items,
    value,
    onChange,
    placeholder = 'Select items...',
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (currentValue: string) => {
        const selectedValues = [...value];
        const index = selectedValues.indexOf(currentValue);

        if (index === -1) {
            selectedValues.push(currentValue);
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
                    <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
                    <CommandEmpty>No item found.</CommandEmpty>
                    <CommandGroup>
                        {items.map((item) => (
                            <CommandItem
                                key={item.value}
                                value={item.value}
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
