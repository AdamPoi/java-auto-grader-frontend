import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Trash2 } from 'lucide-react';
import { type FC, useContext } from 'react';
import AppContext from '../contexts/AppContext';
import type { AnyBlock, Block, BlockType } from '../types';
import { SortableBlock } from './SortableBlock';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface BlockRendererProps {
    block: AnyBlock;
    onDataChange?: (field: string, value: string) => void;
    onRemove?: () => void;
    isPalette?: boolean;
}

export const BlockRenderer: FC<BlockRendererProps> = ({ block, onDataChange = () => { }, onRemove = () => { }, isPalette = false }) => {
    const context = useContext(AppContext);
    if (!context) throw new Error("BlockRenderer must be used within an AppProvider");
    const { state } = context;

    const { id, type } = block as Block;

    const commonClasses = "flex items-center p-3 rounded-lg border-2 text-sm w-full shadow-sm";
    const typeStyles = {
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
        if (blockType.startsWith('IS_') || blockType.startsWith('HAS_') || ['CONTAINS', 'DOES_NOT_CONTAIN', 'EXTRACTING', 'MATCHES', 'STARTS_WITH', 'ENDS_WITH'].includes(blockType)) return typeStyles.MATCHER;
        return typeStyles[blockType as keyof typeof typeStyles] || 'bg-gray-100 border-gray-300';
    };

    const droppableFunction = useDroppable({ id: `droppable-func-${id}`, data: { type: 'function-drop-zone', parentId: id }, disabled: isPalette || !['FUNCTION', 'ANALYZE_FUNCTION'].includes(type) });
    const droppableAssert = useDroppable({ id: `droppable-assert-${id}`, data: { type: 'assert-drop-zone', parentId: id }, disabled: isPalette || !['ASSERT_THAT', 'EXTRACTING'].includes(type) });

    const renderInput = (field: string, value: string, placeholder: string) => <Input type="text" value={value} placeholder={placeholder} onChange={(e) => onDataChange(field, e.target.value)} className="w-36 h-8 mx-1.5" disabled={isPalette} />;

    const renderVariableSelect = (field: string, value: string) => {
        let parentId: string | null = id as string;
        let currentBlock: Block | undefined = state.blocks.find(b => b.id === parentId);
        while (currentBlock && currentBlock.type !== 'FUNCTION') {
            parentId = currentBlock.parentId;
            currentBlock = parentId ? state.blocks.find(b => b.id === parentId) : undefined;
        }
        const parentFuncId = parentId;
        const variables = state.blocks.filter(b => b.type === 'VARIABLE' && b.parentId === parentFuncId);
        return (<Select value={value} onChange={(e) => onDataChange(field, e.target.value)} className="w-32 h-8 mx-1.5" disabled={isPalette || variables.length === 0}> {variables.length > 0 ? (variables.map(v => <option key={v.id} value={(v as any).varName}>{(v as any).varName}</option>)) : (<option disabled>{'no variables'}</option>)} </Select>);
    }

    const renderTypeSelect = (field: string, value: string) => <Select value={value} onChange={(e) => onDataChange(field, e.target.value)} className="w-28 h-8 mx-1.5" disabled={isPalette}> <option>String</option> <option>int</option> <option>boolean</option> </Select>;

    const blockContent = () => {
        const b = block as Block;
        switch (b.type) {
            case 'FUNCTION': return <span className="font-medium">@Test void {renderInput('funcName', (b as any).funcName, 'testName')}()</span>;
            case 'ANALYZE_FUNCTION': return <span className="font-medium">analyze function {renderInput('funcName', (b as any).funcName, 'functionName')}:</span>;
            case 'VARIABLE': return <>{renderTypeSelect('varType', (b as any).varType)} {renderInput('varName', (b as any).varName, 'varName')} = {renderInput('value', (b as any).value, 'value')};</>;
            case 'ASSERT_THAT': return <>assertThat({renderVariableSelect('target', (b as any).target)})</>;
            case 'EXCEPTION_ASSERT': return <>assertThatExceptionOfType({renderInput('exceptionType', (b as any).exceptionType, 'Exception.class')}).isThrownBy({renderInput('code', (b as any).code, '() -> code')})</>;
            case 'STATIC_ASSERT':
                switch ((b as any).checkType) {
                    case 'CLASS_EXISTS': return <>Verify class exists: {renderInput('value', (b as any).value, '"ClassName"')}</>;
                    case 'FUNCTION_EXISTS': return <>Verify function exists: {renderInput('value', (b as any).value, '"public void method()"')}</>;
                    case 'VARIABLE_EXISTS': return <>Verify variable exists: {renderInput('value', (b as any).value, '"int myVar"')}</>;
                }
            case 'STRUCTURE_CHECK':
                switch ((b as any).checkType) {
                    case 'HAS_FOR_LOOP': return <span className="font-medium">has a 'for' loop</span>;
                    case 'HAS_VARIABLE': return <>has variable: {renderTypeSelect('varType', (b as any).varType || 'String')} {renderInput('varName', (b as any).varName || '', 'varName')}</>;
                    case 'HAS_PARAMETER': return <>has parameter: {renderTypeSelect('varType', (b as any).varType || 'String')} {renderInput('varName', (b as any).varName || '', 'paramName')}</>;
                    case 'RETURNS_TYPE': return <>returns type: {renderTypeSelect('varType', (b as any).varType || 'String')}</>;
                }
            case 'COMMENT': return <span className="font-mono">{(b as any).value}</span>;
            case 'IS_EQUAL_TO': return <>.isEqualTo({renderInput('value', (b as any).value, 'expected')})</>;
            case 'IS_NOT_NULL': return <span className="font-medium">.isNotNull()</span>;
            case 'HAS_LENGTH': return <>.hasLength({renderInput('value', (b as any).value, 'size')})</>;
            case 'IS_INSTANCE_OF': return <>.isInstanceOf({renderInput('value', (b as any).value, 'ClassName.class')})</>;
            case 'CONTAINS': return <>.contains({renderInput('value', (b as any).value, 'element')})</>;
            case 'DOES_NOT_CONTAIN': return <>.doesNotContain({renderInput('value', (b as any).value, 'element')})</>;
            case 'EXTRACTING': return <>.extracting({renderInput('value', (b as any).value, '"fieldName"')})</>;
            case 'MATCHES': return <>.matches({renderInput('value', (b as any).value, '"regex"')})</>;
            case 'STARTS_WITH': return <>.startsWith({renderInput('value', (b as any).value, '"prefix"')})</>;
            case 'ENDS_WITH': return <>.endsWith({renderInput('value', (b as any).value, '"suffix"')})</>;
            default: return 'Unknown Block';
        }
    };

    const functionChildren = ['FUNCTION', 'ANALYZE_FUNCTION'].includes(type) ? state.blocks.filter(b => b.parentId === id) : [];
    const assertChildren = ['ASSERT_THAT', 'EXTRACTING'].includes(type) ? state.blocks.filter(b => b.parentId === id) : [];
    const dropZoneStyle = (isOver: boolean) => `ml-8 mt-1 p-3 border-l-4 rounded-r-lg transition-all duration-200 ${isOver ? 'shadow-inner' : ''}`;
    const functionDropStyle = droppableFunction.isOver ? 'bg-indigo-200 border-indigo-500' : 'border-indigo-300';
    const analyzeDropStyle = droppableFunction.isOver ? 'bg-purple-200 border-purple-500' : 'border-purple-300';
    const assertDropStyle = droppableAssert.isOver ? 'bg-teal-200 border-teal-500' : 'border-teal-300';
    const placeholder = (text: string, bgColor: string, textColor: string, show: boolean) => <div className={`text-center text-sm p-2 rounded-md transition-opacity ${show ? 'mt-3 opacity-60' : 'opacity-100'} ${bgColor} ${textColor}`}>{text}</div>;

    return (
        <div className={`relative ${getBlockStyle(type as BlockType)} rounded-lg`}>
            <div className={`${commonClasses} flex-wrap ${getBlockStyle(type as BlockType)}`}>
                <span className="font-mono flex items-center">{blockContent()}</span>
                {!isPalette && <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto rounded-full" onClick={onRemove}><Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500 transition-colors" /></Button>}
            </div>
            {type === 'FUNCTION' && !isPalette && <div ref={droppableFunction.setNodeRef} className={dropZoneStyle(droppableFunction.isOver) + ' ' + functionDropStyle}><SortableContext items={functionChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{functionChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Setup or Assertion Blocks Here', 'bg-indigo-100', 'text-indigo-700', functionChildren.length > 0)}</div>}
            {type === 'ANALYZE_FUNCTION' && !isPalette && <div ref={droppableFunction.setNodeRef} className={dropZoneStyle(droppableFunction.isOver) + ' ' + analyzeDropStyle}><SortableContext items={functionChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{functionChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Structure Check Blocks Here', 'bg-purple-100', 'text-purple-700', functionChildren.length > 0)}</div>}
            {['ASSERT_THAT', 'EXTRACTING'].includes(type) && !isPalette && <div ref={droppableAssert.setNodeRef} className={dropZoneStyle(droppableAssert.isOver) + ' ' + assertDropStyle}><SortableContext items={assertChildren.map(c => c.id)} strategy={verticalListSortingStrategy}>{assertChildren.map(child => <SortableBlock key={child.id} id={child.id} block={child} />)}</SortableContext>{placeholder('Drop Matcher Here', 'bg-teal-100', 'text-teal-700', assertChildren.length > 0)}</div>}
        </div>
    );
};