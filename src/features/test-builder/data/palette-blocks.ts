import {
    Baseline,
    Binary,
    Construction,
    Fingerprint,
    Pilcrow,
    Regex,
    TestTube,
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
                { type: 'VARIABLE', varType: 'String', varName: 'input', value: 'some_input' },
                { type: 'VARIABLE', varType: 'String', varName: 'expectedOutput', value: 'expected_result' },
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
                { type: 'VARIABLE', varType: 'String', varName: 'text', value: 'example' },
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
                { type: 'VARIABLE', varType: 'String', varName: 'email', value: 'test@example.com' },
                {
                    type: 'ASSERT_THAT', target: 'email',
                    children: [
                        { type: 'MATCHES', value: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\\\.+[a-zA-Z]{2,6}$' }
                    ]
                }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'String Matching',
            icon: Baseline,
            func: { type: 'FUNCTION', funcName: 'testString' },
            children: [
                { type: 'VARIABLE', varType: 'String', varName: 'message', value: 'Hello World' },
                {
                    type: 'ASSERT_THAT', target: 'message',
                    children: [
                        { type: 'STARTS_WITH', value: 'Hello' },
                        { type: 'ENDS_WITH', value: 'World' }
                    ]
                }
            ]
        } as TemplateFunction,

        // {
        //     type: 'TEMPLATE_FUNCTION',
        //     templateName: 'Exception Test',
        //     icon: AlertTriangle,
        //     func: { type: 'FUNCTION', funcName: 'testException' },
        //     children: [
        //         { type: 'EXCEPTION_ASSERT', exceptionType: 'NullPointerException.class', code: '() -> myObject.someMethod()' }
        //     ]
        // } as TemplateFunction,
        // {
        //     type: 'TEMPLATE_FUNCTION',
        //     templateName: 'Timeout Test',
        //     icon: Clock,
        //     func: { type: 'FUNCTION', funcName: 'testTimeout' },
        //     children: [
        //         { type: 'COMMENT', value: '// Use JUnit 5\'s assertTimeoutPreemptively to wrap the executable' },
        //         { type: 'COMMENT', value: '// assertTimeoutPreemptively(Duration.ofMillis(100), () -> {' },
        //         { type: 'VARIABLE', varType: 'String', varName: 'result', value: 'some result' },
        //         { type: 'ASSERT_THAT', target: 'result', children: [{ type: 'IS_EQUAL_TO', value: 'some result' }] },
        //         { type: 'COMMENT', value: '// });' }
        //     ]
        // } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Verify Naming',
            icon: Fingerprint,
            func: { type: 'FUNCTION', funcName: 'testNamingConventions' },
            children: [
                { type: 'STATIC_ASSERT', checkType: 'CLASS_EXISTS', value: 'MyClass' },
                { type: 'STATIC_ASSERT', checkType: 'FUNCTION_EXISTS', value: 'public void myMethod()' },
                { type: 'STATIC_ASSERT', checkType: 'VARIABLE_EXISTS', value: 'int myVariable' }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Analyze Function',
            icon: Construction,
            func: { type: 'ANALYZE_FUNCTION', funcName: 'myFunctionToAnalyze' },
            children: [
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_LOOP' },
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_CONDITIONAL' },
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_VARIABLE', varType: 'int', varName: 'i' },
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_PARAMETER', varType: 'String', varName: 'param' },
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_RETURN', varType: 'boolean', value: 'true' }
            ]
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Analyze String Function',
            icon: Binary,
            func: { type: 'ANALYZE_FUNCTION', funcName: 'processString' },
            children: [
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_PARAMETER', varType: 'String', varName: 'inputStr' },
                // { type: 'STRUCTURE_CHECK', checkType: 'CALLS_METHOD', value: '.length()' },
                // { type: 'STRUCTURE_CHECK', checkType: 'USES_CONCATENATION' },
                { type: 'STRUCTURE_CHECK', checkType: 'HAS_RETURN', varType: 'String' }
            ]
        } as TemplateFunction,
        {
            type: "TEMPLATE_FUNCTION",
            templateName: "Test Case Function",
            icon: TestTube,
            func: { type: 'TEST_CASE_FUNCTION', funcName: 'testString' },
            children: [
                { type: 'VARIABLE', varType: 'String', varName: 'message', value: 'Hello World' },
                { type: 'CSV_CASE', input: '[2,7]', expected: '2' },
                { type: 'CSV_CASE', input: '9', expected: '2' },
            ]
            // props: {
            //     methodName: "",
            //     inputs: [],
            //     expectedOutput: "",
            //     expectedSysOut: "",
            // },
            // Optionally, you could use an icon here
            // shadcn/lucide
            // documentation: "Tests a single function with a set of input values and expected output. Typically used for parameterized/unit tests."
        } as TemplateFunction,
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Multiple Cases',
            icon: Pilcrow,
            func: { type: 'FUNCTION', funcName: 'testMultipleCases' },
            children: [
                // 1) Define parallel arrays of raw inputs & expected results
                { type: 'VARIABLE', varType: 'String[]', varName: 'inputs', value: 'new String[]{\"5 3 8 1 4 7 9 null 2\",\"2 1 3\"}' },
                { type: 'VARIABLE', varType: 'String[]', varName: 'expected', value: 'new String[]{\"3\",\"1\"}' },

                // 2) Loop over each case
                { type: 'COMMENT', value: 'for (int i = 0; i < inputs.length; i++) {' },
                { type: 'COMMENT', value: '    // parse tree and targets from inputs[i]' },
                { type: 'VARIABLE', varType: 'TreeNode', varName: 'root', value: 'buildTree(inputs[i])' },
                { type: 'VARIABLE', varType: 'int', varName: 'p', value: 'Integer.parseInt(inputs[i].split(\" \")[0])' },
                { type: 'VARIABLE', varType: 'int', varName: 'q', value: 'Integer.parseInt(inputs[i].split(\" \")[1])' },

                // 3) Invoke and assert per iteration
                { type: 'VARIABLE', varType: 'TreeNode', varName: 'result', value: 'lowestCommonAncestor(root, p, q)' },
                {
                    type: 'ASSERT_THAT',
                    target: 'result',
                    children: [
                        { type: 'IS_EQUAL_TO', value: 'Integer.valueOf(expected[i])' }
                    ]
                },
                { type: 'COMMENT', value: '}' }
            ]
        } as TemplateFunction,
    ],
    functions: [
        { type: 'FUNCTION', funcName: 'newTest' },
        { type: 'ANALYZE_FUNCTION', funcName: 'analyzeMyFunction' },
        { type: 'TEST_CASE_FUNCTION', funcName: 'testCaseFunction' }

    ],
    setup: [
        { type: 'VARIABLE', varType: 'String', varName: 'myString', value: 'hello' },
        // { type: 'VARIABLE', varType: 'int', varName: 'myInt', value: '10' },
        // { type: 'VARIABLE', varType: 'long', varName: 'myLong', value: '10' },
        // { type: 'VARIABLE', varType: 'float', varName: 'myFloat', value: '10' },
        // { type: 'VARIABLE', varType: 'double', varName: 'myDouble', value: '10' },
        // { type: 'VARIABLE', varType: 'short', varName: 'myShort', value: '10' },
        // { type: 'VARIABLE', varType: 'boolean', varName: 'myBoolean', value: '10' },
        // { type: 'VARIABLE', varType: 'char', varName: 'myChar', value: '10' },
        // { type: 'VARIABLE', varType: 'byte', varName: 'myByte', value: '10' },

    ],
    assertions: [
        { type: 'ASSERT_THAT', target: 'myString' },
        // { type: 'EXCEPTION_ASSERT', exceptionType: 'Exception.class', code: '() -> { /* code that throws */ }' },
        // { type: 'STATIC_ASSERT', checkType: 'VARIABLE_USED_IN_CLASS', value: 'MyClass', className: 'MyClass', methodName: 'myMethod' },

    ],
    structure: [
        { type: 'STATIC_ASSERT', checkType: 'CLASS_EXISTS', varName: 'myVariable', className: 'MyClass', methodName: 'myMethod' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_LOOP' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_CONDITIONAL' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_VARIABLE', varType: 'int', varName: 'i' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_PARAMETER', varType: 'String', varName: 'param' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_RETURN', varType: 'boolean' },
    ],
    matchers: [
        { type: 'IS_EQUAL_TO', value: 'hello' },
        { type: 'IS_NOT_NULL' },
        { type: 'HAS_LENGTH', value: '5' },
        { type: 'IS_INSTANCE_OF', value: 'String.class' },
        { type: 'CONTAINS', value: 'item' },
        { type: 'DOES_NOT_CONTAIN', value: 'item' },
        // { type: 'EXTRACTING', value: 'fieldName' },
        { type: 'MATCHES', value: 'regex' },
        { type: 'STARTS_WITH', value: 'prefix' },
        { type: 'ENDS_WITH', value: 'suffix' }
    ],
};