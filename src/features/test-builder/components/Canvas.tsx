import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useTestBuilderStore } from '../hooks/useTestBuilderStore';
import { DroppableTrash } from './DroppableTrash';
import { SortableBlock } from './SortableBlock';

export const Canvas = () => {
    const { blocks } = useTestBuilderStore();
    const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });

    const topLevelBlocks = blocks.filter(b => !b.parentId);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 p-4">
                <h2 className="text-2xl font-bold text-gray-700">Test Canvas</h2>
                <DroppableTrash />
            </div>
            <div
                ref={setNodeRef}
                className={cn(
                    'flex-grow bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-4 overflow-y-auto transition-all duration-200',
                    isOver ? 'shadow-inner bg-green-50/50' : 'shadow'
                )}
                style={{ backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            >
                <SortableContext items={topLevelBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {topLevelBlocks.length > 0 ? (
                        topLevelBlocks.map(block => <SortableBlock key={block.id} id={block.id} block={block} />)
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400 text-lg">Drag functions or templates here to start</p>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};