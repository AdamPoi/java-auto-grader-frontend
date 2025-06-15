import {
    AlertTriangle,
    Baseline,
    Binary,
    Clock,
    Construction,
    Fingerprint,
    Pilcrow,
    Regex,
    Type
} from 'lucide-react';
import type { OmittedBlock, TemplateFunction } from './types';

export const INITIAL_PALETTE_BLOCKS: {
    templates: TemplateFunction[];
    functions: OmittedBlock[];
    setup: OmittedBlock[];
    assertions: OmittedBlock[];
    structure: OmittedBlock[];
    matchers: OmittedBlock[];
} = {
    templates: [
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'I/O Test',
            icon: Pilcrow,
            func: { type: 'FUNCTION', funcName: 'testInputOutput' },
            children: [
                { type: 'VARIABLE', varType: 'String', varName: 'input', value: '"some_input"' },
                { type: 'VARIABLE', varType: 'String', varName: 'expectedOutput', value: '"expected_result"' },
                { type: 'COMMENT', value: '// Simulate running code with input...' },
                { type: 'VARIABLE', varType: 'String', varName: 'actualOutput', value: 'runWithInput(input)' },
                { type: 'ASSERT_THAT', target: 'actualOutput', children: [{ type: 'IS_EQUAL_TO', value: 'expectedOutput' }] }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Data Type Test',
            icon: Type,
            func: { type: 'FUNCTION', funcName: 'testDataTypes' },
            children: [
                { type: 'VARIABLE', varType: 'String', varName: 'text', value: '"example"' },
                { type: 'VARIABLE', varType: 'int', varName: 'number', value: '42' },
                { type: 'ASSERT_THAT', target: 'text', children: [{ type: 'IS_INSTANCE_OF', value: 'String.class' }] },
                { type: 'ASSERT_THAT', target: 'number', children: [{ type: 'IS_INSTANCE_OF', value: 'Integer.class' }] }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Regex Test',
            icon: Regex,
            func: { type: 'FUNCTION', funcName: 'testRegexMatching' },
            children: [
                { type: 'VARIABLE', varType: 'String', varName: 'email', value: '"test@example.com"' },
                { type: 'ASSERT_THAT', target: 'email', children: [{ type: 'MATCHES', value: '"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.+[a-zA-Z]{2,6}$"' }] }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'String Matching',
            icon: Baseline,
            func: { type: 'FUNCTION', funcName: 'testString' },
            children: [
                { type: 'VARIABLE', varType: 'String', varName: 'message', value: '"Hello World"' },
                { type: 'ASSERT_THAT', target: 'message', children: [{ type: 'STARTS_WITH', value: '"Hello"' }, { type: 'ENDS_WITH', value: '"World"' }] }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Exception Test',
            icon: AlertTriangle,
            func: { type: 'FUNCTION', funcName: 'testException' },
            children: [
                { type: 'EXCEPTION_ASSERT', exceptionType: 'NullPointerException.class', code: '() -> myObject.someMethod()' }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Timeout Test',
            icon: Clock,
            func: { type: 'FUNCTION', funcName: 'testTimeout' },
            children: [
                { type: 'COMMENT', value: '// Use JUnit 5\'s assertTimeoutPreemptively to wrap the executable' },
                { type: 'COMMENT', value: '// assertTimeoutPreemptively(Duration.ofMillis(100), () -> {' },
                { type: 'VARIABLE', varType: 'String', varName: 'result', value: '"some result"' },
                { type: 'ASSERT_THAT', target: 'result', children: [{ type: 'IS_EQUAL_TO', value: '"some result"' }] },
                { type: 'COMMENT', value: '// });' }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Verify Naming',
            icon: Fingerprint,
            func: { type: 'FUNCTION', funcName: 'testNamingConventions' },
            children: [
                { type: 'STATIC_ASSERT', checkType: 'CLASS_EXISTS', value: '"MyClass"' },
                { type: 'STATIC_ASSERT', checkType: 'FUNCTION_EXISTS', value: '"public void myMethod()"' },
                { type: 'STATIC_ASSERT', checkType: 'VARIABLE_EXISTS', value: '"int myVariable"' }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Analyze Function',
            icon: Construction,
            func: { type: 'ANALYZE_FUNCTION', funcName: 'myFunctionToAnalyze' },
            children: [
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_FOR_LOOP' },
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_VARIABLE', varType: 'int', varName: 'i' },
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_PARAMETER', varType: 'String', varName: 'param' },
                { type: 'STRUCTURE_CHECK', checkType: 'RETURNS_TYPE', varType: 'boolean' }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Analyze String Function',
            icon: Binary,
            func: { type: 'ANALYZE_FUNCTION', funcName: 'processString' },
            children: [
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_PARAMETER', varType: 'String', varName: 'inputStr' },
                { type: 'STRUCTURE_CHECK', checkType: 'CALLS_METHOD', value: '".length()"' },
                { type: 'STRUCTURE_CHECK', checkType: 'USES_CONCATENATION' },
                { type: 'STRUCTURE_CHECK', checkType: 'RETURNS_TYPE', varType: 'String' }
            ]
        } as TemplateFunction,
    ],
    functions: [
        { type: 'FUNCTION', funcName: 'newTest' },
        { type: 'ANALYZE_FUNCTION', funcName: 'analyzeMyFunction' }
    ],
    setup: [
        { type: 'VARIABLE', varType: 'String', varName: 'myString', value: '"hello"' },
        { type: 'VARIABLE', varType: 'int', varName: 'myInt', value: '10' }
    ],
    assertions: [
        { type: 'ASSERT_THAT', target: 'myString' },
        { type: 'EXCEPTION_ASSERT', exceptionType: 'Exception.class', code: '() -> { /* code that throws */ }' },
        { type: 'STATIC_ASSERT', checkType: 'CLASS_EXISTS', value: '"MyClass"' }
    ],
    structure: [
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_FOR_LOOP' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_VARIABLE', varType: 'int', varName: 'i' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_PARAMETER', varType: 'String', varName: 'param' },
        { type: 'STRUCTURE_CHECK', checkType: 'RETURNS_TYPE', varType: 'boolean' },
        { type: 'STRUCTURE_CHECK', checkType: 'CALLS_METHOD', value: '".length()"' },
        { type: 'STRUCTURE_CHECK', checkType: 'USES_CONCATENATION' },
    ],
    matchers: [
        { type: 'IS_EQUAL_TO', value: '"hello"' },
        { type: 'IS_NOT_NULL' },
        { type: 'HAS_LENGTH', value: '5' },
        { type: 'IS_INSTANCE_OF', value: 'String.class' },
        { type: 'CONTAINS', value: '"item"' },
        { type: 'DOES_NOT_CONTAIN', value: '"item"' },
        { type: 'EXTRACTING', value: '"fieldName"' },
        { type: 'MATCHES', value: '"regex"' },
        { type: 'STARTS_WITH', value: '"prefix"' },
        { type: 'ENDS_WITH', value: '"suffix"' }
    ],
};