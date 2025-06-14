import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import React, { useContext } from 'react';
import AppContext from '../contexts/AppContext';
import type { Block } from '../types';
import { BlockRenderer } from './BlockRenderer';

interface SortableBlockProps {
    id: string;
    block: Block;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ id, block }) => {
    const context = useContext(AppContext);
    if (!context) throw new Error("SortableBlock must be used within an AppProvider");
    const { state, dispatch } = context;

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        data: { block, type: 'canvas-block' }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 250ms ease-in-out',
        zIndex: isDragging ? 100 : 1,
        boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : 'var(--tw-shadow)',
    };

    const handleDataChange = (field: string, value: string) => {
        dispatch({ type: 'UPDATE_BLOCK_DATA', payload: { id, field, value } });
    };

    const handleRemoveBlock = () => {
        dispatch({ type: 'REMOVE_BLOCK', payload: { id } });
    };

    const isChained = !!state.blocks.find(b => b.id === id)?.parentId;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`relative flex items-center touch-none cursor-grab active:cursor-grabbing mb-3 rounded-lg ${isChained ? 'ml-6' : ''}`}>
            <GripVertical className="h-6 w-6 text-gray-400 mr-2 flex-shrink-0" />
            <div className="flex-grow">
                <BlockRenderer block={block} onDataChange={handleDataChange} onRemove={handleRemoveBlock} />
            </div>
        </div>
    );
};