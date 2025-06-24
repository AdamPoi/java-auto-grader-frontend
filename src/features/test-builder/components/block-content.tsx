import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, X } from 'lucide-react';
import React, { useContext, useMemo, useState } from 'react';
import { BlocksTreeContext } from '..';
import type { AnyBlock, AssertThatBlock, Block, CommentBlock, ExceptionAssertBlock, FunctionBlock, FunctionTestBlock, MatcherBlock, OmittedBlock, StaticAssertBlock, StructureCheckBlock, TestCaseFunctionBlock, VariableBlock } from '../data/types';
import { useTestBuilderStore } from '../hooks/use-test-builder-store';


interface TypeSelectProps {
    field: string;
    value: string;
    onDataChange: (field: string, value: any) => void;
    isPalette: boolean;
    onChange?: (val: string) => void;
}

const TypeSelect: React.FC<TypeSelectProps> = ({ field, value, onDataChange, isPalette, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const predefinedTypes = [
        'byte', 'Byte', 'short', 'Short', 'int', 'Integer', 'long', 'Long',
        'float', 'Float', 'double', 'Double', 'char', 'Character',
        'String', 'CharSequence', 'BigDecimal', 'BigInteger',
        'Object[]', 'byte[]', 'short[]', 'int[]', 'long[]', 'float[]', 'double[]', 'char[]',
    ];
    const filteredTypes = predefinedTypes.filter(type =>
        type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const isValuePredefined = predefinedTypes.includes(value);

    const handleValueChange = (val: string) => {
        onDataChange(field, val);
        onChange?.(val);
        setSearchTerm('');
    };

    const handleCustomInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onDataChange(field, newValue);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const selectDisplayValue = value || '';

    return (
        <Select value={selectDisplayValue} onValueChange={handleValueChange} disabled={isPalette}>
            <SelectTrigger className="w-28 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                <SelectValue placeholder="Select Type">{value || "Select Type"}</SelectValue>
            </SelectTrigger>
            <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
                <div className="p-2 sticky top-0 bg-popover z-10">
                    <Input
                        type="text"
                        placeholder="Search types..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full p-1 border"
                        onMouseDown={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onBlur={(e) => e.stopPropagation()}
                        autoFocus={false}
                    />
                </div>
                <div className="max-h-60 overflow-y-auto">
                    {filteredTypes.length > 0 ? (
                        filteredTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))
                    ) : (
                        <div className="p-2 text-sm text-gray-500">No matching types found.</div>
                    )}
                    {!isValuePredefined && value && !filteredTypes.includes(value) && (
                        <SelectItem value={value}>{value} (Custom)</SelectItem>
                    )}
                </div>
                <div className="p-2 sticky bottom-0 bg-popover z-10 border-t">
                    <Input
                        type="text"
                        value={!isValuePredefined ? value : ''}
                        onChange={handleCustomInputChange}
                        placeholder="Type custom type"
                        className="w-full p-1 border"
                        onMouseDown={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                        onBlur={(e) => e.stopPropagation()}
                    />
                </div>
            </SelectContent>
        </Select>
    );
};


interface VariableSelectProps {
    id: string;
    field: string;
    value: string;
    onDataChange: (field: string, value: any) => void;
    isPalette: boolean;
    onChange?: (val: string) => void;
}
const VariableSelect: React.FC<VariableSelectProps> = ({ id, field, value, onDataChange, isPalette, onChange }) => {
    const { blocksById, blocksByParentId } = useContext(BlocksTreeContext);
    const [customVar, setCustomVar] = useState('');

    const variables = useMemo(() => {
        let parentFuncId: string | null = null;
        let currentBlock = blocksById.get(id);

        while (currentBlock) {
            if (currentBlock.type === 'FUNCTION') {
                parentFuncId = currentBlock.id;
                break;
            }
            currentBlock = currentBlock.parentId ? blocksById.get(currentBlock.parentId) : undefined;
        }

        if (!parentFuncId) return [];

        const functionChildren = blocksByParentId.get(parentFuncId) || [];
        return functionChildren.filter(b => b.type === 'VARIABLE');
    }, [id, blocksById, blocksByParentId]);

    const options = [...variables, ...(customVar ? [{ id: 'custom', varName: customVar }] : [])];
    const handleChange = (val: string) => {
        onDataChange(field, val);
        onChange?.(val);
    };

    return (
        <Select value={value} onValueChange={handleChange} disabled={isPalette}>
            <SelectTrigger className="w-32 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                <SelectValue placeholder={options.length > 0 ? "Select var" : "no variables"} />
            </SelectTrigger>
            <SelectContent>
                {options.map(v => <SelectItem key={v.id} value={(v as VariableBlock).varName}>{(v as VariableBlock).varName}</SelectItem>)}
                <div className="p-2">
                    <Input
                        type="text"
                        value={customVar}
                        onChange={(e) => setCustomVar(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onDataChange(field, customVar);
                                setCustomVar('');
                            }
                        }}
                        placeholder="Type custom variable"
                        className="w-full p-1 border"
                    />
                </div>
            </SelectContent>
        </Select>
    );
};


const MemoizedBlockContent = React.memo(({ block, onDataChange, isPalette }: { block: AnyBlock | OmittedBlock, onDataChange: (field: string, value: any) => void, isPalette: boolean }) => {
    const { rubrics } = useTestBuilderStore();
    const id = (block as Block).id;
    const { blocksById, blocksByParentId } = useContext(BlocksTreeContext);

    const renderInput = (field: string, value: string, varType: string = '', placeholder?: string, onChange?: (val: string) => void) => {
        const handleOnChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            onDataChange(field, e.target.value);
            onChange?.(e.target.value);
        };

        const inputClassName = `mx-1.5 bg-white ${value === '' && !isPalette ? 'border-red-500' : ''}`;

        if (['byte', 'Byte', 'short', 'Short', 'int', 'Integer', 'long', 'Long', 'float', 'Float', 'double', 'Double']
            .includes(varType)) {
            return (
                <Input
                    type="number"
                    placeholder={placeholder ?? "e.g. 0"}
                    value={value}
                    onChange={handleOnChange}
                    disabled={isPalette}
                    className={`w-32 ${inputClassName}`}
                />
            )
        }
        if (varType === 'Date') {
            return (
                <Input
                    type="date"
                    value={value}
                    onChange={handleOnChange}
                    disabled={isPalette}
                    className={`w-40 ${inputClassName}`}
                />
            )
        }
        if (varType === 'File' || varType === 'Path') {
            return (
                <Input
                    type="text"
                    placeholder="/path/to/file"
                    value={value}
                    onChange={handleOnChange}
                    disabled={isPalette}
                    className={`w-64 ${inputClassName}`}
                />
            )
        }
        if (/\[\]$/.test(varType) || varType.startsWith('Iterable') || varType.startsWith('Stream')) {
            return (
                <Textarea
                    placeholder={placeholder ?? 'e.g. 1,2,3 or "1","2","3"'}
                    value={value}
                    onChange={handleOnChange}
                    disabled={isPalette}
                    className={`w-64 h-20 ${inputClassName}`}
                />
            )
        }
        return (
            <Input
                placeholder={placeholder ?? "value"}
                value={value}
                onChange={handleOnChange}
                disabled={isPalette}
                className={`w-48 ${inputClassName}`}
            />
        )
    };

    const renderRubricSelect = (value: string | null | undefined) => {
        const selectedRubric = value && value !== 'unassigned'
            ? rubrics.find(r => r.id == value)
            : null;
        const displayValue = selectedRubric
            ? `${selectedRubric.name} (${selectedRubric.points} pts)`
            : "-- Unassigned --";

        // Get all currently used rubric IDs from all blocks except current one
        const usedRubricIds = new Set();
        blocksById.forEach(blockData => {
            if (blockData.id !== id && blockData.rubricId) {
                usedRubricIds.add(blockData.rubricId.toString());
            }
        });

        return (
            <Select
                value={value || 'unassigned'}
                onValueChange={(val) => {
                    onDataChange('rubricId', val === 'unassigned' ? null : val)
                }}
                disabled={isPalette}
            >
                <SelectTrigger className="w-40 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="-- Unassigned --">{displayValue}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="unassigned">-- Unassigned --</SelectItem>
                    {rubrics.map(r => {
                        const isUsed = usedRubricIds.has(r.id.toString());
                        return (
                            <SelectItem
                                key={r.id}
                                value={r.id.toString()}
                                disabled={isUsed}
                            >
                                {r.name} ({r.points} pts)
                                {isUsed && " (Already used)"}
                            </SelectItem>
                        );
                    })}
                </SelectContent>
            </Select>
        );
    };

    const renderStaticAssertTypeSelect = (field: string, value: string) => (
        <Select value={value} onValueChange={(val) => { onDataChange(field, val) }} disabled={isPalette}>
            <SelectTrigger className="w-64 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="CLASS_EXISTS">Class Exists</SelectItem>
                <SelectItem value="FUNCTION_EXISTS">Function Exists</SelectItem>
                <SelectItem value="VARIABLE_EXISTS">Variable Exists</SelectItem>
                <SelectItem value="FUNCTION_EXISTS_IN_CLASS">Function Exists In Class</SelectItem>
                <SelectItem value="VARIABLE_EXISTS_IN_CLASS">Variable Exists In Class</SelectItem>
                <SelectItem value="VARIABLE_EXISTS_IN_FUNCTION">Variable Exists In Function</SelectItem>
                <SelectItem value="VARIABLE_CALLED_IN_CLASS">Variable Called In Class</SelectItem>
                <SelectItem value="VARIABLE_CALLED_IN_FUNCTION">Variable Called In Function</SelectItem>
            </SelectContent>
        </Select>
    );

    const renderLoopTypeSelect = (field: string, value: string) => (
        <Select value={value || "FOR"} onValueChange={(val) => { onDataChange(field, val) }} disabled={isPalette}>
            <SelectTrigger className="w-64 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                <SelectValue placeholder="Select loop type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="FOR">For Loop</SelectItem>
                <SelectItem value="WHILE">While Loop</SelectItem>
                <SelectItem value="DO_WHILE">Do-While Loop</SelectItem>
                <SelectItem value="FOREACH">For-Each Loop</SelectItem>
            </SelectContent>
        </Select>
    );

    const renderConditionalTypeSelect = (field: string, value: string) => (
        <Select value={value || "IF"} onValueChange={(val) => onDataChange(field, val)} disabled={isPalette}>
            <SelectTrigger className="w-64 h-8 mx-1.5 bg-white" onMouseDown={(e) => e.stopPropagation()}>
                <SelectValue placeholder="Select conditional type" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="IF">If Statement</SelectItem>
                <SelectItem value="SWITCH">Switch Statement</SelectItem>
            </SelectContent>
        </Select>
    );

    const blockContent = () => {
        const b = block as AnyBlock;
        switch (b.type) {
            case 'FUNCTION':
                const funcBlock = b as FunctionBlock;

                return <span className="font-medium flex items-center">
                    @Test void {renderInput('funcName', funcBlock.funcName, 'String', 'testName')}() {'{'}
                    {renderRubricSelect(funcBlock.rubricId?.toString())}
                </span>
                    ;
            case 'FUNCTION_TEST': {
                const fb = block as FunctionTestBlock;
                const onChange = (field: keyof FunctionTestBlock, val: any) =>
                    onDataChange!(field, val);

                const addParam = () =>
                    onChange('parameters', [...fb.parameters, { name: '', varType: '', value: '' }]);
                const removeParam = (idx: number) => {
                    const params = fb.parameters.filter((_, i) => i !== idx);
                    onChange('parameters', params);
                };

                const onParamChange = (idx: number, field: 'name' | 'varType' | 'value', value: string) => {
                    const updatedParams = fb.parameters.map((p, i) =>
                        i === idx ? { ...p, [field]: value } : p
                    );
                    onChange('parameters', updatedParams);
                };

                return (
                    <div className="border rounded p-4 mb-4">
                        <span className='flex items-center mx-1 my-1'>
                            test Method {renderInput('methodName', fb.methodName, 'String', 'methodName', (val) => onChange('methodName', val))}
                        </span>
                        <span className='flex items-center mx-1 my-1'>
                            in Class
                            {renderInput('className', fb.className, 'String', 'Main', (val) => onChange('className', val))}
                        </span>
                        <div className="my-2">
                            with Parameters of

                            {fb.parameters.map((p, i) => (
                                <span key={i} className='flex items-center mx-1 my-1'>
                                    {renderInput(
                                        `parameter-name-${i}`,
                                        p.name, 'String',
                                        'name',
                                        (val) => onParamChange(i, 'name', val)
                                    )}

                                    <TypeSelect
                                        field={`parameter-type-${i}`}
                                        value={p.varType}
                                        onDataChange={(_field, val) => onParamChange(i, 'varType', val)}
                                        isPalette={isPalette}
                                    />

                                    {renderInput(
                                        `parameter-value-${i}`,
                                        p.value, 'String',
                                        'value',
                                        (val) => onParamChange(i, 'value', val)
                                    )}
                                    <X
                                        size={16}
                                        className="cursor-pointer text-red-500"
                                        onClick={() => removeParam(i)}
                                    />
                                </span>
                            ))}
                            <div className="flex space-x-2 justify-center my-2">
                                <Button size="sm" variant="outline" onClick={addParam}>
                                    Add Parameter
                                </Button>
                            </div>
                        </div>
                        <span className='flex items-center mx-1 my-1'>
                            that expected to return
                            {renderInput(
                                'expected-name',
                                fb.expected.name, 'String',
                                'expected',
                                (val) => onChange('expected', { ...fb.expected, name: val })
                            )}
                        </span>
                        <span className='flex items-center mx-1 my-1'>
                            with type <TypeSelect
                                field='expected-type'
                                value={fb.expected.varType}
                                onDataChange={(_field, val) => onChange('expected', { ...fb.expected, varType: val })}
                                isPalette={isPalette}
                            />
                            and value of
                            {renderInput(
                                'expected-value',
                                fb.expected.value, 'String',
                                'value',
                                (val) => onChange('expected', { ...fb.expected, value: val })
                            )}
                        </span>
                    </div>
                );
            }
            case 'TEST_CASE_FUNCTION':
                const testCaseFunctionBlock = b as TestCaseFunctionBlock;
                return <>
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">@CsvSource</span>
                        {!isPalette && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDataChange('remove', id)}
                                onMouseDown={e => e.stopPropagation()}
                            >
                                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col space-y-2">
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Inputs</label>
                            <Textarea
                                value={testCaseFunctionBlock.inputs || ''}
                                placeholder={`e.g. "[2,7], 9"`}
                                onChange={e => onDataChange('inputs', e.target.value)}
                                disabled={isPalette}
                                rows={1}
                                onMouseDown={e => e.stopPropagation()}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700">Expected</label>
                            <Textarea
                                value={testCaseFunctionBlock.expected || ''}
                                placeholder={`e.g. "[0,1]"`}
                                onChange={e => onDataChange('expected', e.target.value)}
                                disabled={isPalette}
                                rows={1}
                                onMouseDown={e => e.stopPropagation()}
                            />
                        </div>
                    </div>
                </>;
            case 'VARIABLE':
                const varBlock = b as VariableBlock;
                return <>
                    <span className='flex items-center mx-1 my-1'>
                        add variable {renderInput('varName', varBlock.varName ?? '', 'String', 'varName')}
                    </span>
                    <span className='flex items-center mx-1 my-1'>
                        that have type of <TypeSelect field='varType' value={varBlock.varType ?? ''} onDataChange={onDataChange} isPalette={isPalette} />
                    </span>
                    <span className='flex items-center mx-1 my-1'>
                        with value {renderInput('value', varBlock.value ?? '', varBlock.varType ?? 'String')}
                    </span>
                </>;
            case 'ASSERT_THAT':
                const assertThatBlock = b as AssertThatBlock;
                return <>
                    <span className='flex items-center mx-1 my-1'>
                        assertThat(<VariableSelect id={id} field='target' value={assertThatBlock.target} onDataChange={onDataChange} isPalette={isPalette} />)
                    </span>
                </>;
            case 'EXCEPTION_ASSERT':
                const exceptionAssertBlock = b as ExceptionAssertBlock;
                return <>
                    assertThatExceptionOfType({renderInput('exceptionType', exceptionAssertBlock.exceptionType, 'String', 'Exception.class')}).isThrownBy({renderInput('code', exceptionAssertBlock.code, 'int', '() -> code')})</>;
            case 'STATIC_ASSERT':
                const staticAssertBlock = b as StaticAssertBlock;
                const staticAssertIn = staticAssertBlock.checkType.includes('IN_CLASS') ? 'in class' : staticAssertBlock.checkType.includes('IN_FUNCTION') ? 'in function' : '';
                return <>
                    <span className='flex items-center mx-1 my-1'>
                        assert that {renderInput('varName', staticAssertBlock.varName ?? '', '', 'fieldName')}
                        is {renderStaticAssertTypeSelect('checkType', staticAssertBlock.checkType)}
                    </span>
                    <span className='flex items-center mx-1 my-1'>
                        {staticAssertIn === 'in class' && <>
                            in class {renderInput('className', staticAssertBlock.className ?? '', '', 'ClassName')}
                        </>
                        }
                    </span>
                    <span className='flex items-center mx-1 my-1'>{staticAssertIn === 'in function' && <>
                        in method {renderInput('methodName', staticAssertBlock.methodName ?? '', '', 'methodName')}
                    </>}
                    </span>

                </>;
            case 'STRUCTURE_CHECK':
                const sc = b as StructureCheckBlock;
                switch (sc.checkType) {
                    case 'HAS_LOOP': return <>
                        <span className='flex items-center mx-1 my-1'>
                            has {renderLoopTypeSelect('varType', sc.varType || 'FOR')} statement
                        </span>
                        <span className='flex items-center mx-1 my-1'>
                            in method  {renderInput('methodName', sc.methodName || 'methodname', 'String', 'methodName')}
                        </span>
                    </>;
                    case 'HAS_CONDITIONAL': return <>
                        <span className='flex items-center mx-1 my-1'>
                            has {renderConditionalTypeSelect('varType', sc.varType || 'IF')} statement
                        </span>
                        <span className='flex items-center mx-1 my-1'>
                            in method {renderInput('methodName', sc.methodName || '', 'String', 'methodName')}
                        </span>
                    </>;
                    case 'HAS_PARAMETER': return <>
                        <span className='flex items-center mx-1 my-1'>
                            has method {renderInput('methodName', sc.methodName || '', 'String', 'methodName')}
                        </span>
                        <span className='flex items-center mx-1 my-1'>
                            that has parameter of {renderInput('varName', sc.varName || '', 'String', 'paramName')}
                        </span>
                        <span className='flex items-center mx-1 my-1'>
                            with type of <TypeSelect field='varType' value={sc.varType || 'String'} onDataChange={onDataChange} isPalette={isPalette} />
                        </span>
                    </>;
                    case 'HAS_RETURN': return <>
                        <span className='flex items-center mx-1 my-1'>
                            has method {renderInput('methodName', sc.methodName || '', 'String', 'methodName')}
                        </span>
                        <span className='flex items-center mx-1 my-1'>
                            that has return value {renderInput('value', sc.value || '', 'String', 'value')}
                        </span>
                        <span className='flex items-center mx-1 my-1'>
                            with type of <TypeSelect field='varType' value={sc.varType || 'String'} onDataChange={onDataChange} isPalette={isPalette} />
                        </span>
                    </>;
                    default: return 'Unknown Structure Check';
                }
            case 'COMMENT':
                const commentBlock = b as CommentBlock;
                return <span className="font-mono">{commentBlock.value}</span>;
            case 'IS_EQUAL_TO': return <>.isEqualTo({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'expected')})</>;
            case 'IS_NOT_NULL': return <span className="font-medium">.isNotNull()</span>;
            case 'HAS_SIZE': return <>.hasSize({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'size')})</>;
            case 'IS_INSTANCE_OF': return <>.isInstanceOf({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'ClassName.class')})</>;
            case 'CONTAINS': return <>.contains({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'element')})</>;
            case 'CONTAINS_ONLY': return <>.containsOnly({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'elements')})</>;
            case 'CONTAINS_EXACTLY': return <>.containsExactly({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'elements')})</>;
            case 'CONTAINS_EXACTLY_IN_ANY_ORDER': return <>.containsExactlyInAnyOrder({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'elements')})</>;
            case 'CONTAINS_SEQUENCE': return <>.containsSequence({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'elements')})</>;
            case 'CONTAINS_SUBSEQUENCE': return <>.containsSubsequence({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'elements')})</>;
            case 'CONTAINS_ONLY_ONCE': return <>.containsOnlyOnce({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'elements')})</>;
            case 'CONTAINS_ANY_OF': return <>.containsAnyOf({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'elements')})</>;
            case 'DOES_NOT_CONTAIN': return <>.doesNotContain({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'element')})</>;
            case 'EXTRACTING': return <>.extracting({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'fieldName')})</>;
            case 'MATCHES': return <>.matches({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'regex')})</>;
            case 'STARTS_WITH': return <>.startsWith({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'prefix')})</>;
            case 'ENDS_WITH': return <>.endsWith({renderInput('value', (b as MatcherBlock).value ?? '', 'String', 'suffix')})</>;

            default: return <span>Unknown Block</span>;
        }
    };

    return <span className="font-mono flex items-center flex-wrap">{blockContent()}</span>;
});
export default MemoizedBlockContent;