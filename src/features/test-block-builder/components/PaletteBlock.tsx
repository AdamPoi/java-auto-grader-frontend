import { useDraggable } from '@dnd-kit/core';
import React from 'react';
import { AnyBlock } from '../types';
import { BlockRenderer } from './BlockRenderer';

interface PaletteBlockProps {
    blockData: AnyBlock;
    blockType: string;
}

export const PaletteBlock: React.FC<PaletteBlockProps> = ({ blockData, blockType }) => {
    const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
        id: `palette-${blockType}-${JSON.stringify(blockData)}`,
        data: { type: 'palette-block', block: blockData },
    });

    if (blockData.type === 'TEMPLATE_FUNCTION') {
        const template = blockData as any;
        const Icon = template.icon;
        return (
            <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.5 : 1, touchAction: 'none' }} className="mb-2 transition-opacity">
                <div className="flex items-center p-3 rounded-lg border-2 text-sm w-full shadow-sm bg-gray-100 border-gray-300 text-gray-700 cursor-grab">
                    <Icon className="mr-3 h-5 w-5 text-gray-500" />
                    <span className="font-medium">{template.templateName}</span>
                </div>
            </div>
        )
    }

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.5 : 1, touchAction: 'none' }} className="mb-2 transition-opacity">
            <BlockRenderer block={blockData as any} isPalette />
        </div>
    );
};