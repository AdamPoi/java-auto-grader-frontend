import { DndContext, type DragEndEvent, DragOverlay, type DragStartEvent, PointerSensor, rectIntersection, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Check, Copy, FileCode, Puzzle, Redo, Search, Undo } from 'lucide-react';
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import { IconDeviceFloppy } from '@tabler/icons-react';
import { useParams } from '@tanstack/react-router';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { useAssignmentById, useUpdateAssignment } from '../assignments/hooks/use-assignment';
import type { RubricGrade, RubricGradeForm } from '../rubrics/data/types';
import { useRubricGrades, useSaveManyRubricGrades } from '../rubrics/hooks/use-rubric-grade';
import { BlockRenderer } from './components/block-renderer';
import { generateBlockCode, generateLibraryImportCode, generateSetupCode } from './lib/block-code-generator';
import { parseJavaCodeToBlocks } from './lib/code-to-blocks';


interface BlocksTreeContextType {
    blocksByParentId: Map<string | null, Block[]>;
    blocksById: Map<string, Block>; // Add this for efficient lookups
}
export const BlocksTreeContext = createContext<BlocksTreeContextType>({
    blocksByParentId: new Map(),
    blocksById: new Map(), // Add the new map
});


export function TestBuilder() {
    const store = useTestBuilderStore();
    const {
        rubrics,
        history, historyIndex,
        addBlock, addTemplate, removeBlock, moveBlock, updateBlockData,
        setActiveSuite, undo, redo,
        setSuiteBlocks,
    } = store;


    const testSuites = useTestBuilderStore(state => state.testSuites);
    const activeSuiteId = useTestBuilderStore(state => state.activeSuiteId);

    const activeSuite = useMemo(() => testSuites.find(s => s.id === activeSuiteId), [testSuites, activeSuiteId]);

    const { blocksByParentId, blocksById } = useMemo(() => {
        if (!activeSuite) {
            return {
                blocksByParentId: new Map<string | null, Block[]>(),
                blocksById: new Map<string, Block>()
            };
        }

        const parentIdMap = new Map<string | null, Block[]>();
        const idMap = new Map<string, Block>();

        activeSuite.blocks.forEach(block => {
            if (!parentIdMap.has(block.parentId)) {
                parentIdMap.set(block.parentId, []);
            }
        });

        activeSuite.blocks.forEach(block => {
            idMap.set(block.id, block);
            parentIdMap.get(block.parentId)!.push(block);
        });

        return { blocksByParentId: parentIdMap, blocksById: idMap };
    }, [activeSuite?.blocks]);

    const topLevelBlockIds = useMemo(() => {
        return (blocksByParentId.get(null) || []).map((b: Block) => b.id);
    }, [blocksByParentId]);


    const stableCallbacks = useRef({
        addBlock,
        addTemplate,
        removeBlock,
        moveBlock,
        updateBlockData
    }).current;

    const [searchQuery, setSearchQuery] = useState('');
    const [copied, setCopied] = useState(false);
    const [activeBlock, setActiveBlock] = useState<Block | null>(null);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        // Handle blocks dragged from the palette
        if (active.data.current?.type === 'palette-block') {
            setActiveBlock(active.data.current.block as Block);
        }
        // Handle blocks dragged from the canvas
        else if (active.data.current?.type === 'canvas-block') {
            setActiveBlock(active.data.current.block as Block);
        }
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || !activeSuite) return;

        const { addBlock, addTemplate, removeBlock, moveBlock, updateBlockData } = stableCallbacks;

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

            if (over.data.current?.type?.endsWith('-drop-zone')) {
                parentId = over.data.current.parentId;
            } else if (over.data.current?.type === 'canvas-block') {
                const overBlock = over.data.current.block as Block;

                if (['FUNCTION', 'ASSERT_THAT', 'EXTRACTING'].includes(overBlock.type)) {
                    parentId = overBlock.id;
                } else {
                    parentId = overBlock.parentId;
                    overId = overBlock.id;
                }
            } else if (over.id === 'canvas-drop-zone') {
                parentId = null; // Top-level block
            }

            addBlock({ suiteId: activeSuite.id, block: blockData, parentId, overId });
        } else if (active.data.current?.type === 'canvas-block' && active.id !== over.id) {
            const activeBlock = (blocksById.get(active.id as string) ?? activeSuite.blocks.find(b => b.id === active.id)) as Block;

            let newParentId: string | null = activeBlock.parentId;
            let newOverId: string | null = null;

            if (over.data.current?.type?.endsWith('-drop-zone')) {
                newParentId = over.data.current.parentId;
            } else if (over.data.current?.type === 'canvas-block') {
                const overBlock = over.data.current.block as Block;
                if (activeBlock.parentId === overBlock.parentId) {
                    moveBlock({ suiteId: activeSuite.id, activeId: active.id as string, overId: over.id as string });
                    return;
                } else if (['FUNCTION', 'ASSERT_THAT', 'EXTRACTING'].includes(overBlock.type)) {
                    newParentId = overBlock.id;
                } else {
                    newParentId = overBlock.parentId;
                    newOverId = overBlock.id;
                }
            } else if (over.id === 'canvas-drop-zone') {
                newParentId = null;
            }

            if (activeBlock.parentId !== newParentId || newOverId) {
                updateBlockData({ suiteId: activeSuite.id, id: active.id as string, field: 'parentId', value: newParentId });
                if (newOverId) {
                    moveBlock({ suiteId: activeSuite.id, activeId: active.id as string, overId: newOverId });
                }
            }
        }
        setActiveBlock(null);
    }, [activeSuite, addBlock, addTemplate, removeBlock, moveBlock, updateBlockData]);


    const generatedCode = useMemo(() => {
        if (!activeSuite) return "// No active test suite selected.";
        let code = ''
        code += "package workspace;"
        code += generateLibraryImportCode();
        code += `public class ${activeSuite.name} {\n\n`;
        code += generateSetupCode();

        const topLevelBlocks = activeSuite.blocks.filter(b => !b.parentId);

        topLevelBlocks.forEach(block => code += generateBlockCode(block, '    ', activeSuite));

        code += '}'; // end
        return code;
    }, [activeSuite, testSuites]);

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const [isSaving, setIsSaving] = useState(false);


    const { assignmentId } = useParams({ from: '/_authenticated/assignments/$assignmentId/' });
    const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentById(assignmentId);

    const {
        data: existingRubricGrades,
        isLoading: isLoadingRubricGrades,
        refetch: refetchRubricGrades
    } = useRubricGrades({
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentId}`,
    });


    const saveManyRubricGrades = useSaveManyRubricGrades(
        () => {
            setIsSaving(false);
            refetchRubricGrades();
            toast.success('Rubric grades saved successfully.');
        },
        (error) => {
            setIsSaving(false);
            console.error('Failed to save rubric grades:', error);
            toast.error('Failed to save rubric grades.' + error.message);
        }
    );
    const existingGradesByFunction = useMemo(() => {
        if (!existingRubricGrades || existingRubricGrades.content.length === 0 || !activeSuite) return new Map();
        const gradeMap = new Map();
        existingRubricGrades?.content.forEach(grade => {
            const functionName = `${grade.name}`;
            if (functionName) {
                gradeMap.set(functionName, grade);
            }
        });
        return gradeMap;
    }, [existingRubricGrades, activeSuite]);


    useEffect(() => {
        if (!activeSuite) {
            return;
        }

        if (!assignment?.testCode && activeSuite.blocks.length > 0) {
            setSuiteBlocks({ suiteId: activeSuite.id, blocks: [] });
            return;
        }

        if (!assignment?.testCode) {
            return;
        }

        const newBlocks = parseJavaCodeToBlocks(assignment.testCode);
        const functionIdMapping = new Map<string, string>();

        const newBlocksWithRubrics = newBlocks.map(block => {
            if (block.type === 'FUNCTION') {
                const existingGrade: RubricGrade = existingGradesByFunction.get((block as FunctionBlock).funcName);
                // console.log(existingGrade)
                const oldId = block.id;
                const newId = existingGrade?.id || uuidv4();

                functionIdMapping.set(oldId, newId);

                return {
                    ...block,
                    id: newId,
                    rubricId: existingGrade?.rubricId || undefined
                };
            }
            return block;
        });

        const finalBlocks = newBlocksWithRubrics.map(block => {
            if (block.parentId && functionIdMapping.has(block.parentId)) {
                return {
                    ...block,
                    parentId: functionIdMapping.get(block.parentId) || null
                };
            }
            return block;
        });

        const currentBlocksRelevantData = activeSuite.blocks.map(b => ({
            type: b.type,
            funcName: (b as FunctionBlock).funcName || undefined,
            varName: (b as VariableBlock).varName || undefined,
            target: (b as AssertThatBlock).target || undefined,
            value: (b as VariableBlock).value || undefined,
            parentId: b.parentId,
            rubricId: (b as FunctionBlock).rubricId?.toString() || undefined
        }));
        const newBlocksRelevantData = finalBlocks.map(b => ({
            type: b.type,
            funcName: (b as FunctionBlock).funcName || undefined,
            varName: (b as VariableBlock).varName || undefined,
            target: (b as AssertThatBlock).target || undefined,
            value: (b as VariableBlock).value || undefined,
            parentId: b.parentId,
            rubricId: (b as FunctionBlock).rubricId?.toString() || undefined
        }));

        if (JSON.stringify(currentBlocksRelevantData) === JSON.stringify(newBlocksRelevantData) && activeSuite.blocks.length > 0) {
            return;
        }

        setSuiteBlocks({ suiteId: activeSuite.id, blocks: finalBlocks });

    }, [assignment?.testCode, activeSuite?.id, setSuiteBlocks, rubrics, assignmentId]);

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


    const hasRubricAssignments = useMemo(() => {
        if (!activeSuite) return false;
        return activeSuite.blocks.some(block =>
            block.type === 'FUNCTION' &&
            'rubricId' in block &&
            block.rubricId?.toString()
        );
    }, [activeSuite]);


    const updateAssignment = useUpdateAssignment();


    const handleSaveRubricGrades = useCallback(async () => {
        if (!activeSuite) return;

        const allFunctionBlocks = activeSuite.blocks.filter(
            block => block.type === 'FUNCTION'
        ) as FunctionBlock[];

        const functionNameCounts = new Map<string, number>();
        allFunctionBlocks.forEach(block => {
            const name = block.funcName || 'Test';
            functionNameCounts.set(name, (functionNameCounts.get(name) || 0) + 1);
        });

        const duplicateNames = Array.from(functionNameCounts.entries())
            .filter(([, count]) => count > 1)
            .map(([name]) => name);

        if (duplicateNames.length > 0) {
            toast.error(`Duplicate function names found: ${duplicateNames.join(', ')}. Please ensure all function names are unique.`);
            return;
        }

        setIsSaving(true);
        try {
            // const functionBlocksWithRubrics = allFunctionBlocks.filter(block =>
            //     'rubricId' in block && block.rubricId
            // ) as Array<FunctionBlock & { rubricId: string }>;

            const rubricGradesToSave: RubricGradeForm[] = [];

            allFunctionBlocks.forEach(functionBlock => {
                const functionName = functionBlock.funcName;
                const existingGrade = Array.from(existingGradesByFunction.values()).find(
                    (grade) => grade.arguments?.functionBlockId === functionBlock.id
                );


                const baseRubricGradeForm: RubricGradeForm = {
                    id: existingGrade?.id || functionBlock.id, // Use existing grade ID if available, otherwise functionBlock.id for new
                    name: functionName,
                    description: `Auto-generated rubric grade for test function: ${functionName}`,
                    displayOrder: 0,
                    arguments: {
                        testSuiteId: activeSuite.id,
                        functionBlockId: functionBlock.id,
                        functionName: functionName
                    },
                    gradeType: 'AUTOMATIC' as const,
                    assignmentId: assignmentId,
                    rubricId: functionBlock?.rubricId ? functionBlock?.rubricId.toString() : undefined
                };

                rubricGradesToSave.push(baseRubricGradeForm);
            });

            await saveManyRubricGrades.mutateAsync({
                assignmentId: assignmentId,
                rubricGradeData: rubricGradesToSave
            });

            await updateAssignment.mutateAsync({
                assignmentId: assignmentId,
                assignmentData: { testCode: generatedCode },
            });

            toast.success('Successfully saved rubric grades and test code.');

        } catch (error) {
            console.error('Error saving rubric grades:', error);
            toast.error('Failed to save rubric grades. Please try again.');
        } finally {
            setIsSaving(false);
        }
    }, [activeSuite, generatedCode, saveManyRubricGrades, updateAssignment, assignmentId, existingGradesByFunction]);
    return (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd} onDragStart={handleDragStart} collisionDetection={rectIntersection}>
            <BlocksTreeContext.Provider value={{ blocksByParentId, blocksById }}>

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
                                    {blocks.map((block, index) =>
                                        <DraggablePaletteBlock key={`${category}-${index}`} blockData={block} />
                                    )}
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
                                <SortableContext items={topLevelBlockIds} strategy={verticalListSortingStrategy}>
                                    {(blocksByParentId.get(null) || []).length > 0 ? (
                                        (blocksByParentId.get(null) || []).map((block: Block) => {
                                            return block ?

                                                <SortableBlock key={block.id} id={block.id} block={block} /> : null;
                                        })
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

                        <div className="flex-grow pt-4 border-t mt-4 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold flex items-center text-gray-700"><FileCode className="mr-2" />Generated Test File</h2>
                                <div className="flex items-center space-x-2">
                                    <Button variant="secondary" size="sm" onClick={handleCopy}>
                                        {copied ? <Check className="mr-2 h-4 w-4 text-green-400" /> : <Copy className="mr-2 h-4 w-4" />}
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={handleSaveRubricGrades}
                                        disabled={isSaving || isLoadingRubricGrades}
                                    >
                                        {isSaving ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <IconDeviceFloppy className="mr-2 h-4 w-4" />
                                                Save
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {hasRubricAssignments && (
                                <div className="mb-4 space-y-2">
                                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-700">
                                            {activeSuite?.blocks.filter(b => b.type === 'FUNCTION' && 'rubricId' in b && b.rubricId?.toString()).length} function(s) have rubrics assigned.
                                        </p>
                                    </div>

                                    {existingRubricGrades?.content && existingRubricGrades?.content?.length > 0 && (
                                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-700">
                                                {existingRubricGrades?.content.length} existing rubric grade(s) found. Updates will be applied to existing grades, new ones will be created.
                                            </p>
                                        </div>
                                    )}

                                    {isLoadingRubricGrades && (
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                            <p className="text-sm text-gray-600">Loading existing rubric grades...</p>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="relative flex-grow">
                                <pre className="absolute inset-0 bg-gray-800 text-gray-200 rounded-lg p-4 text-sm whitespace-pre-wrap overflow-auto font-mono">
                                    <code>{generatedCode || '// Add blocks to the canvas to generate code...'}</code>
                                </pre>
                            </div>
                        </div>
                    </aside>
                </div>

                <DragOverlay>
                    {activeBlock ? (() => {
                        if (activeBlock.type === 'TEMPLATE_FUNCTION') {
                            const template = activeBlock as unknown as TemplateFunction;
                            const Icon = template.icon;
                            return (
                                <div className="flex items-center p-3 rounded-lg border-2 text-sm w-full shadow-lg bg-gray-100 border-gray-300 text-gray-700 cursor-grabbing">
                                    <Icon className="mr-3 h-5 w-5 text-gray-500" />
                                    <span className="font-medium">{template.templateName}</span>
                                </div>
                            );
                        }
                        const MemoizedBlockRenderer = React.memo(BlockRenderer);
                        return <MemoizedBlockRenderer block={activeBlock} />;
                    })() : null}
                </DragOverlay>

            </BlocksTreeContext.Provider>
        </DndContext>
    );
}