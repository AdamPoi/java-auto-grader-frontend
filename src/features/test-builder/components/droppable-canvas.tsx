import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableCanvasProps {
    children: React.ReactNode;
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ children }) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });
    return (
        <div
            ref={setNodeRef}
            className={cn(
                'flex-grow bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-4 overflow-y-auto transition-all duration-200',
                isOver ? 'shadow-inner bg-green-50/50' : 'shadow'
            )}
        >
            {children}
        </div>
    );
};