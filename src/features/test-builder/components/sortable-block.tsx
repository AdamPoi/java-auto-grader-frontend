import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import React, { useCallback } from 'react';
import type { Block } from '../data/types';
import { useTestBuilderStore } from '../hooks/use-test-builder-store';
import { BlockRenderer } from './block-renderer';

interface SortableBlockProps {
    id: string;
    block: Block;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ id, block }) => {
    const { activeSuiteId, updateBlockData, removeBlock, testSuites } = useTestBuilderStore();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: { block, type: 'canvas-block' }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease-in-out',
        zIndex: isDragging ? 100 : 1,
        boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'var(--tw-shadow)'
    };

    const handleDataChange = useCallback((field: string, value: any) => {
        if (activeSuiteId) {
            updateBlockData({ suiteId: activeSuiteId, id, field, value });
        }
    }, [activeSuiteId, id, updateBlockData]);

    const handleRemoveBlock = useCallback(() => {
        if (activeSuiteId) {
            removeBlock({ suiteId: activeSuiteId, id });
        }
    }, [activeSuiteId, id, removeBlock]);

    const isChained = !!testSuites.flatMap(s => s.blocks).find(b => b.id === id)?.parentId;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={cn('relative flex items-center touch-none mb-3 rounded-lg', isChained ? 'ml-6' : '')}
        >
            <div {...listeners} className="cursor-grab active:cursor-grabbing p-2">
                <GripVertical className="h-6 w-6 text-gray-400 flex-shrink-0" />
            </div>
            <div className="flex-grow">
                <BlockRenderer
                    block={block}
                    onDataChange={handleDataChange}
                    onRemove={handleRemoveBlock}
                />
            </div>
        </div>
    );
};