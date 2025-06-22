import { v4 as uuidv4 } from 'uuid';
import type {
    AssertThatBlock,
    Block,
    BlockType,


    FunctionBlock,
    MatcherBlock,
    VariableBlock
} from '../data/types';

export const parseJavaCodeToBlocks = (javaCode: string): Block[] => {
    const blocks: Block[] = [];
    const lines = javaCode.split('\n');
    let currentFunctionId: string | null = null;


    const generateId = () => uuidv4();

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect @Test methods
        if (line.startsWith('@Test') && lines[i + 1] && lines[i + 1].includes('void')) {
            const funcSignatureLine = lines[i + 1].trim();
            const funcNameMatch = funcSignatureLine.match(/void\s+(\w+)\s*\(/);
            if (funcNameMatch && funcNameMatch[1]) {
                currentFunctionId = generateId();
                const functionBlock: FunctionBlock = {
                    id: currentFunctionId,
                    parentId: null,
                    type: 'FUNCTION',
                    funcName: funcNameMatch[1],
                };
                blocks.push(functionBlock);
            }
        }
        else if (currentFunctionId) {


            if (line.includes('assertThat(fileName).as("Expect class named')) {
                const varNameMatch = line.match(/class named '(.*?)'/);
                if (varNameMatch) {
                    blocks.push({
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'STATIC_ASSERT',
                        checkType: 'CLASS_EXISTS',
                        varName: varNameMatch[1]
                    });
                }
            } else if (line.includes('assertThat(functionExists).as("Expect method named')) {
                const varNameMatch = line.match(/method named '(.*?)'/);
                if (varNameMatch) {
                    blocks.push({
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'STATIC_ASSERT',
                        checkType: 'FUNCTION_EXISTS',
                        varName: varNameMatch[1]
                    });
                }
            } else if (line.includes('assertThat(variableNameExists).as("Expect field named')) {
                const varNameMatch = line.match(/field named '(.*?)'/);
                if (varNameMatch) {
                    blocks.push({
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'STATIC_ASSERT',
                        checkType: 'VARIABLE_EXISTS',
                        varName: varNameMatch[1]
                    });
                }
            } else if (line.includes('assertThat(functionExistsInClass).as("Expect method') && line.includes('to exist in class')) {
                const varNameMatch = line.match(/method '(.*?)' to exist in class '(.*?)'/);
                if (varNameMatch) {
                    blocks.push({
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'STATIC_ASSERT',
                        checkType: 'FUNCTION_EXISTS_IN_CLASS',
                        varName: varNameMatch[1],
                        className: varNameMatch[2]
                    });
                }
            } else if (line.includes('assertThat(fieldExistsInClass).as("Expect field') && line.includes('to exist in class')) {
                const varNameMatch = line.match(/field '(.*?)' to exist in class '(.*?)'/);
                if (varNameMatch) {
                    blocks.push({
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'STATIC_ASSERT',
                        checkType: 'VARIABLE_EXISTS_IN_CLASS',
                        varName: varNameMatch[1],
                        className: varNameMatch[2]
                    });
                }
            } else if (line.includes('assertThat(variableExistsInFunction).as("Expect variable')) {
                const varNameMatch = line.match(/variable '(.*?)' to exist in method '(.*?)'/);
                if (varNameMatch) {
                    blocks.push({
                        id: generateId(),
                        parentId: currentFunctionId,
                        type: 'STATIC_ASSERT',
                        checkType: 'VARIABLE_EXISTS_IN_FUNCTION',
                        varName: varNameMatch[1],
                        methodName: varNameMatch[2]
                    });
                }
            } else if (line.includes('assertThat(isVariableCalled).as("Expect static field')) {
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
                }
            }
            // Detect Variable declarations
            const varMatch = line.match(/(String|int|boolean|double|float|long)\s+(\w+)\s*=\s*(.*);/);
            if (varMatch) {
                const [, varType, varName, value] = varMatch;
                const variableBlock: VariableBlock = {
                    id: generateId(),
                    parentId: currentFunctionId,
                    type: 'VARIABLE',
                    varType: varType,
                    varName: varName,
                    value: value.trim().replace(/;$/, '') // Remove trailing semicolon
                };
                blocks.push(variableBlock);
            }
            // Detect assertThat calls
            else if (line.includes('assertThat(') && line.includes(').')) {
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
                        const matcherName = matcherPart.split('(')[0].trim().toUpperCase() as BlockType;
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

            // End of function block
            else if (line === '}') {
                currentFunctionId = null; // Exit current function scope
            }
        }
    }
    return blocks;
};