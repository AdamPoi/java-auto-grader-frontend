import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2 } from 'lucide-react';
import { type FC } from 'react';
import { useTestBuilderStore } from '../hooks/useTestBuilderStore';
import type { AnalyzeFunctionBlock, AnyBlock, AssertThatBlock, Block, BlockType, CommentBlock, ExceptionAssertBlock, FunctionBlock, MatcherBlock, StaticAssertBlock, StructureCheckBlock, VariableBlock } from '../types';
import { SortableBlock } from './SortableBlock';

interface BlockRendererProps {
    block: AnyBlock;
    onDataChange?: (field: string, value: string) => void;
    onRemove?: () => void;
    isPalette?: boolean;
}

export const BlockRenderer: FC<BlockRendererProps> = ({ block, onDataChange = () => { }, onRemove = () => { }, isPalette = false }) => {
    const { blocks } = useTestBuilderStore();
    const { id, type } = block;

    const typeStyles: Record<string, string> = {
        FUNCTION: 'bg-indigo-100 border-indigo-300 text-indigo-800',
        ANALYZE_FUNCTION: 'bg-purple-100 border-purple-300 text-purple-800',
        STRUCTURE_CHECK: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800',
        STATIC_ASSERT: 'bg-gray-100 border-gray-300 text-gray-800',
        VARIABLE: 'bg-amber-100 border-amber-300 text-amber-800',
        ASSERT_THAT: 'bg-teal-100 border-teal-300 text-teal-800',
        MATCHER: 'bg-sky-100 border-sky-300 text-sky-800',
        EXCEPTION_ASSERT: 'bg-rose-100 border-rose-300 text-rose-800',
        COMMENT: 'bg-gray-100 border-gray-300 text-gray-500 italic',
    };

    const getBlockStyle = (blockType: BlockType) => {
        if (blockType.startsWith('IS_') || ['HAS_LENGTH', 'CONTAINS', 'DOES_NOT_CONTAIN', 'EXTRACTING', 'MATCHES', 'STARTS_WITH', 'ENDS_WITH'].includes(blockType)) return typeStyles.MATCHER;
        return typeStyles[blockType as keyof typeof typeStyles] || 'bg-gray-100 border-gray-300';
    };

    const droppableFunction = useDroppable({ id: `droppable-func-${id}`, data: { type: 'function-drop-zone', parentId: id }, disabled: isPalette || !['FUNCTION', 'ANALYZE_FUNCTION'].includes(type) });
    const droppableAssert = useDroppable({ id: `droppable-assert-${id}`, data: { type: 'assert-drop-zone', parentId: id }, disabled: isPalette || !['ASSERT_THAT', 'EXTRACTING'].includes(type) });

    const renderInput = (field: string, value: string, placeholder: string) => <Input type="text" value={value} placeholder={placeholder} onChange={(e) => onDataChange(field, e.target.value)} className="w-36 h-8 mx-1.5 bg-white/80" disabled={isPalette} onMouseDown={(e) => e.stopPropagation()} />;

    const renderVariableSelect = (field: string, value: string) => {
        let parentId: string | null = id as string;
        let currentBlock: Block | null | undefined = blocks.find(b => b.id === parentId);
        while (currentBlock && currentBlock.type !== 'FUNCTION') {
            parentId = currentBlock.parentId;
            currentBlock = parentId ? blocks.find(b => b.id === parentId) : null;
        }
        const parentFuncId = parentId;
        const variables = blocks.filter(b => b.type === 'VARIABLE' && b.parentId === parentFuncId) as VariableBlock[];
        return (
            <Select value={value} onValueChange={(val) => onDataChange(field, val)} disabled={isPalette || variables.length === 0}>
                <SelectTrigger className="w-32 h-8 mx-1.5 bg-white/80"><SelectValue placeholder="Select var..." /></SelectTrigger>
                <SelectContent onMouseDown={(e) => e.stopPropagation()}>
                    {variables.length > 0 ? variables.map(v => <SelectItem key={v.id} value={v.varName}>{v.varName}</SelectItem>) : <SelectItem value="-" disabled>no variables</SelectItem>}
                </SelectContent>
            </Select>
        );
    };

    const renderTypeSelect = (field: string, value: string) => (
        <Select value={value} onValueChange={(val) => onDataChange(field, val)} disabled={isPalette}>
            <SelectTrigger className="w-28 h-8 mx-1.5 bg-white/80"><SelectValue placeholder="Select type..." /></SelectTrigger>
            <SelectContent onMouseDown={(e) => e.stopPropagation()}>
                <SelectItem value="String">String</SelectItem>
                <SelectItem value="int">int</SelectItem>
                <SelectItem value="boolean">boolean</SelectItem>
            </SelectContent>
        </Select>
    );

    const blockContent = () => {
        const b = block as Block;
        switch (b.type) {
            case 'FUNCTION': return <span className="font-medium">@Test void {renderInput('funcName', (b as FunctionBlock).funcName, 'testName')}()</span>;
            case 'ANALYZE_FUNCTION': return <span className="font-medium">analyze function {renderInput('funcName', (b as AnalyzeFunctionBlock).funcName, 'functionName')}:</span>;
            case 'VARIABLE': return <>{renderTypeSelect('varType', (b as VariableBlock).varType)} {renderInput('varName', (b as VariableBlock).varName, 'varName')} = {renderInput('value', (b as VariableBlock).value, 'value')};</>;
            case 'COMMENT': return <span className="font-mono">{(b as CommentBlock).value}</span>;

            // --- Assertions ---
            case 'ASSERT_THAT': return <>assertThat({renderVariableSelect('target', (b as AssertThatBlock).target)})</>;
            case 'EXCEPTION_ASSERT': return <>assertThatExceptionOfType({renderInput('exceptionType', (b as ExceptionAssertBlock).exceptionType, 'Exception.class')}).isThrownBy({renderInput('code', (b as ExceptionAssertBlock).code, '() -> code')})</>;
            case 'STATIC_ASSERT': {
                const staticAssert = b as StaticAssertBlock;
                switch (staticAssert.checkType) {
                    case 'CLASS_EXISTS': return <>Verify class exists: {renderInput('value', staticAssert.value, '"ClassName"')}</>;
                    case 'FUNCTION_EXISTS': return <>Verify function exists: {renderInput('value', staticAssert.value, '"public void method()"')}</>;
                    case 'VARIABLE_EXISTS': return <>Verify variable exists: {renderInput('value', staticAssert.value, '"int myVar"')}</>;
                }
            }
            // --- Structure Checks ---
            case 'STRUCTURE_CHECK': {
                const structCheck = b as StructureCheckBlock;
                switch (structCheck.checkType) {
                    case 'HAS_FOR_LOOP': return <span className="font-medium">has a 'for' loop</span>;
                    case 'HAS_VARIABLE': return <>has variable: {renderTypeSelect('varType', structCheck.varType || 'String')} {renderInput('varName', structCheck.varName || '', 'varName')}</>;
                    case 'HAS_PARAMETER': return <>has parameter: {renderTypeSelect('varType', structCheck.varType || 'String')} {renderInput('varName', structCheck.varName || '', 'paramName')}</>;
                    case 'RETURNS_TYPE': return <>returns type: {renderTypeSelect('varType', structCheck.varType || 'String')}</>;
                    case 'CALLS_METHOD': return <>calls method: {renderInput('value', structCheck.value || '', '".method()"')}</>;
                    case 'USES_CONCATENATION': return <span className="font-medium">uses string concatenation</span>
                }
            }

            // --- Matchers ---
            case 'IS_EQUAL_TO': return <>.isEqualTo({renderInput('value', (b as MatcherBlock).value, 'expected')})</>;
            case 'IS_NOT_NULL': return <span className="font-medium">.isNotNull()</span>;
            case 'HAS_LENGTH': return <>.hasLength({renderInput('value', (b as MatcherBlock).value, 'size')})</>;
            case 'IS_INSTANCE_OF': return <>.isInstanceOf({renderInput('value', (b as MatcherBlock).value, 'ClassName.class')})</>;
            case 'CONTAINS': return <>.contains({renderInput('value', (b as MatcherBlock).value, 'element')})</>;
            case 'DOES_NOT_CONTAIN': return <>.doesNotContain({renderInput('value', (b as MatcherBlock).value, 'element')})</>;
            case 'EXTRACTING': return <>.extracting({renderInput('value', (b as MatcherBlock).value, '"fieldName"')})</>;
            case 'MATCHES': return <>.matches({renderInput('value', (b as MatcherBlock).value, '"regex"')})</>;
            case 'STARTS_WITH': return <>.startsWith({renderInput('value', (b as MatcherBlock).value, '"prefix"')})</>;
            case 'ENDS_WITH': return <>.endsWith({renderInput('value', (b as MatcherBlock).value, '"suffix"')})</>;

            default: return 'Unknown Block';
        }
    };

    const functionChildren = ['FUNCTION', 'ANALYZE_FUNCTION'].includes(type) ? blocks.filter(b => b.parentId === id) : [];
    const assertChildren = ['ASSERT_THAT', 'EXTRACTING'].includes(type) ? blocks.filter(b => b.parentId === id) : [];
    const dropZoneStyle = (isOver: boolean) => `ml-8 mt-1 p-3 border-l-4 rounded-r-lg transition-all duration-200 ${isOver ? 'shadow-inner' : ''}`;
    const functionDropStyle = droppableFunction.isOver ? 'bg-indigo-200 border-indigo-500' : 'border-indigo-300';
    const analyzeDropStyle = droppableFunction.isOver ? 'bg-purple-200 border-purple-500' : 'border-purple-300';
    const assertDropStyle = droppableAssert.isOver ? 'bg-teal-200 border-teal-500' : 'border-teal-300';
    const placeholder = (text: string, bgColor: string, textColor: string, show: boolean) => <div className={cn(`text-center text-sm p-2 rounded-md transition-opacity ${bgColor} ${textColor}`, show ? 'mt-3 opacity-60' : 'opacity-100')}>{text}</div>;

    return (
        <div className={cn('relative rounded-lg', getBlockStyle(type as BlockType))}>
            <div className={cn("flex items-center p-3 rounded-lg border-2 text-sm w-full shadow-sm flex-wrap", getBlockStyle(type as BlockType))}>
                <span className="font-mono flex items-center flex-wrap">{blockContent()}</span>
                {!isPalette && <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto rounded-full" onClick={onRemove} onMouseDown={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" /></Button>}
            </div>
            {type === 'FUNCTION' && !isPalette && <div ref={droppableFunction.setNodeRef} className={cn(dropZoneStyle(droppableFunction.isOver), functionDropStyle)}><SortableContext items={functionChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{functionChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Setup or Assertion Blocks Here', 'bg-indigo-100', 'text-indigo-700', functionChildren.length > 0)}</div>}
            {type === 'ANALYZE_FUNCTION' && !isPalette && <div ref={droppableFunction.setNodeRef} className={cn(dropZoneStyle(droppableFunction.isOver), analyzeDropStyle)}><SortableContext items={functionChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{functionChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Structure Check Blocks Here', 'bg-purple-100', 'text-purple-700', functionChildren.length > 0)}</div>}
            {['ASSERT_THAT', 'EXTRACTING'].includes(type) && !isPalette && <div ref={droppableAssert.setNodeRef} className={cn(dropZoneStyle(droppableAssert.isOver), assertDropStyle)}><SortableContext items={assertChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{assertChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Matcher Here', 'bg-teal-100', 'text-teal-700', assertChildren.length > 0)}</div>}
        </div>
    );
};