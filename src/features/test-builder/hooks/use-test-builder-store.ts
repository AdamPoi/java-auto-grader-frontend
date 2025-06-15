import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import type { AnalyzeFunctionBlock, AnyBlock, AppActions, AppState, Block, FunctionBlock, HistoricalState, RubricItem, TestSuite } from '../data/types';

type Store = AppState & AppActions;

const initialState: AppState = {
    testSuites: [{ id: 'initial-suite', name: 'TestClass1', blocks: [] }],
    activeSuiteId: 'initial-suite',
    rubrics: [],
    sourceFiles: [],
    history: [],
    historyIndex: -1,
};


const appReducer = (state: HistoricalState, action: any): HistoricalState => {
    switch (action.type) {
        case 'ADD_BLOCK': {
            const { suiteId, block, parentId, overId } = action.payload;
            const newBlock = { ...block, id: uuidv4(), parentId } as Block;
            return {
                ...state,
                testSuites: state.testSuites.map(suite => {
                    if (suite.id !== suiteId) return suite;
                    const newBlocks = [...suite.blocks];
                    const overIndex = overId ? newBlocks.findIndex(b => b.id === overId) : -1;
                    if (overIndex !== -1) newBlocks.splice(overIndex, 0, newBlock);
                    else newBlocks.push(newBlock);
                    return { ...suite, blocks: newBlocks };
                })
            };
        }
        case 'ADD_TEMPLATE': {
            const { suiteId, template, overId } = action.payload;
            const funcId = uuidv4();
            const newFuncBlock = { ...template.func, id: funcId, parentId: null } as Block;

            return {
                ...state, testSuites: state.testSuites.map(suite => {
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
            };
        }
        case 'MOVE_BLOCK': {
            const { suiteId, activeId, overId } = action.payload;
            return {
                ...state, testSuites: state.testSuites.map(suite => {
                    if (suite.id !== suiteId) return suite;
                    const activeIndex = suite.blocks.findIndex(b => b.id === activeId);
                    const overIndex = suite.blocks.findIndex(b => b.id === overId);
                    if (activeIndex === -1 || overIndex === -1) return suite;
                    const newBlocks = Array.from(suite.blocks);
                    const [movedBlock] = newBlocks.splice(activeIndex, 1);
                    const finalOverIndex = newBlocks.findIndex(b => b.id === overId);
                    newBlocks.splice(finalOverIndex, 0, movedBlock);
                    return { ...suite, blocks: newBlocks };
                })
            };
        }
        case 'REMOVE_BLOCK': {
            const { suiteId, id } = action.payload;
            return {
                ...state, testSuites: state.testSuites.map(suite => {
                    if (suite.id !== suiteId) return suite;
                    const idsToRemove = new Set<string>([id]);
                    const findChildren = (parentId: string) => {
                        suite.blocks.forEach(b => { if (b.parentId === parentId) { idsToRemove.add(b.id); findChildren(b.id); } });
                    };
                    findChildren(id);
                    let newBlocks = suite.blocks.filter(b => !idsToRemove.has(b.id));
                    newBlocks = newBlocks.map(b => {
                        if ((b.type === 'FUNCTION' || b.type === 'ANALYZE_FUNCTION') && (b as FunctionBlock | AnalyzeFunctionBlock).rubricId && idsToRemove.has((b as FunctionBlock | AnalyzeFunctionBlock).rubricId!)) {
                            return { ...b, rubricId: null };
                        }
                        return b;
                    });
                    return { ...suite, blocks: newBlocks };
                })
            };
        }
        case 'UPDATE_BLOCK_DATA': {
            const { suiteId, id, field, value } = action.payload;
            return {
                ...state, testSuites: state.testSuites.map(suite => {
                    if (suite.id !== suiteId) return suite;
                    const newBlocks = suite.blocks.map(b => b.id === id ? { ...b, [field]: value } : b);
                    return { ...suite, blocks: newBlocks };
                })
            };
        }
        case 'ADD_RUBRIC_ITEM': {
            const newItem: RubricItem = { id: uuidv4(), name: 'New Rubric Item', points: 10 };
            return { ...state, rubrics: [...state.rubrics, newItem] };
        }
        case 'UPDATE_RUBRIC_ITEM': {
            const { id, name, points } = action.payload;
            const newRubrics = state.rubrics.map(r => r.id === id ? { ...r, name, points } : r);
            return { ...state, rubrics: newRubrics };
        }
        case 'REMOVE_RUBRIC_ITEM': {
            const { id } = action.payload;
            const newRubrics = state.rubrics.filter(r => r.id !== id);
            const newTestSuites = state.testSuites.map(suite => ({
                ...suite,
                blocks: suite.blocks.map(b => {
                    if ((b.type === 'FUNCTION' || b.type === 'ANALYZE_FUNCTION') && (b as FunctionBlock | AnalyzeFunctionBlock).rubricId === id) {
                        return { ...b, rubricId: null };
                    }
                    return b;
                })
            }));
            return { ...state, testSuites: newTestSuites, rubrics: newRubrics };
        }
        case 'SET_SOURCE_FILES': {
            return { ...state, sourceFiles: action.payload };
        }
        case 'ADD_TEST_SUITE': {
            const newSuiteId = uuidv4();
            const newSuite: TestSuite = { id: newSuiteId, name: `TestClass${state.testSuites.length + 1}`, blocks: [] };
            return { ...state, testSuites: [...state.testSuites, newSuite], activeSuiteId: newSuiteId };
        }
        case 'SET_ACTIVE_SUITE': {
            return { ...state, activeSuiteId: action.payload };
        }
        case 'UPDATE_SUITE_NAME': {
            const { id, name } = action.payload;
            return { ...state, testSuites: state.testSuites.map(s => s.id === id ? { ...s, name } : s) };
        }
        default: return state;
    }
}

export const useTestBuilderStore = create<Store>((set, get) => {
    let commitTimeout: ReturnType<typeof setTimeout> | null = null;

    const commit = () => {
        set(state => {
            const { testSuites, activeSuiteId, rubrics, sourceFiles, history, historyIndex } = state;
            const newHistory = history.slice(0, historyIndex + 1);
            const currentStateSnapshot: HistoricalState = {
                testSuites,
                activeSuiteId,
                rubrics,
                sourceFiles,
            };
            newHistory.push(currentStateSnapshot);
            return { history: newHistory, historyIndex: newHistory.length - 1 };
        });
    };

    const debouncedCommit = () => {
        if (commitTimeout) {
            clearTimeout(commitTimeout);
        }
        commitTimeout = setTimeout(commit, 300); // 300ms
    };

    const dispatch = (action: any, shouldCommit = true) => {
        set(state => {
            const currentStateForReducer: HistoricalState = {
                testSuites: state.testSuites,
                activeSuiteId: state.activeSuiteId,
                rubrics: state.rubrics,
                sourceFiles: state.sourceFiles,
            };
            const newHistoricalState = appReducer(currentStateForReducer, action);
            return {
                ...state,
                ...newHistoricalState
            };
        });
        if (shouldCommit) {
            debouncedCommit();
        }
    };

    return {
        ...initialState,
        _commit: commit,
        addBlock: (payload) => { dispatch({ type: 'ADD_BLOCK', payload }); },
        addTemplate: (payload) => { dispatch({ type: 'ADD_TEMPLATE', payload }); },
        moveBlock: (payload) => { dispatch({ type: 'MOVE_BLOCK', payload }); },
        removeBlock: (payload) => { dispatch({ type: 'REMOVE_BLOCK', payload }); },
        updateBlockData: (payload) => { dispatch({ type: 'UPDATE_BLOCK_DATA', payload }, false); },
        addRubricItem: () => { dispatch({ type: 'ADD_RUBRIC_ITEM' }); },
        updateRubricItem: (payload) => { dispatch({ type: 'UPDATE_RUBRIC_ITEM', payload }); },
        removeRubricItem: (payload) => { dispatch({ type: 'REMOVE_RUBRIC_ITEM', payload }); },
        setSourceFiles: (payload) => { dispatch({ type: 'SET_SOURCE_FILES', payload }); },
        addTestSuite: () => { dispatch({ type: 'ADD_TEST_SUITE' }); },
        setActiveSuite: (payload) => { dispatch({ type: 'SET_ACTIVE_SUITE', payload }); },
        updateSuiteName: (payload) => { dispatch({ type: 'UPDATE_SUITE_NAME', payload }); },
        undo: () => {
            set(state => {
                if (state.historyIndex <= 0) return {};
                const newIndex = state.historyIndex - 1;
                const previousHistoricalState = state.history[newIndex];
                return { ...state, ...previousHistoricalState, historyIndex: newIndex };
            });
            if (commitTimeout) clearTimeout(commitTimeout);
        },
        redo: () => {
            set(state => {
                if (state.historyIndex >= state.history.length - 1) return {};
                const newIndex = state.historyIndex + 1;
                const nextHistoricalState = state.history[newIndex];
                return { ...state, ...nextHistoricalState, historyIndex: newIndex };
            });
            if (commitTimeout) clearTimeout(commitTimeout);
        }
    };
});

// Initialize history
useTestBuilderStore.getState()._commit();