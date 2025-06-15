import { TabsTrigger } from '@/components/ui/tabs';
import React from 'react';

export interface FileTabTriggerProps {
    children: React.ReactNode;
    className?: string;
    value: string;
    onDeleteFile: (fileName: string) => void;
    onRenameFile: (fileName: string) => void;
    filesLength: number;
}

const FileTabTrigger: React.FC<FileTabTriggerProps> = ({ children, className, value, onDeleteFile, onRenameFile, filesLength, ...props }) => {
    const isDeletable = filesLength > 1;

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteFile(value);
    };

    const handleRenameClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onRenameFile(value);
    };

    return (
        <TabsTrigger
            value={value}
            className={className}
            {...props}
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
        </TabsTrigger>
    );
};

export default FileTabTrigger;