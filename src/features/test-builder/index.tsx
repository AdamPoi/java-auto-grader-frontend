import { closestCenter, DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Check, Copy, FileCode, PlusCircle, Puzzle, Redo, Search, Undo } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { INITIAL_PALETTE_BLOCKS } from '@/features/test-builder/data/palette-blocks';
import type { AnalyzeFunctionBlock, AnyBlock, AssertThatBlock, Block, FunctionBlock, TemplateFunction, VariableBlock } from '@/features/test-builder/data/types';
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
import { useAssignmentById, useUpdateAssignment } from '../assignments/hooks/use-assignment';
import type { RubricGrade, RubricGradeForm } from '../rubrics/data/types';
import { useCreateRubricGrade, useRubricGrades, useUpdateRubricGrade } from '../rubrics/hooks/use-rubric-grade';
import { generateBlockCode, generateLibraryImportCode, generateSetupCode } from './lib/block-code-generator';
import { parseJavaCodeToBlocks } from './lib/code-to-blocks';


export function TestBuilder() {
    const store = useTestBuilderStore();
    const {
        testSuites, activeSuiteId, rubrics, sourceFiles,
        history, historyIndex,
        addBlock, addTemplate, removeBlock, moveBlock, updateBlockData,
        setActiveSuite, addTestSuite, undo, redo,
        setSuiteBlocks,
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
                parentId = null; // Top-level block
            }


            addBlock({ suiteId: activeSuite.id, block: blockData, parentId, overId });
        } else if (active.data.current?.type === 'canvas-block' && active.id !== over.id) {

            const activeBlock = activeSuite.blocks.find(b => b.id === active.id) as Block;


            let newParentId: string | null = activeBlock.parentId;
            let newOverId: string | null = null;

            if (over.data.current?.type?.endsWith('-drop-zone')) {

                newParentId = over.data.current.parentId;

            } else if (over.data.current?.type === 'canvas-block') {
                const overBlock = over.data.current.block as Block;
                if (activeBlock.parentId === overBlock.parentId) {

                    moveBlock({ suiteId: activeSuite.id, activeId: active.id as string, overId: over.id as string });
                    return;
                } else if (['FUNCTION', 'ANALYZE_FUNCTION', 'ASSERT_THAT', 'EXTRACTING'].includes(overBlock.type)) {

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
    }, [activeSuite, addBlock, addTemplate, removeBlock, moveBlock, updateBlockData]);


    const generatedCode = useMemo(() => {
        if (!activeSuite) return "// No active test suite selected.";
        let code = ''
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
    const createRubricGrade = useCreateRubricGrade(
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
            const functionName = grade.arguments?.functionName || grade.name;
            if (functionName) {
                gradeMap.set(functionName, grade);
            }
        });
        return gradeMap;
    }, [existingRubricGrades, activeSuite]);


    useEffect(() => {
        if (!assignment?.testCode || !activeSuite) {
            return;
        }
        const newBlocks = parseJavaCodeToBlocks(assignment.testCode);
        const newBlocksWithRubrics = newBlocks.map(block => {
            if (block.type === 'FUNCTION' || block.type === 'ANALYZE_FUNCTION') {
                const existingGrade: RubricGrade = existingGradesByFunction.get((block as FunctionBlock | AnalyzeFunctionBlock).funcName);
                return { ...block, rubricId: existingGrade?.rubricId || undefined };
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
        const newBlocksRelevantData = newBlocksWithRubrics.map(b => ({
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

        setSuiteBlocks({ suiteId: activeSuite.id, blocks: newBlocksWithRubrics });

    }, [assignment?.testCode, activeSuite?.id, setSuiteBlocks, rubrics]);

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
    const updateGrade = useUpdateRubricGrade();

    const handleSaveRubricGrades = useCallback(async () => {
        if (!activeSuite) return;

        setIsSaving(true);

        try {
            const functionBlocksWithRubrics = activeSuite.blocks.filter(block =>
                block.type === 'FUNCTION' &&
                'rubricId' in block &&
                block.rubricId
            ) as Array<FunctionBlock & { rubricId: string }>;

            const uniqueFunctions = new Map<string, FunctionBlock & { rubricId: string }>();
            functionBlocksWithRubrics.forEach(block => {
                if (!block.rubricId) return; // Skip if rubricId is undefined
                const functionName = block.funcName || 'Test';
                if (!uniqueFunctions.has(functionName)) {
                    uniqueFunctions.set(functionName, block);
                }
            });

            const savePromises = Array.from(uniqueFunctions.values()).map(async (functionBlock) => {
                const functionName = functionBlock.funcName || 'Test';
                const existingGrade = existingGradesByFunction.get(functionName);

                try {
                    if (existingGrade) {

                        const gradeUpdateData = {
                            arguments: {
                                testSuiteId: activeSuite.id,
                                functionBlockId: functionBlock.id,
                                functionName: functionName
                            }
                        };

                        await updateGrade.mutateAsync({
                            rubricGradeId: existingGrade.id,
                            rubricGradeData: gradeUpdateData
                        });
                    } else {
                        const rubricGradeForm: RubricGradeForm = {
                            id: functionBlock.id,
                            name: `${functionName}`,
                            description: `Auto-generated rubric grade for test function: ${functionName}`,
                            displayOrder: 0,
                            arguments: {
                                testSuiteId: activeSuite.id,
                                functionBlockId: functionBlock.id,
                                functionName: functionName
                            },
                            gradeType: 'AUTOMATIC' as const,
                            assignmentId: assignmentId,
                            rubricId: functionBlock.rubricId?.toString()
                        };

                        await createRubricGrade.mutateAsync(rubricGradeForm);
                    }
                } catch (error: any) {
                    console.error(`Error processing rubric grade for ${functionName}:`, error);
                    throw error;
                }
            });

            await Promise.all(savePromises);


            if (assignmentId && generatedCode) {
                await updateAssignment.mutateAsync({
                    assignmentId: assignmentId,
                    assignmentData: {
                        testCode: generatedCode
                    }
                });
            }

        } catch (error) {
            console.error('Error saving rubric grades:', error);
        } finally {
            setIsSaving(false);
        }
    }, [activeSuite, generatedCode, createRubricGrade, updateGrade, updateAssignment, assignmentId, existingGradesByFunction]);

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
                                    disabled={!hasRubricAssignments || isSaving || isLoadingRubricGrades}
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

                        {/* Show info about rubric assignments */}
                        {hasRubricAssignments && (
                            <div className="mb-4 space-y-2">
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        {activeSuite?.blocks.filter(b => b.type === 'FUNCTION' && 'rubricId' in b && b.rubricId?.toString()).length} function(s) have rubrics assigned.
                                    </p>
                                </div>

                                {/* Show existing vs new grades */}
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
        </DndContext>
    );
}