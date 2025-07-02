import { v4 as uuidv4 } from 'uuid';
import type {
    AssertThatBlock,
    Block,
    BlockType,
    FunctionBlock,
    FunctionTestBlock,
    MatcherBlock,
    OutputBlock,
    VariableBlock
} from '../data/types';

export const parseJavaCodeToBlocks = (javaCode: string): Block[] => {
    const blocks: Block[] = [];
    const lines = javaCode.split('\n');
    let currentFunctionId: string | null = null;
    let functionStartLine: number = -1;
    let braceLevel = 0;

    const generateId = () => uuidv4();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect @Test methods
        if (line.startsWith('@Test') && lines[i + 1] && lines[i + 1].includes('void')) {
            const funcSignatureLine = lines[i + 1].trim();
            const funcNameMatch = funcSignatureLine.match(/void\s+(\w+)\s*\(/);
            if (funcNameMatch && funcNameMatch[1]) {
                currentFunctionId = generateId();
                functionStartLine = i + 1;
                braceLevel = 0;
                const functionBlock: FunctionBlock = {
                    id: currentFunctionId,
                    parentId: null,
                    type: 'FUNCTION',
                    funcName: funcNameMatch[1],
                };
                blocks.push(functionBlock);
            }
        }

        if (currentFunctionId) {
            // Track brace level
            braceLevel += (line.match(/{/g) || []).length;
            braceLevel -= (line.match(/}/g) || []).length;

            let isStaticAssert = false;
            let isStructureCheck = false;
            let isFunctionTest = false;

            if (line.includes('Static test')) {
                if (line.includes('.as("Static test: Expect static field') && line.includes('to be called within method')) {
                    const varNameMatch = line.match(/field '(.*?)' to be called within method '(.*?)'/);
                    if (varNameMatch) {
                        const checkType = line.includes('class') ? 'VARIABLE_CALLED_IN_CLASS' : 'VARIABLE_CALLED_IN_FUNCTION';
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STATIC_ASSERT',
                            checkType: checkType,
                            varName: varNameMatch[1],
                            ...(checkType === 'VARIABLE_CALLED_IN_CLASS' ? { className: varNameMatch[2] } : { methodName: varNameMatch[2] })
                        });
                        isStaticAssert = true;
                    }
                }
                else if (line.includes('.as("Static test: Expect variable named') && line.includes('to exist in method')) {
                    const varNameMatch = line.match(/variable named '(.*?)' to exist in method '(.*?)'/);
                    if (varNameMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STATIC_ASSERT',
                            checkType: 'VARIABLE_EXISTS_IN_FUNCTION',
                            varName: varNameMatch[1],
                            methodName: varNameMatch[2]
                        });
                        isStaticAssert = true;
                    }
                } else if (line.includes('as("Static test: Expect variable named') && line.includes('to exist in class')) {
                    const varNameMatch = line.match(/variable named '(.*?)' to exist in class '(.*?)'/);
                    if (varNameMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STATIC_ASSERT',
                            checkType: 'VARIABLE_EXISTS_IN_CLASS',
                            varName: varNameMatch[1],
                            className: varNameMatch[2]
                        });
                        isStaticAssert = true;
                    }
                } else if (line.includes('.as("Static test: Expect method named') && line.includes('to exist in class')) {
                    const varNameMatch = line.match(/method named '(.*?)'/);
                    const classNameMatch = line.match(/in class '(.*?)'/);

                    const varName = varNameMatch && varNameMatch[1] ? varNameMatch[1] : '';
                    const className = classNameMatch && classNameMatch[1] ? classNameMatch[1] : '';
                    blocks.push({
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'STATIC_ASSERT',
                        checkType: 'FUNCTION_EXISTS_IN_CLASS',
                        varName: varName,
                        className: className
                    });
                    isStaticAssert = true;
                }
                else if (line.includes('.as("Static test: Expect method named')) {
                    const varNameMatch = line.match(/method named '(.*?)'/);
                    if (varNameMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STATIC_ASSERT',
                            checkType: 'FUNCTION_EXISTS',
                            varName: varNameMatch[1]
                        });
                        isStaticAssert = true;
                    }
                }
                else if (line.includes('.as("Static test: Expect variable named')) {
                    const varNameMatch = line.match(/variable named '(.*?)'/);
                    if (varNameMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STATIC_ASSERT',
                            checkType: 'VARIABLE_EXISTS',
                            varName: varNameMatch[1]
                        });
                        isStaticAssert = true;
                    }
                } else if (line.includes('.as("Static test: Expect class named')) {
                    const varNameMatch = line.match(/class named '(.*?)'/);
                    if (varNameMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STATIC_ASSERT',
                            checkType: 'CLASS_EXISTS',
                            varName: varNameMatch[1]
                        });
                        isStaticAssert = true;
                    }
                }
            }
            else if (line.includes('Structure Check')) {
                // Detect Structure Checks
                // HAS_LOOP
                if (line.includes('Structure Check (has loop)')) {
                    const methodNameMatch = line.match(/method '(.*?)'/);
                    const loopTypeMatch = line.match(/loop of type '(.*?)'/);
                    if (methodNameMatch && loopTypeMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STRUCTURE_CHECK',
                            checkType: 'HAS_LOOP',
                            methodName: methodNameMatch[1],
                            varType: loopTypeMatch[1],
                        });
                    }
                    isStructureCheck = true;
                }
                // HAS_CONDITIONAL
                else if (line.includes('Structure Check (has conditional)')) {
                    const methodNameMatch = line.match(/method '(.*?)'/);
                    const conditionalTypeMatch = line.match(/conditional statement '(.*?)'/);
                    if (methodNameMatch && conditionalTypeMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STRUCTURE_CHECK',
                            checkType: 'HAS_CONDITIONAL',
                            methodName: methodNameMatch[1],
                            varType: conditionalTypeMatch[1],
                        });
                        isStructureCheck = true;
                    }
                }

                // HAS_RETURN
                else if (line.includes('Structure Check (has return)')) {
                    const methodNameMatch = line.match(/method '(.*?)'/);
                    const returnValueMatch = line.match(/return value '(.*?)'/);
                    const returnTypeMatch = line.match(/type of '(.*?)'/);
                    if (methodNameMatch && returnTypeMatch && returnValueMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STRUCTURE_CHECK',
                            checkType: 'HAS_RETURN',
                            methodName: methodNameMatch[1],
                            varType: returnTypeMatch[1],
                            value: returnValueMatch[1],
                        });
                        isStructureCheck = true;
                    }
                }
                // HAS_PARAMETER
                else if (line.includes('Structure Check (has Parameter)')) {
                    const methodNameMatch = line.match(/method '(.*?)'/);
                    const parameterNameMatch = line.match(/parameter '(.*?)'/);
                    const expectedTypeMatch = line.match(/type '(.*?)'/);
                    if (methodNameMatch && parameterNameMatch && expectedTypeMatch) {
                        blocks.push({
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'STRUCTURE_CHECK',
                            checkType: 'HAS_PARAMETER',
                            methodName: methodNameMatch[1],
                            varName: parameterNameMatch[1],
                            varType: expectedTypeMatch[1],
                        });
                        isStructureCheck = true;
                    }
                }
            }
            else if (line.includes('Function Test:')) {
                const functionTestMatch = line.match(/Function Test: Expect (\w+)\((.*?)\) → " \+ (\w+)/);
                if (functionTestMatch) {
                    const methodName = functionTestMatch[1];
                    const argsString = functionTestMatch[2];
                    const expectedVarName = functionTestMatch[3];

                    // Parse parameters from previous lines with ft_ prefix
                    const parameters: { name: string; varType: string; value: string }[] = [];
                    let className = 'Main'; // Default class name
                    let expected = { name: expectedVarName, varType: 'int', value: '0' }; // Default expected

                    // Look backwards to find variable declarations with ft_ prefix
                    for (let j = i - 1; j >= 0 && j >= i - 20; j--) { // Look back max 20 lines
                        const prevLine = lines[j].trim();

                        // Find object instantiation to get class name
                        const objMatch = prevLine.match(/(\w+)\s+obj\s*=\s*new\s+(\w+)\(/);
                        if (objMatch) {
                            className = objMatch[2];
                        }

                        // Find parameter variables with ft_ prefix (but not _ft_ prefix)
                        const paramMatch = prevLine.match(/(String|int|boolean|double|float|long)\s+(ft_\w+)\s*=\s*(.*);/);
                        if (paramMatch) {
                            const [, varType, varName, rawValue] = paramMatch;
                            let cleanValue = rawValue.trim().replace(/;$/, '');

                            // Clean the value based on type
                            if (varType === 'String' && cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                                cleanValue = cleanValue.slice(1, -1);
                            }
                            if (varType === 'long' && cleanValue.endsWith('L')) {
                                cleanValue = cleanValue.slice(0, -1);
                            }
                            if (varType === 'float' && cleanValue.endsWith('f')) {
                                cleanValue = cleanValue.slice(0, -1);
                            }
                            if (varType === 'double' && cleanValue.endsWith('d')) {
                                cleanValue = cleanValue.slice(0, -1);
                            }

                            // Extract original parameter name (remove ft_ prefix and unique suffix)
                            const originalName = varName.replace(/^ft_/, '').replace(/_[a-zA-Z0-9_]+$/, '');

                            parameters.unshift({
                                name: originalName,
                                varType,
                                value: cleanValue
                            });
                        }

                        // Find expected variable with _ft_ prefix (note the underscore at the beginning)
                        const expectedMatch = prevLine.match(/(String|int|boolean|double|float|long)\s+(_ft_\w+)\s*=\s*(.*);/);
                        if (expectedMatch && expectedMatch[2] === expectedVarName) {
                            const [, varType, varName, rawValue] = expectedMatch;
                            let cleanValue = rawValue.trim().replace(/;$/, '');

                            // Clean the value based on type
                            if (varType === 'String' && cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                                cleanValue = cleanValue.slice(1, -1);
                            }
                            if (varType === 'long' && cleanValue.endsWith('L')) {
                                cleanValue = cleanValue.slice(0, -1);
                            }
                            if (varType === 'float' && cleanValue.endsWith('f')) {
                                cleanValue = cleanValue.slice(0, -1);
                            }
                            if (varType === 'double' && cleanValue.endsWith('d')) {
                                cleanValue = cleanValue.slice(0, -1);
                            }

                            // Extract original name (remove _ft_ prefix and unique suffix)
                            const originalName = varName.replace(/^_ft_/, '').replace(/_[a-f0-9_]+$/, '');
                            expected = {
                                name: originalName,
                                varType,
                                value: cleanValue
                            };
                        }
                    }

                    const functionTestBlock: FunctionTestBlock = {
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'FUNCTION_TEST',
                        className,
                        methodName,
                        parameters,
                        expected
                    };

                    blocks.push(functionTestBlock);
                    isFunctionTest = true;
                }
            }
            // Detect System.out.println for OUTPUT block

            else if (line.includes('System.out.println(') || line.includes('System.out.print(')) {
                const outputMatch = line.match(/System\.out\.print(?:ln)?\((.*)\);/);
                if (outputMatch) {
                    let outputValue = outputMatch[1].trim();
                    // Remove surrounding quotes if it's a string literal
                    if (outputValue.startsWith('"') && outputValue.endsWith('"')) {
                        outputValue = outputValue.slice(1, -1);
                    }

                    const outputBlock: OutputBlock = {
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'OUTPUT',
                        value: outputValue,
                    };
                    blocks.push(outputBlock);
                }
            }
            // Detect assertThat calls (only if not a static assert)
            else if (line.includes('assertThat(') && !isStaticAssert && !isStructureCheck && !isFunctionTest) {
                const assertThatMatch = line.match(/assertThat\((.*?)\)\.(.*);/);
                if (assertThatMatch) {
                    const [, target, chain] = assertThatMatch;
                    const assertBlockId = generateId();
                    const assertThatBlock: AssertThatBlock = {
                        id: assertBlockId,
                        parentId: currentFunctionId,
                        type: 'ASSERT_THAT',
                        target: target.trim(),
                    };
                    blocks.push(assertThatBlock);

                    const matcherParts = chain.split(').').filter(part => part.length > 0);
                    matcherParts.forEach(matcherPart => {
                        const rawMatcherName = matcherPart.split('(')[0].trim();
                        // Map common matcher names to their block types
                        const matcherNameMap: Record<string, BlockType> = {
                            'isEqualTo': 'IS_EQUAL_TO',
                            'isNotEqualTo': 'IS_NOT_EQUAL_TO',
                            'isInstanceOf': 'IS_INSTANCE_OF',
                            'startsWith': 'STARTS_WITH',
                            'endsWith': 'ENDS_WITH',
                            'matches': 'MATCHES',
                            'containsOnly': 'CONTAINS_ONLY',
                            'containsExactly': 'CONTAINS_EXACTLY',
                            'containsExactlyInAnyOrder': 'CONTAINS_EXACTLY_IN_ANY_ORDER',
                            'containsSequence': 'CONTAINS_SEQUENCE',
                            'containsSubsequence': 'CONTAINS_SUBSEQUENCE',
                            'containsOnlyOnce': 'CONTAINS_ONLY_ONCE',
                            'containsAnyOf': 'CONTAINS_ANY_OF',
                            'extracting': 'EXTRACTING',
                            'isTrue': 'IS_TRUE',
                            'isFalse': 'IS_FALSE',
                            'isNull': 'IS_NULL',
                            'isNotNull': 'IS_NOT_NULL',
                            'contains': 'CONTAINS',
                            'doesNotContain': 'DOES_NOT_CONTAIN',
                            'hasSize': 'HAS_SIZE',
                            'isEmpty': 'IS_EMPTY',
                            'isNotEmpty': 'IS_NOT_EMPTY'
                        };

                        const matcherName = matcherNameMap[rawMatcherName] || rawMatcherName.toUpperCase() as BlockType;
                        const matcherValueMatch = matcherPart.match(/\((.*)\)/);
                        const matcherValue = matcherValueMatch ? matcherValueMatch[1].trim() : undefined;

                        const matcherBlock: MatcherBlock = {
                            id: generateId(),
                            parentId: assertBlockId,
                            type: matcherName,
                            ...(matcherValue && { value: matcherValue })
                        };
                        blocks.push(matcherBlock);
                    });
                }
            }

            else if (!isStaticAssert && !isStructureCheck && !isFunctionTest) {

                const varMatch = line.match(/(String|int|boolean|double|float|long)\s+(\w+)\s*=\s*(.*);/);
                if (varMatch) {
                    const [, varType, varName, rawValue] = varMatch;
                    // Skip variables with sc_ prefix (structure check variables)
                    if (!varName.startsWith('sc_') && !varName.startsWith('ft_') && !varName.startsWith('_to_') && !varName.startsWith('_')) {
                        // Clean the value by removing type-specific formatting
                        let cleanValue = rawValue.trim().replace(/;$/, '');
                        // Remove quotes for String types
                        if (varType === 'String' && cleanValue.startsWith('"') && cleanValue.endsWith('"')) {
                            cleanValue = cleanValue.slice(1, -1);
                        }
                        // Remove single quotes for char types
                        if (varType === 'char' && cleanValue.startsWith("'") && cleanValue.endsWith("'")) {
                            cleanValue = cleanValue.slice(1, -1);
                        }
                        // Remove type suffixes (L for long, f for float, d for double)
                        if (varType === 'long' && cleanValue.endsWith('L')) {
                            cleanValue = cleanValue.slice(0, -1);
                        }
                        if (varType === 'float' && cleanValue.endsWith('f')) {
                            cleanValue = cleanValue.slice(0, -1);
                        }
                        if (varType === 'double' && cleanValue.endsWith('d')) {
                            cleanValue = cleanValue.slice(0, -1);
                        }
                        const variableBlock: VariableBlock = {
                            id: generateId(),
                            parentId: currentFunctionId,
                            type: 'VARIABLE',
                            varType: varType,
                            varName: varName,
                            value: cleanValue
                        };
                        blocks.push(variableBlock);
                    }
                }
            }


            // End of function - when we're back to brace level 0 and have seen a closing brace
            if (braceLevel <= 0 && line.includes('}')) {
                currentFunctionId = null;
                braceLevel = 0;
            }
        }
    }
    return blocks;
};