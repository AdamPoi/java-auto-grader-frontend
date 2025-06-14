import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDraggable } from '@dnd-kit/core';
import type { FC } from 'react';
import { INITIAL_PALETTE_BLOCKS } from '../data/palette-blocks';
import type { AnyBlock, Block, TemplateFunction } from '../types';
import { BlockRenderer } from './BlockRenderer';
import { AllIcons } from './icons';

const PaletteBlock: FC<{ blockData: AnyBlock; blockType: string; }> = ({ blockData, blockType }) => {
    const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
        id: `palette-${blockType}-${JSON.stringify(blockData)}`,
        data: { type: 'palette-block', block: blockData },
    });

    if (blockData.type === 'TEMPLATE_FUNCTION') {
        const template = blockData as TemplateFunction;
        const Icon = AllIcons[template.icon];
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
        <div ref={setNodeRef} {...attributes} {...listeners} style={{ opacity: isDragging ? 0.5 : 1, touchAction: 'none' }} className="mb-2 transition-opacity cursor-grab">
            <BlockRenderer block={blockData as Block} isPalette />
        </div>
    );
};


export const Palette = () => {
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <AllIcons.Puzzle className="mr-2 text-blue-500" /> Blocks
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto pr-2">
                {Object.entries(INITIAL_PALETTE_BLOCKS).map(([category, blocks]) => {
                    const Icon = AllIcons[category.charAt(0).toUpperCase() + category.slice(1) as keyof typeof AllIcons] || AllIcons.Puzzle;
                    return (
                        <div key={category}>
                            <h3 className="font-semibold mb-3 mt-4 text-gray-500 flex items-center text-sm uppercase tracking-wider">
                                <Icon className="mr-2 h-5 w-5" />{category}
                            </h3>
                            {blocks.map((block, index) => (
                                <PaletteBlock key={`${category}-${index}`} blockData={block} blockType={`${category}-${index}`} />
                            ))}
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    );
};