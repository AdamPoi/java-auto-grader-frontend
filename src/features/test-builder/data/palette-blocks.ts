import {
    Baseline,
    Fingerprint,
    List,
    Pilcrow,
    Play,
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
            templateName: 'Function Test',
            icon: Play,
            func: { type: 'FUNCTION', funcName: 'functionTest' },
            children: [
                {
                    id: 'fn-test-1',
                    type: 'FUNCTION_TEST',
                    className: 'Main',
                    methodName: 'add',
                    parameters: [
                        { name: 'a', varType: 'int', value: '1' },
                        { name: 'b', varType: 'int', value: '2' }
                    ],
                    expected: { name: 'expectedSum', varType: 'int', value: '3' }
                }
            ]
        } as TemplateFunction,
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
        {
            type: 'TEMPLATE_FUNCTION',
            templateName: 'Array Test',
            icon: List,
            func: { type: 'FUNCTION', funcName: 'testArray' },
            children: [
                { type: 'VARIABLE', varType: 'int[]', varName: 'numbers', value: '1, 2, 3, 4, 5' },
                { type: 'VARIABLE', varType: 'String[]', varName: 'words', value: '"hello", "world"' },
                {
                    type: 'ASSERT_THAT', target: 'numbers', children: [
                        { type: 'HAS_LENGTH', value: '5' },
                        { type: 'CONTAINS_EXACTLY', value: '1, 2, 3, 4, 5' }
                    ]
                },
                {
                    type: 'ASSERT_THAT', target: 'words', children: [
                        { type: 'CONTAINS_ONLY', value: '"hello", "world"' },
                        { type: 'DOES_NOT_CONTAIN', value: '"test"' }
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

        // {
        //     type: 'TEMPLATE_FUNCTION',
        //     templateName: 'Multiple Cases',
        //     icon: Pilcrow,
        //     func: { type: 'FUNCTION', funcName: 'testMultipleCases' },
        //     children: [
        //         { type: 'VARIABLE', varType: 'String[]', varName: 'inputs', value: 'new String[]{\"5 3 8 1 4 7 9 null 2\",\"2 1 3\"}' },
        //         { type: 'VARIABLE', varType: 'String[]', varName: 'expected', value: 'new String[]{\"3\",\"1\"}' },

        //         { type: 'COMMENT', value: 'for (int i = 0; i < inputs.length; i++) {' },
        //         { type: 'COMMENT', value: '    // parse tree and targets from inputs[i]' },
        //         { type: 'VARIABLE', varType: 'TreeNode', varName: 'root', value: 'buildTree(inputs[i])' },
        //         { type: 'VARIABLE', varType: 'int', varName: 'p', value: 'Integer.parseInt(inputs[i].split(\" \")[0])' },
        //         { type: 'VARIABLE', varType: 'int', varName: 'q', value: 'Integer.parseInt(inputs[i].split(\" \")[1])' },

        //         { type: 'VARIABLE', varType: 'TreeNode', varName: 'result', value: 'lowestCommonAncestor(root, p, q)' },
        //         {
        //             type: 'ASSERT_THAT',
        //             target: 'result',
        //             children: [
        //                 { type: 'IS_EQUAL_TO', value: 'Integer.valueOf(expected[i])' }
        //             ]
        //         },
        //         { type: 'COMMENT', value: '}' }
        //     ]
        // } as TemplateFunction,
    ],
    functions: [
        { type: 'FUNCTION', funcName: 'newTest' },
    ],
    setup: [
        { type: 'VARIABLE', varType: 'String', varName: 'myString', value: 'hello' },
        {
            type: 'FUNCTION_TEST',
            className: 'Main',
            methodName: 'add',
            parameters: [
                { name: 'a', varType: 'int', value: '1' },
                { name: 'b', varType: 'int', value: '2' }
            ],
            expected: { name: 'expectedSum', varType: 'int', value: '3' }
        }
    ],
    assertions: [
        { type: 'ASSERT_THAT', target: 'myString' },
        // { type: 'EXCEPTION_ASSERT', exceptionType: 'Exception.class', code: '() -> { /* code that throws */ }' },
        // { type: 'STATIC_ASSERT', checkType: 'VARIABLE_USED_IN_CLASS', value: 'MyClass', className: 'MyClass', methodName: 'myMethod' },

    ],
    structure: [
        { type: 'STATIC_ASSERT', checkType: 'CLASS_EXISTS', varName: 'myVariable', className: 'MyClass', methodName: 'myMethod' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_LOOP', varType: 'FOR', methodName: 'myMethod' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_CONDITIONAL', varType: 'IF', methodName: 'myMethod' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_PARAMETER', varType: 'String', varName: 'param' },
        { type: 'STRUCTURE_CHECK', checkType: 'HAS_RETURN', varType: 'boolean', value: 'true', methodName: 'myMethod' },
    ],
    matchers: [
        { type: 'IS_EQUAL_TO', value: 'hello' },
        { type: 'IS_NOT_NULL' },
        { type: 'HAS_SIZE', value: '5' },
        { type: 'IS_INSTANCE_OF', value: 'String.class' },
        { type: 'EXTRACTING', value: 'fieldName' },
        { type: 'MATCHES', value: 'regex' },
        { type: 'STARTS_WITH', value: 'prefix' },
        { type: 'ENDS_WITH', value: 'suffix' },
        { type: 'CONTAINS_ONLY', value: 'item' },
        { type: 'CONTAINS_EXACTLY', value: 'item' },
        { type: 'CONTAINS_EXACTLY_IN_ANY_ORDER', value: 'item' },
        { type: 'CONTAINS_SEQUENCE', value: 'item' },
        { type: 'CONTAINS_SUBSEQUENCE', value: 'item' },
        { type: 'CONTAINS_ONLY_ONCE', value: 'item' },
        { type: 'CONTAINS_ANY_OF', value: 'item' },
        { type: 'DOES_NOT_CONTAIN', value: 'item' },
        { type: 'IS_TRUE', value: 'item' },
        { type: 'IS_FALSE', value: 'item' },
        { type: 'IS_NULL', value: 'item' },
        { type: 'IS_NOT_NULL', value: 'item' },
        { type: 'IS_EMPTY', value: 'item' },
        { type: 'IS_NOT_EMPTY', value: 'item' },
    ],
};