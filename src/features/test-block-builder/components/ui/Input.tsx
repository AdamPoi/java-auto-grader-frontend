import { ComponentProps, FC } from 'react';

export const Input: FC<ComponentProps<'input'>> = ({ className, ...props }) => (
    <input
        className={`flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...props}
        onMouseDown={(e) => e.stopPropagation()}
    />
);