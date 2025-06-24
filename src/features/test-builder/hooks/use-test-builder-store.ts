import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { AnyBlock, AppActions, AppState, Block, FunctionBlock, HistoricalState, OmittedBlock, RubricItem, TestSuite } from '../data/types';

type Store = AppState & AppActions;

const initialState: AppState = {
    testSuites: [{ id: 'initial-suite', name: 'MainTest', blocks: [] }],
    activeSuiteId: 'initial-suite',
    rubrics: [],
    sourceFiles: [],
    history: [],
    historyIndex: -1,
};

export const useTestBuilderStore = create<Store>()(
    subscribeWithSelector((set, get) => {
        let commitTimeout: ReturnType<typeof setTimeout> | null = null;

        const commit = () => {
            const state = get();
            const { testSuites, activeSuiteId, rubrics, sourceFiles, history, historyIndex } = state;
            const newHistory = history.slice(0, historyIndex + 1);
            const currentStateSnapshot: HistoricalState = {
                testSuites,
                activeSuiteId,
                rubrics,
                sourceFiles,
            };
            newHistory.push(currentStateSnapshot);

            set({ history: newHistory, historyIndex: newHistory.length - 1 });
        };
        let isDragging = false;
        const debouncedCommit = () => {
            if (isDragging) return;
            if (commitTimeout) {
                clearTimeout(commitTimeout);
            }
            commitTimeout = setTimeout(commit, 300);
        };

        return {
            ...initialState,

            _commit: commit,

            addBlock: (payload) => {
                const { suiteId, block, parentId, overId } = payload;
                const newBlock = { ...block, id: uuidv4(), parentId } as Block;

                set((state) => ({
                    testSuites: state.testSuites.map(suite => {
                        if (suite.id !== suiteId) return suite;
                        const newBlocks = [...suite.blocks];
                        const overIndex = overId ? newBlocks.findIndex(b => b.id === overId) : -1;

                        if (overIndex !== -1) {
                            newBlocks.splice(overIndex, 0, newBlock);
                        } else {
                            newBlocks.push(newBlock);
                        }
                        return { ...suite, blocks: newBlocks };
                    })
                }));
                debouncedCommit();
            },

            addTemplate: (payload) => {
                const { suiteId, template, overId } = payload;
                const funcId = uuidv4();
                const newFuncBlock = { ...template.func, id: funcId, parentId: null } as Block;

                set((state) => ({
                    testSuites: state.testSuites.map(suite => {
                        if (suite.id !== suiteId) return suite;
                        let newBlocks = [...suite.blocks];

                        const overIndex = overId ? newBlocks.findIndex(b => b.id === overId) : -1;
                        if (overIndex !== -1) newBlocks.splice(overIndex, 0, newFuncBlock);
                        else newBlocks.push(newFuncBlock);

                        const childrenWithIds: Block[] = [];
                        template.children.forEach((childTmpl: Omit<AnyBlock, 'id' | 'parentId'> & { children?: Array<Omit<AnyBlock, 'id' | 'parentId'>> }) => {
                            const childId = uuidv4();
                            childrenWithIds.push({ ...(childTmpl as Block), id: childId, parentId: funcId });
                            if (childTmpl.children) {
                                childTmpl.children.forEach((grandChildTmpl: Omit<AnyBlock, 'id' | 'parentId'>) => {
                                    childrenWithIds.push({ ...(grandChildTmpl as Block), id: uuidv4(), parentId: childId });
                                });
                            }
                        });
                        newBlocks.push(...childrenWithIds);
                        return { ...suite, blocks: newBlocks };
                    })
                }));
                debouncedCommit();
            },

            moveBlock: (payload) => {
                const { suiteId, activeId, overId } = payload;

                set((state) => ({
                    testSuites: state.testSuites.map(suite => {
                        if (suite.id !== suiteId) return suite;
                        const blocks = [...suite.blocks]; // Shallow copy
                        const activeIndex = blocks.findIndex(b => b.id === activeId);
                        const overIndex = blocks.findIndex(b => b.id === overId);

                        if (activeIndex === -1 || overIndex === -1) return suite;

                        // Use more efficient array manipulation
                        const [movedBlock] = blocks.splice(activeIndex, 1);
                        blocks.splice(overIndex, 0, movedBlock);

                        return { ...suite, blocks };
                    })
                }));

                // Don't commit during drag for better performance
                if (!isDragging) {
                    debouncedCommit();
                }
            },

            removeBlock: (payload) => {
                const { suiteId, id } = payload;

                set((state) => ({
                    testSuites: state.testSuites.map(suite => {
                        if (suite.id !== suiteId) return suite;
                        const idsToRemove = new Set<string>([id]);

                        const findChildren = (parentId: string) => {
                            suite.blocks.forEach(b => {
                                if (b.parentId === parentId) {
                                    idsToRemove.add(b.id);
                                    findChildren(b.id);
                                }
                            });
                        };
                        findChildren(id);

                        let newBlocks = suite.blocks.filter(b => !idsToRemove.has(b.id));
                        newBlocks = newBlocks.map(b => {
                            if ((b.type === 'FUNCTION') && (b as FunctionBlock).rubricId && idsToRemove.has((b as FunctionBlock).rubricId!)) {
                                return { ...b, rubricId: null };
                            }
                            return b;
                        });
                        return { ...suite, blocks: newBlocks };
                    })
                }));
                debouncedCommit();
            },

            updateBlockData: (payload) => {
                const { suiteId, id, field, value } = payload;

                set((state) => ({
                    testSuites: state.testSuites.map(suite => {
                        if (suite.id !== suiteId) return suite;
                        const newBlocks = suite.blocks.map(b =>
                            b.id === id ? { ...b, [field]: value } : b
                        );
                        return { ...suite, blocks: newBlocks };
                    })
                }));
            },

            setSuiteBlocks: (payload) => {
                const { suiteId, blocks } = payload;
                const blocksWithGeneratedIds = blocks.map((block: Block | OmittedBlock) => {
                    const hasId = 'id' in block && block.id;
                    const hasParentId = 'parentId' in block;

                    return {
                        ...block,
                        id: hasId ? block.id : uuidv4(),
                        parentId: hasParentId ? (block as Block).parentId : null,
                    } as Block;
                });

                set((state) => ({
                    testSuites: state.testSuites.map(suite => {
                        if (suite.id !== suiteId) return suite;
                        return { ...suite, blocks: blocksWithGeneratedIds };
                    })
                }));
                debouncedCommit();
            },

            addRubricItem: (payload) => {
                const { id, name, points } = payload || {};
                const newItem: RubricItem = {
                    id: id || uuidv4(),
                    name: name || 'New Rubric Item',
                    points: points || 10
                };

                set((state) => ({
                    rubrics: [...state.rubrics, newItem]
                }));
                debouncedCommit();
            },

            updateRubricItem: (payload) => {
                const { id, name, points } = payload;

                set((state) => ({
                    rubrics: state.rubrics.map(r =>
                        r.id === id ? { ...r, name, points } : r
                    )
                }));
                debouncedCommit();
            },

            removeRubricItem: (payload) => {
                const { id } = payload;

                set((state) => ({
                    rubrics: state.rubrics.filter(r => r.id !== id),
                    testSuites: state.testSuites.map(suite => ({
                        ...suite,
                        blocks: suite.blocks.map(b => {
                            if ((b.type === 'FUNCTION') && (b as FunctionBlock).rubricId === id) {
                                return { ...b, rubricId: null };
                            }
                            return b;
                        })
                    }))
                }));
                debouncedCommit();
            },

            setSourceFiles: (payload) => {
                set({ sourceFiles: payload });
                debouncedCommit();
            },

            addTestSuite: () => {
                const state = get();
                const newSuiteId = uuidv4();
                const newSuite: TestSuite = {
                    id: newSuiteId,
                    name: `${state.testSuites.length + 1}Test`,
                    blocks: []
                };

                set({
                    testSuites: [...state.testSuites, newSuite],
                    activeSuiteId: newSuiteId
                });
                debouncedCommit();
            },

            setActiveSuite: (payload) => {
                set({ activeSuiteId: payload });
                debouncedCommit();
            },

            updateSuiteName: (payload) => {
                const { id, name } = payload;

                set((state) => ({
                    testSuites: state.testSuites.map(s =>
                        s.id === id ? { ...s, name } : s
                    )
                }));
                debouncedCommit();
            },

            setRubrics: (payload) => {
                set({ rubrics: payload });
                debouncedCommit();
            },

            undo: () => {
                const state = get();
                if (state.historyIndex <= 0) return;

                const newIndex = state.historyIndex - 1;
                const previousHistoricalState = state.history[newIndex];

                set({
                    ...previousHistoricalState,
                    historyIndex: newIndex,
                    history: state.history // Preserve history array
                });

                if (commitTimeout) clearTimeout(commitTimeout);
            },

            redo: () => {
                const state = get();
                if (state.historyIndex >= state.history.length - 1) return;

                const newIndex = state.historyIndex + 1;
                const nextHistoricalState = state.history[newIndex];

                set({
                    ...nextHistoricalState,
                    historyIndex: newIndex,
                    history: state.history // Preserve history array
                });

                if (commitTimeout) clearTimeout(commitTimeout);
            }
        };
    })
);

// Initialize history
useTestBuilderStore.getState()._commit();