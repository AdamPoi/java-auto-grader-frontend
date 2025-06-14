import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { DragEndEvent } from '@dnd-kit/core';
import type { Block, AnyBlock, TemplateFunction } from '../types';

interface TestBuilderState {
    blocks: Block[];
    addBlock: (block: Omit<AnyBlock, 'id' | 'parentId'>, parentId: string | null, overId: string | null) => void;
    addTemplate: (template: TemplateFunction, overId: string | null) => void;
    moveBlock: (activeId: string, overId: string) => void;
    removeBlock: (id: string) => void;
    updateBlockData: (id: string, field: string, value: any) => void;
    handleDragEnd: (event: DragEndEvent) => void;
}

export const useTestBuilderStore = create<TestBuilderState>((set, get) => ({
    blocks: [],

    addBlock: (block, parentId, overId) => set(state => {
        const newBlock = { ...block, id: uuidv4(), parentId } as Block;
        const newBlocks = [...state.blocks];
        const overIndex = overId ? newBlocks.findIndex(b => b.id === overId) : -1;
        if (overIndex !== -1) {
            newBlocks.splice(overIndex, 0, newBlock);
        } else {
            newBlocks.push(newBlock);
        }
        return { blocks: newBlocks };
    }),

    addTemplate: (template, overId) => set(state => {
        const funcId = uuidv4();
        const newFuncBlock = { ...template.func, id: funcId, parentId: null } as Block;
        let newBlocks = [...state.blocks];

        const overIndex = overId ? newBlocks.findIndex(b => b.id === overId) : -1;
        if (overIndex !== -1) {
            newBlocks.splice(overIndex, 0, newFuncBlock);
        } else {
            newBlocks.push(newFuncBlock);
        }

        const childrenWithIds: Block[] = [];
        template.children.forEach(childTmpl => {
            const childId = uuidv4();
            childrenWithIds.push({ ...childTmpl, id: childId, parentId: funcId } as Block);
            if (childTmpl.children) {
                childTmpl.children.forEach(grandChildTmpl => {
                    childrenWithIds.push({ ...grandChildTmpl, id: uuidv4(), parentId: childId } as Block);
                });
            }
        });
        newBlocks.push(...childrenWithIds);
        return { blocks: newBlocks };
    }),

    moveBlock: (activeId, overId) => set(state => {
        const activeIndex = state.blocks.findIndex(b => b.id === activeId);
        const overIndex = state.blocks.findIndex(b => b.id === overId);
        if (activeIndex === -1 || overIndex === -1) return state;

        const newBlocks = Array.from(state.blocks);
        const [movedBlock] = newBlocks.splice(activeIndex, 1);
        const finalOverIndex = newBlocks.findIndex(b => b.id === overId); // re-find index after splice
        newBlocks.splice(finalOverIndex, 0, movedBlock);

        return { blocks: newBlocks };
    }),

    removeBlock: (id) => set(state => {
        const idsToRemove = new Set<string>([id]);
        const findChildren = (parentId: string) => {
            state.blocks.forEach(b => {
                if (b.parentId === parentId) {
                    idsToRemove.add(b.id);
                    findChildren(b.id);
                }
            });
        };
        findChildren(id);
        return { blocks: state.blocks.filter(b => !idsToRemove.has(b.id)) };
    }),

    updateBlockData: (id, field, value) => set(state => ({
        blocks: state.blocks.map(b => b.id === id ? { ...b, [field]: value } : b),
    })),

    handleDragEnd: (event: DragEndEvent) => {
        const { active, over } = event;
        const { blocks, addBlock, addTemplate, removeBlock, updateBlockData, moveBlock } = get();

        if (!over) return;

        // Scenario 1: Dragging a canvas block to the trash
        if (over.id === 'trash-zone' && active.data.current?.type === 'canvas-block') {
            removeBlock(active.id as string);
            return;
        }

        const isPaletteBlock = active.data.current?.type === 'palette-block';
        const isCanvasBlock = active.data.current?.type === 'canvas-block';

        // Scenario 2: Dragging from the palette to the canvas
        if (isPaletteBlock) {
            const blockData = active.data.current?.block as AnyBlock;
            const overId = over.data.current?.type === 'canvas-block' ? over.id as string : null;

            if (blockData.type === 'TEMPLATE_FUNCTION') {
                const overIsTopLevelBlock = over.data.current?.type === 'canvas-block' && !over.data.current.block.parentId;
                addTemplate(blockData as TemplateFunction, overIsTopLevelBlock ? over.id as string : null);
                return;
            }

            // Determine correct drop zone (main canvas, function, or assert)
            const parentId = over.data.current?.parentId;
            const overIsFuncZone = over.data.current?.type === 'function-drop-zone';
            const overIsAssertZone = over.data.current?.type === 'assert-drop-zone';
            const overIsCanvas = over.id === 'canvas-drop-zone';

            const parentBlockType = parentId ? blocks.find(b => b.id === parentId)?.type : null;

            // Define drop rules
            const canDropInFunc = ['VARIABLE', 'ASSERT_THAT', 'EXCEPTION_ASSERT', 'STATIC_ASSERT'].includes(blockData.type);
            const canDropInAnalyze = blockData.type === 'STRUCTURE_CHECK';
            const canDropInAssert = !['FUNCTION', 'ANALYZE_FUNCTION', 'VARIABLE', 'ASSERT_THAT', 'EXCEPTION_ASSERT', 'STATIC_ASSERT', 'STRUCTURE_CHECK', 'COMMENT'].includes(blockData.type);

            if (overIsFuncZone && parentId) {
                if ((parentBlockType === 'FUNCTION' && canDropInFunc) || (parentBlockType === 'ANALYZE_FUNCTION' && canDropInAnalyze)) {
                    addBlock(blockData, parentId, overId);
                }
            } else if (overIsAssertZone && parentId && canDropInAssert) {
                addBlock(blockData, parentId, overId);
            } else if (['FUNCTION', 'ANALYZE_FUNCTION'].includes(blockData.type) && (overIsCanvas || !over.data.current?.block?.parentId)) {
                addBlock(blockData, null, overId);
            }
            return;
        }

        // Scenario 3: Moving a block within the canvas
        if (isCanvasBlock && active.id !== over.id) {
            const activeBlock = active.data.current?.block as Block;
            const overBlock = over.data.current?.block as Block;
            const newParentId = over.data.current?.parentId as string | null;

            const overIsFuncZone = over.data.current?.type === 'function-drop-zone';
            const overIsAssertZone = over.data.current?.type === 'assert-drop-zone';

            // Reparenting logic
            if ((overIsFuncZone || overIsAssertZone) && activeBlock.parentId !== newParentId) {
                updateBlockData(active.id as string, 'parentId', newParentId);
            } else if (activeBlock.parentId && over.id === 'canvas-drop-zone') {
                // Un-parenting to top level
                updateBlockData(active.id as string, 'parentId', null);
            } else if (activeBlock.parentId === overBlock?.parentId) {
                // Sorting within the same container
                moveBlock(active.id as string, over.id as string);
            }
        }
    }
}));