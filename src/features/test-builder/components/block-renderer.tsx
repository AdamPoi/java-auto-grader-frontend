import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import React, { useContext, useMemo } from 'react';
import { BlocksTreeContext } from '..';
import { DOCUMENTATION } from '../data/documentation';
import type { AnyBlock, Block, BlockType, OmittedBlock } from '../data/types';
import MemoizedBlockContent from './block-content';
import ChildrenDropZone from './children-dropzone';
import { HelpPopover } from './help-popover';

interface BlockRendererProps {
    block: AnyBlock | OmittedBlock;
    onDataChange?: (field: string, value: any) => void;
    onRemove?: () => void;
    isPalette?: boolean;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
    block,
    onDataChange = () => { },
    onRemove = () => { },
    isPalette = false
}) => {
    const { blocksByParentId } = useContext(BlocksTreeContext);
    const id = (block as Block).id;
    const { type } = block;

    const typeStyles: Record<string, string> = {
        FUNCTION: 'bg-indigo-100 border-indigo-300 text-indigo-800',
        FUNCTION_TEST: 'bg-emerald-100 border-emerald-300 text-emerald-800',
        STRUCTURE_CHECK: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
        STATIC_ASSERT: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
        VARIABLE: 'bg-amber-100 border-amber-300 text-amber-800',
        CASE_SOURCE: 'bg-amber-100 border-amber-300 text-amber-800',
        ASSERT_THAT: 'bg-teal-100 border-teal-300 text-teal-800',
        MATCHER: 'bg-sky-100 border-sky-300 text-sky-800',
        EXCEPTION_ASSERT: 'bg-rose-100 border-rose-300 text-rose-800',
        COMMENT: 'bg-gray-100 border-gray-300 text-gray-500 italic',
    };

    const getBlockStyle = (blockType: BlockType) => {
        const matcherTypes = [
            'IS_EQUAL_TO', 'IS_NOT_NULL', 'HAS_SIZE',
            'IS_INSTANCE_OF', 'CONTAINS', 'CONTAINS_ONLY', 'CONTAINS_EXACTLY', 'CONTAINS_EXACTLY_IN_ANY_ORDER',
            'CONTAINS_SEQUENCE', 'CONTAINS_SUBSEQUENCE', 'CONTAINS_ONLY_ONCE', 'CONTAINS_ANY_OF',
            'DOES_NOT_CONTAIN', 'EXTRACTING', 'MATCHES', 'STARTS_WITH', 'ENDS_WITH'
        ];
        if (matcherTypes.includes(blockType)) {
            return typeStyles.MATCHER;
        }
        return typeStyles[blockType as keyof typeof typeStyles] || 'bg-gray-100 border-gray-300';
    };

    const children = useMemo(() => id ? blocksByParentId.get(id) || [] : [], [id, blocksByParentId]);

    const docKey = block.type;
    const doc = DOCUMENTATION[docKey];
    const showTrashIcon = !isPalette && id;

    return (
        <div className={cn("relative rounded-lg", getBlockStyle(type as BlockType))}>
            <div className={cn("flex items-center p-3 rounded-lg border-2 text-sm w-full shadow-sm flex-wrap", getBlockStyle(type as BlockType))}>
                <MemoizedBlockContent block={block} onDataChange={onDataChange} isPalette={isPalette} />
                <div className="flex items-center ml-auto">
                    {doc && <HelpPopover doc={doc} />}
                    {showTrashIcon && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-red-100"
                            onClick={onRemove}
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" />
                        </Button>
                    )}
                </div>
            </div>

            {type === 'FUNCTION' && !isPalette && id && (
                <ChildrenDropZone parentId={id} dropType="function" children={children} />
            )}
            {type === 'TEST_CASE_FUNCTION' && !isPalette && id && (
                <ChildrenDropZone parentId={id} dropType="analyze" children={children} />
            )}
            {['ASSERT_THAT', 'EXTRACTING'].includes(type) && !isPalette && id && (
                <ChildrenDropZone parentId={id} dropType="assert" children={children} />
            )}
        </div>
    );
};