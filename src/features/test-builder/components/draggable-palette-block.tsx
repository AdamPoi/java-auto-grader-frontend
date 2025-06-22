import { useDraggable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import React from 'react';
import { DOCUMENTATION } from '../data/documentation';
import type { OmittedBlock, TemplateFunction } from '../data/types';
import { useTestBuilderStore } from '../hooks/use-test-builder-store';
import { BlockRenderer } from './block-renderer';
import { HelpPopover } from './help-popover';

interface PaletteBlockProps {
    blockData: OmittedBlock | TemplateFunction;
}

export const DraggablePaletteBlock: React.FC<PaletteBlockProps> = ({ blockData }) => {
    const { addBlock, addTemplate, activeSuiteId } = useTestBuilderStore();

    const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
        id: `palette-${blockData.type}-${JSON.stringify(blockData)}`,
        data: { type: 'palette-block', block: blockData },
    });

    const handleBlockClick = () => {
        if (!activeSuiteId) return;

        if (blockData.type === 'TEMPLATE_FUNCTION') {
            addTemplate({
                suiteId: activeSuiteId,
                template: blockData as TemplateFunction,
                overId: null,
            });
        } else {
            addBlock({
                suiteId: activeSuiteId,
                block: blockData as OmittedBlock,
                parentId: null,
                overId: null,
            });
        }
    };

    const style = {
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none'
    };

    if (blockData.type === 'TEMPLATE_FUNCTION') {
        const template = blockData as TemplateFunction;
        const Icon = template.icon;
        const docKey = template.templateName;
        const doc = DOCUMENTATION[docKey];

        return (
            <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                onClick={handleBlockClick}
                style={style}
                className="mb-2 transition-opacity relative group"
            >
                <div className="flex items-center p-3 rounded-lg border-2 text-sm w-full shadow-sm bg-gray-100 border-gray-300 text-gray-700 cursor-pointer group-hover:border-blue-400 transition-colors">
                    <Icon className="mr-3 h-5 w-5 text-gray-500" />
                    <span className="font-medium">{template.templateName}</span>
                    <span className='ml-auto'> {doc && <HelpPopover doc={doc} />}</span>
                </div>
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="flex flex-col items-center gap-1">
                        <Plus className="text-blue-500 h-6 w-6" />
                        <span className="text-xs text-gray-600 font-medium">Click to add or hold to drag</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            onClick={handleBlockClick}
            style={style}
            className="mb-2 transition-opacity cursor-pointer overflow-hidden relative group"
        >
            <BlockRenderer block={blockData} isPalette />
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-has-[:hover]:group-has-[[data-state=open]]:opacity-0 group-has-[[data-state=open]]:opacity-0">
                <div className="flex flex-col items-center gap-1">
                    <Plus className="text-blue-500 h-6 w-6" />
                    <span className="text-xs text-gray-600 font-medium">Click to add or hold to drag</span>
                </div>
            </div>
        </div>
    );
};