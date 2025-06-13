import React from 'react';

export interface TabsTriggerProps {
    children: React.ReactNode;
    className?: string;
    isActive: boolean;
    onClick: () => void;
    value: string;
    onDeleteFile: (fileName: string) => void; // Function passed down
    onRenameFile: (fileName: string) => void; // Function passed down
    filesLength: number; // Used for conditional rendering of delete button
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ children, className, isActive, onClick, value, onDeleteFile, onRenameFile, filesLength }) => {
    const isDeletable = filesLength > 1;

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent tab change when deleting
        onDeleteFile(value);
    };

    const handleRenameClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent tab change when renaming
        onRenameFile(value);
    };

    return (
        <button
            onClick={onClick}
            className={`group inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-white dark:bg-neutral-950 text-neutral-950 dark:text-neutral-50 shadow-sm' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'} ${className}`}
            value={value}
        >
            <span className="mr-2">{children}</span>
            <div className="hidden group-hover:flex items-center space-x-1">
                <span
                    onClick={handleRenameClick}
                    className="p-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600"
                    title={`Rename ${value}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </span>
                {isDeletable && (
                    <span
                        onClick={handleDeleteClick}
                        className="p-0.5 rounded-full hover:bg-neutral-300 dark:hover:bg-neutral-600 text-red-500"
                        title={`Delete ${value}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>
                )}
            </div>
        </button>
    );
};

export default TabsTrigger;