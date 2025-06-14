import { closestCenter, DndContext, DragEndEvent, PointerSensor, useDroppable, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Check, Copy, FileCode, Trash2 } from 'lucide-react';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import AppContext from '../contexts/AppContext';
import type { AnyBlock, Block, TemplateFunction } from '../types';
import { Palette } from './Palette';
import { SortableBlock } from './SortableBlock';
import { Button } from './ui/Button';

const DroppableCanvas: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setNodeRef, isOver } = useDroppable({ id: 'canvas-drop-zone' });
    return (
        <div ref={setNodeRef} className={`flex-grow bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200 p-4 overflow-y-auto transition-all duration-200 ${isOver ? 'shadow-inner bg-green-50/50' : 'shadow'}`}>
            {children}
        </div>
    );
};

const DroppableTrash: React.FC = () => {
    const { setNodeRef, isOver } = useDroppable({ id: 'trash-zone' });
    return (
        <div ref={setNodeRef} className={`p-2 rounded-full border-2 border-dashed transition-all duration-200 ${isOver ? 'bg-red-100 border-red-500 scale-110' : 'border-gray-300'}`}>
            <Trash2 className={`h-7 w-7 transition-colors ${isOver ? 'text-red-600' : 'text-gray-400'}`} />
        </div>
    );
};

