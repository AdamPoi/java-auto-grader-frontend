import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Check, Copy, FileCode, PlusCircle, Puzzle, Redo, Search, Undo } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { INITIAL_PALETTE_BLOCKS } from '@/features/test-builder/data/palette-blocks';
import type { AnyBlock, AssertThatBlock, Block, FunctionBlock, TemplateFunction, VariableBlock } from '@/features/test-builder/data/types';
import { useTestBuilderStore } from '@/features/test-builder/hooks/use-test-builder-store';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { DraggablePaletteBlock } from '@/features/test-builder/components/draggable-palette-block';
import { DroppableCanvas } from '@/features/test-builder/components/droppable-canvas';
import { DroppableTrash } from '@/features/test-builder/components/droppable-trash';
import { RubricPanel } from '@/features/test-builder/components/rubric-panel';
import { SortableBlock } from '@/features/test-builder/components/sortable-block';
import { SourceFilePanel } from '@/features/test-builder/components/source-file-panel';


export function TestBuilder() {
    const store = useTestBuilderStore();
    const {
        testSuites, activeSuiteId, rubrics, sourceFiles,
        history, historyIndex,
        addBlock, addTemplate, removeBlock, moveBlock, updateBlockData,
        setActiveSuite, addTestSuite, undo, redo,
    } = store;

    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const activeSuite = useMemo(() => testSuites.find(s => s.id === activeSuiteId), [testSuites, activeSuiteId]);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !activeSuite) return;

        if (over.id === 'trash-zone' && active.data.current?.type === 'canvas-block') {
            removeBlock({ suiteId: activeSuite.id, id: active.id as string });
            return;
        }

        const isPaletteBlock = active.data.current?.type === 'palette-block';
        if (isPaletteBlock) {
            const blockData = active.data.current?.block as AnyBlock;
            if (blockData.type === 'TEMPLATE_FUNCTION') {
                const templateBlock = blockData as TemplateFunction;
                const overIsTopLevelBlock = over.data.current?.type === 'canvas-block' && !over.data.current.block.parentId;
                addTemplate({ suiteId: activeSuite.id, template: templateBlock, overId: overIsTopLevelBlock ? over.id as string : null });
                return;
            }

            let parentId: string | null = null;
            let overId: string | null = null;

            if (over.data.current?.type.endsWith('-drop-zone')) {
                parentId = over.data.current.parentId;
            } else if (over.data.current?.type === 'canvas-block') {
                const overBlock = over.data.current.block as Block;
                if (['FUNCTION', 'ANALYZE_FUNCTION', 'ASSERT_THAT', 'EXTRACTING'].includes(overBlock.type)) {
                    parentId = overBlock.id;
                } else {
                    parentId = overBlock.parentId;
                    overId = overBlock.id;
                }
            } else if (over.id === 'canvas-drop-zone') {
                parentId = null;
            }

            addBlock({ suiteId: activeSuite.id, block: blockData, parentId, overId });
        } else if (active.data.current?.type === 'canvas-block' && active.id !== over.id) {
            const activeBlock = activeSuite.blocks.find(b => b.id === active.id) as Block;
            let newParentId: string | null = activeBlock.parentId;

            if (over.data.current?.type?.endsWith('-drop-zone')) {
                newParentId = over.data.current.parentId;
                updateBlockData({ suiteId: activeSuite.id, id: active.id as string, field: 'parentId', value: newParentId });
            } else if (over.data.current?.type === 'canvas-block') {
                const overBlock = over.data.current.block as Block;
                if (activeBlock.parentId === overBlock.parentId) {
                    moveBlock({ suiteId: activeSuite.id, activeId: active.id as string, overId: over.id as string });
                } else {
                    updateBlockData({ suiteId: activeSuite.id, id: active.id as string, field: 'parentId', value: overBlock.parentId });
                }
            } else if (over.id === 'canvas-drop-zone') {
                updateBlockData({ suiteId: activeSuite.id, id: active.id as string, field: 'parentId', value: null });
            }
        }
    }, [activeSuite, addBlock, addTemplate, removeBlock, moveBlock, updateBlockData]);

    const generatedCode = useMemo(() => {
        if (!activeSuite) return "// No active test suite selected.";
        let code = `import static org.assertj.core.api.Assertions.assertThat;\n`;
        code += `import org.junit.jupiter.api.Test;\n\n`;
        code += `class ${activeSuite.name} {\n\n`;

        const topLevelBlocks = activeSuite.blocks.filter(b => !b.parentId);

        const generateBlockCode = (block: Block, indent: string): string => {
            let blockCode = "";
            switch (block.type) {
                case 'FUNCTION':
                    const funcBlock = block as FunctionBlock;
                    const children = activeSuite.blocks.filter(b => b.parentId === funcBlock.id);
                    blockCode += `${indent}@Test\n`;
                    blockCode += `${indent}void ${funcBlock.funcName}() {\n`;
                    children.forEach(child => blockCode += generateBlockCode(child, indent + '    '));
                    blockCode += `${indent}}\n\n`;
                    break;
                case 'VARIABLE':
                    const varBlock = block as VariableBlock;
                    blockCode += `${indent}${varBlock.varType} ${varBlock.varName} = ${varBlock.value};\n`;
                    break;
                case 'ASSERT_THAT':
                    const assertBlock = block as AssertThatBlock;
                    const matchers = activeSuite.blocks.filter(b => b.parentId === assertBlock.id);
                    let chain = matchers.map(m => `.${m.type.toLowerCase()}()`).join('');
                    blockCode += `${indent}assertThat(${assertBlock.target})${chain};\n`;
                    break;
            }
            return blockCode;
        }

        topLevelBlocks.forEach(block => code += generateBlockCode(block, '    '));

        code += '}';
        return code;
    }, [activeSuite, testSuites]);


    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const filteredPalette = useMemo(() => {
        if (!searchQuery) return INITIAL_PALETTE_BLOCKS;
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered: typeof INITIAL_PALETTE_BLOCKS = {
            templates: [],
            functions: [],
            setup: [],
            assertions: [],
            structure: [],
            matchers: [],
        };

        for (const category of Object.keys(INITIAL_PALETTE_BLOCKS) as Array<keyof typeof INITIAL_PALETTE_BLOCKS>) {
            const blocks = INITIAL_PALETTE_BLOCKS[category];
            const filteredBlocks = blocks.filter(block => {
                if (block.type === 'TEMPLATE_FUNCTION') {
                    return (block as TemplateFunction).templateName.toLowerCase().includes(lowerCaseQuery);
                }
                return JSON.stringify(block).toLowerCase().includes(lowerCaseQuery);
            });
            (filtered[category] as any) = filteredBlocks;
        }
        return filtered;
    }, [searchQuery]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
            <div className="flex h-screen bg-gray-50 font-sans text-gray-800">
                {/* Left Palette */}
                <aside className="w-72 p-4 bg-white border-r border-gray-200 flex flex-col">
                    <h2 className="text-xl font-bold mb-4 flex items-center text-gray-700"><Puzzle className="mr-2 text-blue-500" />Blocks</h2>
                    <div className="relative mb-4">
                        <Input type="text" placeholder="Search blocks..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-grow overflow-y-auto pr-2">
                        {Object.entries(filteredPalette).map(([category, blocks]) => (
                            <div key={category}>
                                <h3 className="font-semibold mb-3 mt-4 text-gray-500 text-sm uppercase tracking-wider">{category}</h3>
                                {blocks.map((block, index) => <DraggablePaletteBlock key={`${category}-${index}`} blockData={block} />)}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Center Canvas */}
                <main className="flex-1 p-6 flex flex-col bg-gray-100/50" style={{ backgroundImage: 'radial-gradient(#ddd 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center border bg-white rounded-lg">
                                {testSuites.map(suite => (
                                    <button key={suite.id} onClick={() => setActiveSuite(suite.id)} className={`px-4 py-2 text-sm font-medium border-r last:border-r-0 ${activeSuiteId === suite.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}>
                                        {suite.name}
                                    </button>
                                ))}
                                <Button size="sm" variant="ghost" onClick={addTestSuite} className="px-3 rounded-l-none"> <PlusCircle className="h-4 w-4" /> </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button size="sm" variant="outline" onClick={undo} disabled={!canUndo}> <Undo className="h-4 w-4 mr-2" /> Undo </Button>
                                <Button size="sm" variant="outline" onClick={redo} disabled={!canRedo}> <Redo className="h-4 w-4 mr-2" /> Redo </Button>
                            </div>
                        </div>
                        <DroppableTrash />
                    </div>
                    <DroppableCanvas>
                        {activeSuite && (
                            <SortableContext items={activeSuite.blocks.filter(b => !b.parentId).map(b => b.id)} strategy={verticalListSortingStrategy}>
                                {activeSuite.blocks.filter(b => !b.parentId).length > 0 ? (
                                    activeSuite.blocks.filter(b => !b.parentId).map(block => <SortableBlock key={block.id} id={block.id} block={block} />)
                                ) : (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-gray-400 text-lg">Drag functions or templates here to start</p>
                                    </div>
                                )}
                            </SortableContext>
                        )}
                    </DroppableCanvas>
                </main>

                {/* Right Panel */}
                <aside className="w-96 p-6 bg-white border-l border-gray-200 flex flex-col">
                    <RubricPanel />
                    <SourceFilePanel />
                    <div className="flex-grow pt-4 border-t mt-4 flex flex-col min-h-0">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center text-gray-700"><FileCode className="mr-2" />Generated Test File</h2>
                            <Button variant="secondary" size="sm" onClick={handleCopy} disabled={!generatedCode}>
                                {copied ? <Check className="mr-2 h-4 w-4 text-green-40_0" /> : <Copy className="mr-2 h-4 w-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </Button>
                        </div>
                        <div className="relative flex-grow">
                            <pre className="absolute inset-0 bg-gray-800 text-gray-200 rounded-lg p-4 text-sm whitespace-pre-wrap overflow-auto font-mono">
                                <code>{generatedCode || '// Add blocks to the canvas to generate code...'}</code>
                            </pre>
                        </div>
                    </div>
                </aside>
            </div>
        </DndContext>
    );
}