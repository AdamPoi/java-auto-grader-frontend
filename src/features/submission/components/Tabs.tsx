import React from 'react';
import TabsList, { type TabsListProps } from './TabsList';

interface TabsProps {
    children: React.ReactNode;
    value: string | null;
    onValueChange: (value: string) => void;
    className?: string;
    onDeleteFile: (fileName: string) => void;
    onRenameFile: (fileName: string) => void;
    filesLength: number;
}

const Tabs: React.FC<TabsProps> = ({ children, value, onValueChange, className, ...props }) => {
    return (
        <div className={className}>
            {React.Children.map(children, child =>
                React.isValidElement(child) && child.type === TabsList
                    ? React.cloneElement(child as React.ReactElement<TabsListProps>, { activeTab: value, onTabChange: onValueChange, ...props })
                    : child
            )}
        </div>
    );
};

export default Tabs;