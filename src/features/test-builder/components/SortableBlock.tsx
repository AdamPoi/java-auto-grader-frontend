import { cn } from '@/lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { type FC, useCallback } from 'react';
import { useTestBuilderStore } from '../hooks/useTestBuilderStore';
import type { Block } from '../types';
import { BlockRenderer } from './BlockRenderer';

interface SortableBlockProps {
    id: string;
    block: Block;
}

export const SortableBlock: FC<SortableBlockProps> = ({ id, block }) => {
    const { updateBlockData, removeBlock } = useTestBuilderStore();
    const isChained = !!block.parentId;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: { block, type: 'canvas-block' }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease-in-out',
        zIndex: isDragging ? 100 : 1,
    };

    const handleDataChange = useCallback((field: string, value: string) => {
        updateBlockData(id, field, value);
    }, [id, updateBlockData]);

    const handleRemoveBlock = useCallback(() => {
        removeBlock(id);
    }, [id, removeBlock]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'relative flex items-center touch-none mb-3',
                isChained ? 'ml-6' : '',
                isDragging ? 'shadow-xl' : ''
            )}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <GripVertical className="h-6 w-6 text-gray-400 mr-2 flex-shrink-0" />
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