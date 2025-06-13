import React from 'react';
import TabsTrigger, { type TabsTriggerProps } from './TabsTrigger';

export interface TabsListProps {
    children: React.ReactNode;
    className?: string;
    activeTab: string | null;
    onTabChange: (value: string) => void;
    onDeleteFile: (fileName: string) => void; // Passed down from Tabs
    onRenameFile: (fileName: string) => void; // Passed down from Tabs
    filesLength: number; // Passed down from Tabs
}

const TabsList: React.FC<TabsListProps> = ({ children, className, activeTab, onTabChange, ...props }) => {
    return (
        <div className={`inline-flex h-10 items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 p-1 text-neutral-500 dark:text-neutral-400 ${className}`}>
            {React.Children.map(children, child => {
                if (React.isValidElement(child) &&
                    child.type === TabsTrigger &&
                    typeof child.props === 'object' &&
                    child.props !== null &&
                    'value' in child.props) {
                    const triggerChild = child as React.ReactElement<TabsTriggerProps>;
                    return React.cloneElement(triggerChild, {
                        isActive: triggerChild.props.value === activeTab,
                        onClick: () => onTabChange(triggerChild.props.value),
                        ...props
                    });
                }
                return child;
            })}

        </div>
    );
};

export default TabsList;