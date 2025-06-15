import { useDraggable } from '@dnd-kit/core';
import React from 'react';
import type { OmittedBlock, TemplateFunction } from '../data/types';
import { BlockRenderer } from './block-renderer';

interface PaletteBlockProps {
    blockData: OmittedBlock | TemplateFunction;
}

export const DraggablePaletteBlock: React.FC<PaletteBlockProps> = ({ blockData }) => {
    const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
        id: `palette-${blockData.type}-${JSON.stringify(blockData)}`,
        data: { type: 'palette-block', block: blockData },
    });

    const style = {
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none'
    };

    if (blockData.type === 'TEMPLATE_FUNCTION') {
        const template = blockData as TemplateFunction;
        const Icon = template.icon;
        return (
            <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="mb-2 transition-opacity">
                <div className="flex items-center p-3 rounded-lg border-2 text-sm w-full shadow-sm bg-gray-100 border-gray-300 text-gray-700 cursor-grab">
                    <Icon className="mr-3 h-5 w-5 text-gray-500" />
                    <span className="font-medium">{template.templateName}</span>
                </div>
            </div>
        );
    }

    return (
        <div ref={setNodeRef} {...attributes} {...listeners} style={style} className="mb-2 transition-opacity cursor-grab">
            <BlockRenderer block={blockData} isPalette />
        </div>
    );
};