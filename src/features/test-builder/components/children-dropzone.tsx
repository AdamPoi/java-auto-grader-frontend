import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableBlock } from "./sortable-block";
import { cn } from "@/lib/utils";
import type { Block } from "../data/types";

const ChildrenDropZone = ({ parentId, dropType, children }: { parentId: string, dropType: 'function' | 'assert' | 'analyze', children: Block[] }) => {
    const dropZoneConfig = {
        function: { type: 'function-drop-zone', overStyle: 'bg-indigo-200 border-indigo-500', baseStyle: 'border-indigo-300', placeholder: 'Drop Setup or Assertion Blocks Here', placeholderBg: 'bg-indigo-100', placeholderText: 'text-indigo-700' },
        assert: { type: 'assert-drop-zone', overStyle: 'bg-teal-200 border-teal-500', baseStyle: 'border-teal-300', placeholder: 'Drop Matcher Here', placeholderBg: 'bg-teal-100', placeholderText: 'text-teal-700' },
    };

    const config = dropType === 'assert' ? dropZoneConfig.assert : dropZoneConfig.function;
    const droppable = useDroppable({ id: `droppable-${config.type.replace('-drop-zone', '')}-${parentId}`, data: { type: config.type, parentId: parentId } });

    const dropZoneBaseStyle = 'ml-8 mt-1 p-3 border-l-4 rounded-r-lg transition-all duration-200';
    const placeholderStyle = `text-center text-sm p-2 rounded-md transition-opacity ${children.length > 0 ? 'opacity-0 h-0' : 'mt-3 opacity-60'} ${config.placeholderBg} ${config.placeholderText}`;

    return (
        <div ref={droppable.setNodeRef} className={cn(dropZoneBaseStyle, droppable.isOver ? config.overStyle : config.baseStyle, droppable.isOver ? 'shadow-inner' : '')}>
            <SortableContext items={children.map(c => c.id)} strategy={verticalListSortingStrategy}>
                {children.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}
            </SortableContext>
            <div className={placeholderStyle}>{config.placeholder}</div>
        </div>
    );
};

export default ChildrenDropZone;