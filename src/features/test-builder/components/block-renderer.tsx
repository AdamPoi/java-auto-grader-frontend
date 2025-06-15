import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ExternalLink, HelpCircle, Trash2 } from 'lucide-react';
import React from 'react';
import { DOCUMENTATION } from '../data/documentation';
import type { AnalyzeFunctionBlock, AnyBlock, AssertThatBlock, Block, BlockType, CommentBlock, ExceptionAssertBlock, FunctionBlock, MatcherBlock, OmittedBlock, StaticAssertBlock, StructureCheckBlock, VariableBlock } from '../data/types';
import { useTestBuilderStore } from '../hooks/use-test-builder-store';
import { SortableBlock } from './sortable-block';

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
    const { testSuites, activeSuiteId, rubrics } = useTestBuilderStore();
    const allBlocks = testSuites.flatMap(s => s.blocks);

    const id = (block as Block).id;
    const parentId = (block as Block).parentId;
    const { type } = block;

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
        if (['IS_EQUAL_TO', 'IS_NOT_NULL', 'HAS_LENGTH', 'IS_INSTANCE_OF', 'CONTAINS', 'DOES_NOT_CONTAIN', 'EXTRACTING', 'MATCHES', 'STARTS_WITH', 'ENDS_WITH'].includes(blockType)) {
            return typeStyles.MATCHER;
        }
        return typeStyles[blockType as keyof typeof typeStyles] || 'bg-gray-100 border-gray-300';
    };

    const droppableFunction = useDroppable({ id: `droppable-func-${id}`, data: { type: 'function-drop-zone', parentId: id }, disabled: isPalette || !['FUNCTION', 'ANALYZE_FUNCTION'].includes(type) || !id });
    const droppableAssert = useDroppable({ id: `droppable-assert-${id}`, data: { type: 'assert-drop-zone', parentId: id }, disabled: isPalette || !['ASSERT_THAT', 'EXTRACTING'].includes(type) || !id });

    const renderInput = (field: string, value: string, placeholder: string) => <Input type="text" value={value} placeholder={placeholder} onChange={(e) => onDataChange(field, e.target.value)} className="w-36 h-8 mx-1.5 bg-white" disabled={isPalette} onMouseDown={(e) => e.stopPropagation()} />;

    const renderRubricSelect = (value: string | null | undefined) => (
        <Select
            value={value || 'unassigned'}
            onValueChange={(val) => onDataChange('rubricId', val === 'unassigned' ? null : val)}
            disabled={isPalette}
        >
            <SelectTrigger className="w-40 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                <SelectValue placeholder="-- Unassigned --" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                {rubrics.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.points} pts)</SelectItem>)}
            </SelectContent>
        </Select>
    );

    const renderVariableSelect = (field: string, value: string) => {
        const activeSuite = testSuites.find(s => s.id === activeSuiteId);
        if (!activeSuite) return null;
        let currentBlockParentId: string | null = id;
        let currentBlock = activeSuite.blocks.find(b => b.id === currentBlockParentId);
        while (currentBlock && currentBlock.type !== 'FUNCTION') { currentBlockParentId = currentBlock.parentId; currentBlock = currentBlockParentId ? activeSuite.blocks.find(b => b.id === currentBlockParentId) : undefined; }
        const parentFuncId = currentBlockParentId;
        const variables = activeSuite.blocks.filter(b => b.type === 'VARIABLE' && b.parentId === parentFuncId);

        return (
            <Select value={value} onValueChange={(val) => onDataChange(field, val)} disabled={isPalette || variables.length === 0}>
                <SelectTrigger className="w-32 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder={variables.length > 0 ? "Select var" : "no variables"} />
                </SelectTrigger>
                <SelectContent>
                    {variables.map(v => <SelectItem key={v.id} value={(v as VariableBlock).varName}>{(v as VariableBlock).varName}</SelectItem>)}
                </SelectContent>
            </Select>
        );
    }

    const renderTypeSelect = (field: string, value: string) => (
        <Select value={value} onValueChange={(val) => onDataChange(field, val)} disabled={isPalette}>
            <SelectTrigger className="w-28 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="String">String</SelectItem>
                <SelectItem value="int">int</SelectItem>
                <SelectItem value="boolean">boolean</SelectItem>
            </SelectContent>
        </Select>
    );

    const blockContent = () => {
        const b = block as AnyBlock;
        switch (b.type) {
            case 'FUNCTION':
                const funcBlock = b as FunctionBlock;
                return <span className="font-medium flex items-center">@Test void {renderInput('funcName', funcBlock.funcName, 'testName')}() {'{'} {renderRubricSelect(funcBlock.rubricId)}</span>;
            case 'ANALYZE_FUNCTION':
                const analyzeFuncBlock = b as AnalyzeFunctionBlock;
                return <span className="font-medium flex items-center">analyze function {renderInput('funcName', analyzeFuncBlock.funcName, 'functionName')}: {renderRubricSelect(analyzeFuncBlock.rubricId)}</span>;
            case 'VARIABLE':
                const varBlock = b as VariableBlock;
                return <>{renderTypeSelect('varType', varBlock.varType ?? '')} {renderInput('varName', varBlock.varName ?? '', 'varName')} = {renderInput('value', varBlock.value ?? '', 'value')};</>;
            case 'ASSERT_THAT':
                const assertThatBlock = b as AssertThatBlock;
                return <>assertThat({renderVariableSelect('target', assertThatBlock.target)})</>;
            case 'EXCEPTION_ASSERT':
                const exceptionAssertBlock = b as ExceptionAssertBlock;
                return <>assertThatExceptionOfType({renderInput('exceptionType', exceptionAssertBlock.exceptionType, 'Exception.class')}).isThrownBy({renderInput('code', exceptionAssertBlock.code, '() -> code')})</>;
            case 'STATIC_ASSERT':
                const staticAssertBlock = b as StaticAssertBlock;
                switch (staticAssertBlock.checkType) {
                    case 'CLASS_EXISTS': return <>Verify class exists: {renderInput('value', staticAssertBlock.value ?? '', '"ClassName"')}</>;
                    case 'FUNCTION_EXISTS': return <>Verify function exists: {renderInput('value', staticAssertBlock.value ?? '', '"public void method()"')}</>;
                    case 'VARIABLE_EXISTS': return <>Verify variable exists: {renderInput('value', staticAssertBlock.value ?? '', '"int myVar"')}</>;
                }
            case 'STRUCTURE_CHECK':
                const sc = b as StructureCheckBlock;
                switch (sc.checkType) {
                    case 'HAS_FOR_LOOP': return <span className="font-medium">has a 'for' loop</span>;
                    case 'HAS_VARIABLE': return <>has variable: {renderTypeSelect('varType', sc.varType || 'String')} {renderInput('varName', sc.varName || '', 'varName')}</>;
                    case 'HAS_PARAMETER': return <>has parameter: {renderTypeSelect('varType', sc.varType || 'String')} {renderInput('varName', sc.varName || '', 'paramName')}</>;
                    case 'RETURNS_TYPE': return <>returns type: {renderTypeSelect('varType', sc.varType || 'String')}</>;
                    case 'CALLS_METHOD': return <>calls method: {renderInput('value', sc.value || '', '".method()"')}</>;
                    case 'USES_CONCATENATION': return <span className="font-medium">uses string concatenation</span>
                }
            case 'COMMENT':
                const commentBlock = b as CommentBlock;
                return <span className="font-mono">{commentBlock.value}</span>;
            case 'IS_EQUAL_TO': return <>.isEqualTo({renderInput('value', (b as MatcherBlock).value ?? '', 'expected')})</>;
            case 'IS_NOT_NULL': return <span className="font-medium">.isNotNull()</span>;
            case 'HAS_LENGTH': return <>.hasLength({renderInput('value', (b as MatcherBlock).value ?? '', 'size')})</>;
            case 'IS_INSTANCE_OF': return <>.isInstanceOf({renderInput('value', (b as MatcherBlock).value ?? '', 'ClassName.class')})</>;
            case 'CONTAINS': return <>.contains({renderInput('value', (b as MatcherBlock).value ?? '', 'element')})</>;
            case 'DOES_NOT_CONTAIN': return <>.doesNotContain({renderInput('value', (b as MatcherBlock).value ?? '', 'element')})</>;
            case 'EXTRACTING': return <>.extracting({renderInput('value', (b as MatcherBlock).value ?? '', '"fieldName"')})</>;
            case 'MATCHES': return <>.matches({renderInput('value', (b as MatcherBlock).value ?? '', '"regex"')})</>;
            case 'STARTS_WITH': return <>.startsWith({renderInput('value', (b as MatcherBlock).value ?? '', '"prefix"')})</>;
            case 'ENDS_WITH': return <>.endsWith({renderInput('value', (b as MatcherBlock).value ?? '', '"suffix"')})</>;
            default: return 'Unknown Block';
        }
    };

    const functionChildren = ['FUNCTION', 'ANALYZE_FUNCTION'].includes(type) && id ? allBlocks.filter(b => b.parentId === id) : [];
    const assertChildren = ['ASSERT_THAT', 'EXTRACTING'].includes(type) && id ? allBlocks.filter(b => b.parentId === id) : [];

    const dropZoneStyle = (isOver: boolean) => `ml-8 mt-1 p-3 border-l-4 rounded-r-lg transition-all duration-200 ${isOver ? 'shadow-inner' : ''}`;
    const functionDropStyle = droppableFunction.isOver ? 'bg-indigo-200 border-indigo-500' : 'border-indigo-300';
    const analyzeDropStyle = droppableFunction.isOver ? 'bg-purple-200 border-purple-500' : 'border-purple-300';
    const assertDropStyle = droppableAssert.isOver ? 'bg-teal-200 border-teal-500' : 'border-teal-300';
    const placeholder = (text: string, bgColor: string, textColor: string, show: boolean) => <div className={`text-center text-sm p-2 rounded-md transition-opacity ${show ? 'opacity-0 h-0' : 'mt-3 opacity-60'} ${bgColor} ${textColor}`}>{text}</div>;

    const docKey = block.type === 'STRUCTURE_CHECK' ? `STRUCTURE_CHECK_${(block as StructureCheckBlock).checkType}` : block.type;
    const doc = DOCUMENTATION[docKey];
    const showTrashIcon = !isPalette && id;

    return (
        <div className={cn("relative rounded-lg", getBlockStyle(type as BlockType))}>
            <div className={cn("flex items-center p-3 rounded-lg border-2 text-sm w-full shadow-sm flex-wrap", getBlockStyle(type as BlockType))}>
                <span className="font-mono flex items-center flex-wrap">{blockContent()}</span>
                <div className="flex items-center ml-auto">
                    {doc && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-2 rounded-full" onMouseDown={(e) => e.stopPropagation()}>
                                    <HelpCircle className="h-4 w-4 text-gray-400 hover:text-blue-500" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64" onMouseDown={(e) => e.stopPropagation()}>
                                <div>
                                    <p className="text-sm text-gray-700 mb-2">{doc.description}</p>
                                    {doc.example && <pre className="bg-gray-100 p-2 rounded-md text-xs text-gray-800 mb-2"><code>{doc.example}</code></pre>}
                                    {doc.link && <a href={doc.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center"><ExternalLink className="w-3 h-3 mr-1" />Read More</a>}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                    {showTrashIcon && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={onRemove} onMouseDown={(e) => e.stopPropagation()}><Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" /></Button>}
                </div>
            </div>
            {type === 'FUNCTION' && !isPalette && id && <div ref={droppableFunction.setNodeRef} className={cn(dropZoneStyle(droppableFunction.isOver), functionDropStyle)}><SortableContext items={functionChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{functionChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Setup or Assertion Blocks Here', 'bg-indigo-100', 'text-indigo-700', functionChildren.length > 0)}</div>}
            {type === 'ANALYZE_FUNCTION' && !isPalette && id && <div ref={droppableFunction.setNodeRef} className={cn(dropZoneStyle(droppableFunction.isOver), analyzeDropStyle)}><SortableContext items={functionChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{functionChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Structure Check Blocks Here', 'bg-purple-100', 'text-purple-700', functionChildren.length > 0)}</div>}
            {['ASSERT_THAT', 'EXTRACTING'].includes(type) && !isPalette && id && <div ref={droppableAssert.setNodeRef} className={cn(dropZoneStyle(droppableAssert.isOver), assertDropStyle)}><SortableContext items={assertChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{assertChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Matcher Here', 'bg-teal-100', 'text-teal-700', assertChildren.length > 0)}</div>}
        </div>
    );
};