import type { AnalyzeFunctionBlock, AssertThatBlock, Block, CommentBlock, ExceptionAssertBlock, FunctionBlock, MatcherBlock, StaticAssertBlock, StructureCheckBlock, VariableBlock } from '../types';

export function generateTestCode(blocks: Block[]): string {
    let code = 'import static org.assertj.core.api.Assertions.assertThat;\n';
    code += 'import static org.assertj.core.api.Assertions.assertThatExceptionOfType;\n\n';
    code += 'import org.junit.jupiter.api.Test;\n';
    code += 'import java.time.Duration;\n\n';
    code += 'class MyGeneratedTest {\n\n';

    const blockOrderMap = blocks.reduce((acc, block, index) => ({ ...acc, [block.id]: index }), {} as Record<string, number>);

    const generateChain = (parentId: string): string => {
        let chain = '';
        const children = blocks.filter(b => b.parentId === parentId).sort((a, b) => blockOrderMap[a.id] - blockOrderMap[b.id]);
        children.forEach(block => {
            const b = block as MatcherBlock; // Assuming only matchers can be in a chain
            switch (b.type) {
                case 'IS_EQUAL_TO': chain += `.isEqualTo(${b.value})`; break;
                case 'IS_NOT_NULL': chain += '.isNotNull()'; break;
                case 'HAS_LENGTH': chain += `.hasSize(${b.value})`; break;
                case 'IS_INSTANCE_OF': chain += `.isInstanceOf(${b.value})`; break;
                case 'CONTAINS': chain += `.contains(${b.value})`; break;
                case 'DOES_NOT_CONTAIN': chain += `.doesNotContain(${b.value})`; break;
                case 'EXTRACTING': chain += `.extracting(${b.value})${generateChain(b.id)}`; break;
                case 'MATCHES': chain += `.matches(${b.value})`; break;
                case 'STARTS_WITH': chain += `.startsWith(${b.value})`; break;
                case 'ENDS_WITH': chain += `.endsWith(${b.value})`; break;
            }
        });
        return chain;
    }

    const topLevelBlocks = blocks.filter(b => !b.parentId).sort((a, b) => blockOrderMap[a.id] - blockOrderMap[b.id]);

    topLevelBlocks.forEach(func => {
        if (func.type === 'FUNCTION') {
            code += `    @Test\n`;
            code += `    void ${(func as FunctionBlock).funcName || 'unnamedTest'}() {\n`;
        } else if (func.type === 'ANALYZE_FUNCTION') {
            code += `    // Static analysis for function: ${(func as AnalyzeFunctionBlock).funcName || 'unnamed'}\n`;
        }

        const children = blocks.filter(b => b.parentId === func.id).sort((a, b) => blockOrderMap[a.id] - blockOrderMap[b.id]);
        children.forEach(block => {
            switch (block.type) {
                case 'VARIABLE': const v = block as VariableBlock; code += `        ${v.varType} ${v.varName || 'unnamedVar'} = ${v.value || 'null'};\n`; break;
                case 'ASSERT_THAT': const a = block as AssertThatBlock; code += `        assertThat(${a.target})${generateChain(a.id)};\n`; break;
                case 'EXCEPTION_ASSERT': const e = block as ExceptionAssertBlock; code += `        assertThatExceptionOfType(${e.exceptionType}).isThrownBy(${e.code});\n`; break;
                case 'COMMENT': code += `        ${(block as CommentBlock).value}\n`; break;
                case 'STATIC_ASSERT': const s = block as StaticAssertBlock; code += `        // Verify: ${s.checkType.replace('_', ' ').toLowerCase()} -> ${s.value}\n`; break;
                case 'STRUCTURE_CHECK':
                    const sc = block as StructureCheckBlock;
                    switch (sc.checkType) {
                        case 'HAS_FOR_LOOP': code += `        //  - check for 'for' loop\n`; break;
                        case 'HAS_VARIABLE': code += `        //  - check for variable: ${sc.varType} ${sc.varName}\n`; break;
                        case 'HAS_PARAMETER': code += `        //  - check for parameter: ${sc.varType} ${sc.varName}\n`; break;
                        case 'RETURNS_TYPE': code += `        //  - check for return type: ${sc.varType}\n`; break;
                        case 'CALLS_METHOD': code += `        //  - check for method call: ${sc.value}\n`; break;
                        case 'USES_CONCATENATION': code += `        //  - check for string concatenation (+)\n`; break;
                    }
                    break;
            }
        });

        if (func.type === 'FUNCTION') code += `    }\n\n`;
        else code += '\n';
    });
    code += '}';
    return code.trim() + '\n';
}