export const TestBlockBuilder: React.FC = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("TestBlockBuilder must be used within an AppProvider");

    const { state, dispatch } = context;
    const { blocks } = state;

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        if (over.id === 'trash-zone' && active.data.current?.type === 'canvas-block') {
            dispatch({ type: 'REMOVE_BLOCK', payload: { id: active.id as string } }); return;
        }

        const isPaletteBlock = active.data.current?.type === 'palette-block';
        if (isPaletteBlock) {
            const blockData = active.data.current?.block as AnyBlock;
            if (blockData.type === 'TEMPLATE_FUNCTION') {
                const overIsTopLevelBlock = over.data.current?.type === 'canvas-block' && !over.data.current.block.parentId;
                dispatch({ type: 'ADD_TEMPLATE', payload: { template: blockData as TemplateFunction, overId: overIsTopLevelBlock ? over.id as string : null } }); return;
            }

            let effectiveOver = over;
            if (over.data.current?.type === 'canvas-block') {
                const overBlock = over.data.current.block as Block;
                const canDropInFunc = ['VARIABLE', 'ASSERT_THAT', 'EXCEPTION_ASSERT', 'STATIC_ASSERT'].includes(blockData.type);
                const canDropInAnalyze = blockData.type === 'STRUCTURE_CHECK';
                const canDropInAssert = ['IS_EQUAL_TO', 'IS_NOT_NULL', 'HAS_LENGTH', 'IS_INSTANCE_OF', 'CONTAINS', 'DOES_NOT_CONTAIN', 'EXTRACTING', 'MATCHES', 'STARTS_WITH', 'ENDS_WITH'].includes(blockData.type);

                let parent = blocks.find(b => b.id === overBlock.parentId);
                if (!parent && (overBlock.type === 'FUNCTION' || overBlock.type === 'ANALYZE_FUNCTION')) parent = overBlock; // Dropping on a container block itself
                while (parent) {
                    if (canDropInFunc && parent.type === 'FUNCTION') { effectiveOver = { id: `droppable-func-${parent.id}`, data: { current: { type: 'function-drop-zone', parentId: parent.id } } }; break; }
                    if (canDropInAnalyze && parent.type === 'ANALYZE_FUNCTION') { effectiveOver = { id: `droppable-func-${parent.id}`, data: { current: { type: 'function-drop-zone', parentId: parent.id } } }; break; }
                    if (canDropInAssert && ['ASSERT_THAT', 'EXTRACTING'].includes(parent.type)) { effectiveOver = { id: `droppable-assert-${parent.id}`, data: { current: { type: 'assert-drop-zone', parentId: parent.id } } }; break; }
                    parent = parent.parentId ? blocks.find(b => b.id === parent!.parentId) : undefined;
                }
            }

            const overIsFuncZone = effectiveOver.data.current?.type === 'function-drop-zone';
            const overIsAssertZone = effectiveOver.data.current?.type === 'assert-drop-zone';
            const overIsCanvas = effectiveOver.id === 'canvas-drop-zone';
            const overIsTopLevelBlock = over.data.current?.type === 'canvas-block' && !over.data.current.block.parentId;

            const parentBlockType = overIsFuncZone ? (blocks.find(b => b.id === effectiveOver.data.current!.parentId)?.type) : null;
            const canDropInFunc = ['VARIABLE', 'ASSERT_THAT', 'EXCEPTION_ASSERT', 'STATIC_ASSERT'].includes(blockData.type);
            const canDropInAnalyze = blockData.type === 'STRUCTURE_CHECK';
            const canDropInAssert = ['IS_EQUAL_TO', 'IS_NOT_NULL', 'HAS_LENGTH', 'IS_INSTANCE_OF', 'CONTAINS', 'DOES_NOT_CONTAIN', 'EXTRACTING', 'MATCHES', 'STARTS_WITH', 'ENDS_WITH'].includes(blockData.type);

            if (canDropInFunc && overIsFuncZone && parentBlockType === 'FUNCTION') {
                dispatch({ type: 'ADD_BLOCK', payload: { block: blockData, parentId: effectiveOver.data.current!.parentId, overId: over.data.current?.type === 'canvas-block' ? over.id as string : null } });
            } else if (canDropInAnalyze && overIsFuncZone && parentBlockType === 'ANALYZE_FUNCTION') {
                dispatch({ type: 'ADD_BLOCK', payload: { block: blockData, parentId: effectiveOver.data.current!.parentId, overId: over.data.current?.type === 'canvas-block' ? over.id as string : null } });
            } else if (canDropInAssert && overIsAssertZone) {
                dispatch({ type: 'ADD_BLOCK', payload: { block: blockData, parentId: effectiveOver.data.current!.parentId, overId: over.data.current?.type === 'canvas-block' ? over.id as string : null } });
            } else if (['FUNCTION', 'ANALYZE_FUNCTION'].includes(blockData.type) && (overIsCanvas || overIsTopLevelBlock)) { dispatch({ type: 'ADD_BLOCK', payload: { block: blockData, parentId: null, overId: over.data.current?.type === 'canvas-block' ? over.id as string : null } }); }
            return;
        }

        if (active.data.current?.type === 'canvas-block' && active.id !== over.id) {
            const activeBlock = blocks.find(b => b.id === active.id) as Block;
            const overBlock = blocks.find(b => b.id === over.id);
            const overIsFuncZone = over.data.current?.type === 'function-drop-zone';
            const overIsAssertZone = over.data.current?.type === 'assert-drop-zone';
            const overIsCanvas = over.id === 'canvas-drop-zone';
            const canDropInFunc = ['VARIABLE', 'ASSERT_THAT', 'EXCEPTION_ASSERT', 'STATIC_ASSERT'].includes(activeBlock.type);
            const canDropInAnalyze = activeBlock.type === 'STRUCTURE_CHECK';
            const canDropInAssert = ['IS_EQUAL_TO', 'IS_NOT_NULL', 'HAS_LENGTH', 'IS_INSTANCE_OF', 'CONTAINS', 'DOES_NOT_CONTAIN', 'EXTRACTING', 'MATCHES', 'STARTS_WITH', 'ENDS_WITH'].includes(activeBlock.type);

            if (overIsFuncZone) {
                const parentBlockType = blocks.find(b => b.id === over.data.current!.parentId)?.type;
                if (parentBlockType === 'FUNCTION' && canDropInFunc) { dispatch({ type: 'UPDATE_BLOCK_DATA', payload: { id: active.id as string, field: 'parentId', value: over.data.current!.parentId as string } }); }
                if (parentBlockType === 'ANALYZE_FUNCTION' && canDropInAnalyze) { dispatch({ type: 'UPDATE_BLOCK_DATA', payload: { id: active.id as string, field: 'parentId', value: over.data.current!.parentId as string } }); }
            } else if (overIsAssertZone && canDropInAssert) {
                dispatch({ type: 'UPDATE_BLOCK_DATA', payload: { id: active.id as string, field: 'parentId', value: over.data.current!.parentId as string } });
            } else if (activeBlock.parentId && !overIsFuncZone && !overIsAssertZone) {
                if (overIsCanvas || (overBlock && ['FUNCTION', 'ANALYZE_FUNCTION'].includes(overBlock.type))) {
                    dispatch({ type: 'UPDATE_BLOCK_DATA', payload: { id: active.id as string, field: 'parentId', value: null as any } });
                } else { return; }
            } else if (overBlock && activeBlock.parentId === overBlock.parentId) {
                dispatch({ type: 'MOVE_BLOCK', payload: { activeId: active.id as string, overId: over.id as string } });
            }
        }
    }, [dispatch, blocks]);

    const generatedCode = useMemo(() => {
        let code = 'import static org.assertj.core.api.Assertions.assertThat;\n';
        code += 'import static org.assertj.core.api.Assertions.assertThatExceptionOfType;\n\n';
        code += 'import org.junit.jupiter.api.Test;\n';
        code += 'import java.time.Duration;\n\n';
        code += 'class MyGeneratedTest {\n\n';

        const blockOrderMap = blocks.reduce((acc, block, index) => ({ ...acc, [block.id]: index }), {} as Record<string, number>);

        const generateChain = (parentId: string): string => {
            let chain = '';
            const children = blocks.filter(b => b.parentId === parentId).sort((a, b) => blockOrderMap[a.id] - blockOrderMap[b.id]);
            children.forEach(block => {
                const b = block as any;
                switch (b.type) {
                    case 'IS_EQUAL_TO': chain += `.isEqualTo(${b.value})`; break;
                    case 'IS_NOT_NULL': chain += '.isNotNull()'; break;
                    case 'HAS_LENGTH': chain += `.hasSize(${b.value})`; break;
                    case 'IS_INSTANCE_OF': chain += `.isInstanceOf(${b.value})`; break;
                    case 'CONTAINS': chain += `.contains(${b.value})`; break;
                    case 'DOES_NOT_CONTAIN': chain += `.doesNotContain(${b.value})`; break;
                    case 'EXTRACTING': chain += `.extracting(${b.value})${generateChain(b.id)}`; break;
                    case 'MATCHES': chain += `.matches(${b.value})`; break;
                    case 'STARTS_WITH': chain += `.startsWith(${b.value})`; break;
                    case 'ENDS_WITH': chain += `.endsWith(${b.value})`; break;
                }
            });
            return chain;
        }

        const topLevelBlocks = blocks.filter(b => !b.parentId).sort((a, b) => blockOrderMap[a.id] - blockOrderMap[b.id]);

        topLevelBlocks.forEach(func => {
            if (func.type === 'FUNCTION') {
                code += `    @Test\n`;
                code += `    void ${(func as any).funcName || 'unnamedTest'}() {\n`;
            } else if (func.type === 'ANALYZE_FUNCTION') {
                code += `    // Static analysis for function: ${(func as any).funcName || 'unnamed'}\n`;
            }

            const children = blocks.filter(b => b.parentId === func.id).sort((a, b) => blockOrderMap[a.id] - blockOrderMap[b.id]);
            children.forEach(block => {
                switch (block.type) {
                    case 'VARIABLE': const v = block as any; code += `        ${v.varType} ${v.varName || 'unnamedVar'} = ${v.value || 'null'};\n`; break;
                    case 'ASSERT_THAT': const a = block as any; code += `        assertThat(${a.target})${generateChain(a.id)};\n`; break;
                    case 'EXCEPTION_ASSERT': const e = block as any; code += `        assertThatExceptionOfType(${e.exceptionType}).isThrownBy(${e.code});\n`; break;
                    case 'COMMENT': code += `        ${(block as any).value}\n`; break;
                    case 'STATIC_ASSERT': const s = block as any; code += `        // Verify: ${s.checkType.replace('_', ' ').toLowerCase()} -> ${s.value}\n`; break;
                    case 'STRUCTURE_CHECK':
                        const sc = block as any;
                        switch (sc.checkType) {
                            case 'HAS_FOR_LOOP': code += `        //  - check for 'for' loop\n`; break;
                            case 'HAS_VARIABLE': code += `        //  - check for variable: ${sc.varType} ${sc.varName}\n`; break;
                            case 'HAS_PARAMETER': code += `        //  - check for parameter: ${sc.varType} ${sc.varName}\n`; break;
                            case 'RETURNS_TYPE': code += `        //  - check for return type: ${sc.varType}\n`; break;
                        }
                        break;
                }
            });

            if (func.type === 'FUNCTION') code += `    }\n\n`;
            else code += '\n';
        });
        code += '}';
        return code.trim() + '\n';
    }, [blocks]);

    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        const textArea = document.createElement('textarea');
        textArea.value = generatedCode;
        textArea.style.position = 'fixed';
        textArea.style.top = '-9999px';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try { if (document.execCommand('copy')) { setCopied(true); setTimeout(() => setCopied(false), 2000); } }
        catch (err) { console.error('Fallback: Oops, unable to copy', err); }
        document.body.removeChild(textArea);
    };

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
                <div className="flex flex-col md:flex-row h-screen bg-gray-50 font-sans text-gray-800">
                    <Palette />
                    <main className="flex-1 p-4 md:p-6 flex flex-col bg-gray-100/50" style={{ backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-700">Test Canvas</h2>
                            <DroppableTrash />
                        </div>
                        <DroppableCanvas>
                            <SortableContext items={blocks.filter(b => !b.parentId).map(b => b.id)} strategy={verticalListSortingStrategy}>
                                {blocks.filter(b => !b.parentId).length > 0 ? (
                                    blocks.filter(b => !b.parentId).map(block => <SortableBlock key={block.id} id={block.id} block={block} />)
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-400 text-lg">Drag functions or templates from the palette to start</p>
                                    </div>
                                )}
                            </SortableContext>
                        </DroppableCanvas>
                    </main>
                    <aside className="w-full md:w-1/3 p-4 md:p-6 bg-gray-800 text-gray-200 flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center"><FileCode className="mr-2" />Generated Code</h2>
                            <Button variant="secondary" size="sm" onClick={handleCopy}>
                                {copied ? <Check className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                        <pre className="flex-grow bg-gray-900 rounded-lg p-4 text-sm whitespace-pre-wrap overflow-auto language-java">
                            <code>{generatedCode}</code>
                        </pre>
                    </aside>
                </div>
            </DndContext>
        </AppContext.Provider>
    );
};