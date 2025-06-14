import React, { createContext, ReactNode, useMemo, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Action, AppContextType, AppState, Block } from '../types';

const initialState: AppState = { blocks: [] };

const appReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'ADD_BLOCK': {
            const { block, parentId, overId } = action.payload;
            const newBlock = { ...block, id: uuidv4(), parentId } as Block;
            const newBlocks = [...state.blocks];
            const overIndex = overId ? newBlocks.findIndex(b => b.id === overId) : -1;
            if (overIndex !== -1) newBlocks.splice(overIndex, 0, newBlock);
            else newBlocks.push(newBlock);
            return { ...state, blocks: newBlocks };
        }
        case 'ADD_TEMPLATE': {
            const { template, overId } = action.payload;
            const funcId = uuidv4();
            const newFuncBlock = { ...template.func, id: funcId, parentId: null } as Block;
            let newBlocks = [...state.blocks];
            const overIndex = overId ? newBlocks.findIndex(b => b.id === overId) : -1;
            if (overIndex !== -1) newBlocks.splice(overIndex, 0, newFuncBlock);
            else newBlocks.push(newFuncBlock);

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
            return { ...state, blocks: newBlocks };
        }
        case 'MOVE_BLOCK': {
            const { activeId, overId } = action.payload;
            const activeIndex = state.blocks.findIndex(b => b.id === activeId);
            const overIndex = state.blocks.findIndex(b => b.id === overId);
            if (activeIndex === -1 || overIndex === -1) return state;
            const newBlocks = Array.from(state.blocks);
            const [movedBlock] = newBlocks.splice(activeIndex, 1);
            const finalOverIndex = newBlocks.findIndex(b => b.id === overId);
            newBlocks.splice(finalOverIndex, 0, movedBlock);
            return { ...state, blocks: newBlocks };
        }
        case 'REMOVE_BLOCK': {
            const { id } = action.payload;
            const idsToRemove = new Set<string>([id]);
            const findChildren = (parentId: string) => {
                state.blocks.forEach(b => {
                    if (b.parentId === parentId) { idsToRemove.add(b.id); findChildren(b.id); }
                });
            };
            findChildren(id);
            return { ...state, blocks: state.blocks.filter(b => !idsToRemove.has(b.id)) };
        }
        case 'UPDATE_BLOCK_DATA': {
            const { id, field, value } = action.payload;
            return { ...state, blocks: state.blocks.map(b => b.id === id ? { ...b, [field]: value } : b) };
        }
        default: return state;
    }
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);
    const value = useMemo(() => ({ state, dispatch }), [state, dispatch]);

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;