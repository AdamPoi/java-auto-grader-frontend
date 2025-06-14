import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { Trash2 } from 'lucide-react';
import { type FC } from 'react';

export const DroppableTrash: FC = () => {
    const { setNodeRef, isOver } = useDroppable({ id: 'trash-zone' });
    return (
        <div ref={setNodeRef} className={cn(
            'p-2 rounded-full border-2 border-dashed transition-all duration-200',
            isOver ? 'bg-red-100 border-red-500 scale-110' : 'border-gray-300'
        )}>
            <Trash2 className={cn('h-7 w-7 transition-colors', isOver ? 'text-red-600' : 'text-gray-400')} />
        </div>
    );
};