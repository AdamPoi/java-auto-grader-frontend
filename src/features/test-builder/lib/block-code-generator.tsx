import type { AssertThatBlock, Block, CaseSourceBlock, ExceptionAssertBlock, FunctionBlock, FunctionTestBlock, MatcherBlock, OutputBlock, StaticAssertBlock, StaticAssertType, StructureCheckBlock, VariableBlock } from '../data/types';


export const generateSetupCode = () => {
    let code = ''
    // Junit, Assertj, Java Parser setup code
    code += `
private static final String SOURCE_PATH = "src/main/java/workspace";
private static List<CompilationUnit> allCompilationUnits;

@BeforeAll
public static void setup() throws IOException {
    SourceRoot sourceRoot = new SourceRoot(Paths.get(SOURCE_PATH));

    allCompilationUnits = sourceRoot.tryToParse("").stream()
            .filter(result -> result.isSuccessful() && result.getResult().isPresent())
            .map(result -> result.getResult().get())
            .toList();

    Assertions.assertThat(allCompilationUnits).isNotEmpty();
    System.out.printf("Successfully parsed %d Java files for testing.%n", allCompilationUnits.size());

}
    `
    return code
}

export const generateLibraryImportCode = () => {

    const imports = [
        'org.assertj.core.api.Assertions',
        'java.io.ByteArrayInputStream',
        'java.io.ByteArrayOutputStream',
        'java.io.IOException',
        'java.io.InputStream',
        'java.io.PrintStream',
        'java.lang.reflect.Method',
        'java.nio.file.Paths',
        'java.util.Arrays',
        'java.util.List',
        'java.util.stream.Stream',
        'org.junit.jupiter.api.BeforeAll',
        'org.junit.jupiter.api.Test',
        'org.junit.jupiter.params.ParameterizedTest',
        'org.junit.jupiter.params.provider.CsvSource',
        'org.junit.jupiter.params.provider.MethodSource',
        'com.github.javaparser.ast.CompilationUnit',
        'com.github.javaparser.ast.body.ClassOrInterfaceDeclaration',
        'com.github.javaparser.ast.body.FieldDeclaration',
        'com.github.javaparser.ast.body.MethodDeclaration',
        'com.github.javaparser.ast.body.TypeDeclaration',
        'com.github.javaparser.ast.body.VariableDeclarator',
        'com.github.javaparser.ast.type.*',
        'com.github.javaparser.ast.stmt.*',
        'com.github.javaparser.utils.SourceRoot'
    ];
    return imports.map(imp => `import ${imp};`).join('\n');
}


export const generateBlockCode = (block: Block, indent: string, activeSuite: any): string => {
    let blockCode = "";
    switch (block.type) {
        case 'FUNCTION':
            const funcBlock = block as FunctionBlock;
            const children = activeSuite.blocks.filter((b: Block) => b.parentId === funcBlock.id);
            blockCode += "@Test\n";
            blockCode += `${indent}void ${funcBlock.funcName} () {\n`;
            children.forEach((child: Block) => blockCode += generateBlockCode(child, indent + '    ', activeSuite));
            blockCode += `${indent}}\n\n`;
            break;
        case 'VARIABLE':
            const varBlock = block as VariableBlock;
            blockCode += `${indent}${varBlock.varType} ${varBlock.varName} = ${formatValueByType(varBlock.value, varBlock.varType)}; \n`;
            break;
        case 'STATIC_ASSERT': {
            const staticBlock = block as StaticAssertBlock;
            blockCode += generateStaticAssert(staticBlock, indent);
            break;
        }
        case 'STRUCTURE_CHECK':
            const structureBlock = block as StructureCheckBlock;
            blockCode += generateStructureCheck(structureBlock, indent);
            break;
        case 'CASE_SOURCE': {
            const cb = block as CaseSourceBlock
            const out: string[] = []
            out.push(`static Stream<Arguments> ${cb.name}() {`)
            out.push('    return Stream.of(')
            cb.cases.forEach((row, idx) => {
                const comma = idx < cb.cases.length - 1 ? ',' : ''
                out.push(`        Arguments.of(${row.join(', ')})${comma}`)
            })
            out.push('    );')
            out.push('}')
            blockCode += out.join('\n') + '\n'
            break;
        }
        case 'FUNCTION_TEST': {
            const fb = block as FunctionTestBlock;
            const prefix = 'ft_';
            const uniqueSuffix = block.id ? block.id.replace(/-/g, '_') : Math.random().toString(36).substr(2, 9);

            const paramDeclarations = fb.parameters.map((p, index) => {
                const uniqueName = `${prefix}${p.name}_${uniqueSuffix}_${index}`;
                return {
                    declaration: `${p.varType} ${uniqueName} = ${formatValueByType(p.value, p.varType)};`,
                    name: uniqueName,
                    type: p.varType
                };
            });

            const expectedUniqueName = `_${prefix}${fb.expected.name}_${uniqueSuffix}`;

            blockCode += `    ${fb.className} obj = new ${fb.className}();\n`;
            blockCode += `    try {\n`;

            // Generate parameter types for reflection
            const paramTypes = paramDeclarations.map(p => `${p.type}.class`).join(', ');
            blockCode += `        java.lang.reflect.Method ${fb.methodName}Method = ${fb.className}.class.getMethod("${fb.methodName}", ${paramTypes});\n`;

            // Generate parameter declarations
            paramDeclarations.forEach(param => {
                blockCode += `        ${param.declaration}\n`;
            });

            blockCode += `        ${fb.expected.varType} ${expectedUniqueName} = ${formatValueByType(fb.expected.value, fb.expected.varType)};\n`;

            // Generate method invocation with reflection
            const args = paramDeclarations.map(p => p.name).join(', ');
            blockCode += `        var actual = ${fb.methodName}Method.invoke(obj, ${args});\n`;

            // Generate assertions
            blockCode += `        Assertions.assertThat(actual)\n`;
            blockCode += `            .as("Function Test: Expect ${fb.methodName}(${args}) → " + ${expectedUniqueName})\n`;
            blockCode += `            .isEqualTo(${expectedUniqueName});\n`;

            // Add exception handling
            blockCode += `    } catch (NoSuchMethodException e) {\n`;
            blockCode += `        Assertions.fail("Method ${fb.methodName}(${paramDeclarations.map(p => p.type).join(', ')}) not found in ${fb.className} class");\n`;
            blockCode += `    } catch (Exception e) {\n`;
            blockCode += `        Assertions.fail("Error invoking ${fb.methodName} method: " + e.getMessage());\n`;
            blockCode += `    }\n`;

            break;
        }


        case 'EXCEPTION_ASSERT':
            if (block.type === 'EXCEPTION_ASSERT') {
                if (block.type === 'EXCEPTION_ASSERT' && 'exceptionType' in block && 'code' in block) {
                    if (block.type === 'EXCEPTION_ASSERT') {
                        if (block.type === 'EXCEPTION_ASSERT') {
                            if (block.type === 'EXCEPTION_ASSERT') {
                                const exceptionBlock = block as ExceptionAssertBlock;
                                blockCode += `${indent}org.junit.jupiter.api.Assertions.assertThrows(${exceptionBlock.exceptionType}, ${exceptionBlock.code});\n`;
                            }
                        }
                    }
                }
            }
            break;
        case 'ASSERT_THAT':
            const assertBlock = block as AssertThatBlock;
            const matchers = activeSuite.blocks.filter((b: Block) => b.parentId === assertBlock.id);
            let chain = matchers.map((m: MatcherBlock) => {
                const methodName = m.type.toLowerCase().replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
                return `.${methodName}${m.value ? `(${m.value})` : '()'}`;
            }).join('');
            blockCode += `${indent} Assertions.assertThat(${assertBlock.target})${chain}; \n`;
            break;

        case 'OUTPUT':
            const outputBlock = block as OutputBlock;
            const uniqueSuffix = outputBlock.id ? outputBlock.id.replace(/-/g, '_') : Math.random().toString(36).substr(2, 9);
            const prefix = '_to';
            return `PrintStream originalOut = System.out;
    ByteArrayOutputStream ${prefix}_baos_${uniqueSuffix} = new ByteArrayOutputStream();
    System.setOut(new PrintStream(${prefix}_baos_${uniqueSuffix}));
    try {
        Main.main(new String[] {});
        String actualOutput = ${prefix}_baos_${uniqueSuffix}.toString().trim();
        Assertions.assertThat(actualOutput).isEqualTo("${outputBlock.value || 'hello world'}");
    } finally {
        System.setOut(originalOut);
    }`;
        case 'COMMENT':
            blockCode += `${indent}// ${block.value}\n`;
            break;
    }
    return blockCode;
};
function formatValueByType(value: string, varType: string): string {
    switch (varType) {
        case "String":
        case "CharSequence":
            return `"${value}"`;

        case "char":
        case "Character":
            return `'${value}'`;

        case "byte":
        case "Byte":
            return `(byte) ${value}`;

        case "short":
        case "Short":
            return `(short) ${value}`;

        case "int":
        case "Integer":
            return value;

        case "long":
        case "Long":
            return `${value}L`;

        case "float":
        case "Float":
            return `${value}f`;

        case "double":
        case "Double":
            return `${value}d`;

        case "BigDecimal":
            return `new BigDecimal("${value}")`;

        case "BigInteger":
            return `new BigInteger("${value}")`;

        case "Object[]":
            return `new Object[]{${value}}`;
        case "byte[]":
            return `new byte[]{${value}}`;
        case "Byte[]":
            return `new Byte[]{${value}}`;
        case "short[]":
            return `new short[]{${value}}`;
        case "Short[]":
            return `new Short[]{${value}}`;
        case "int[]":
            return `new int[]{${value}}`;
        case "Integer[]":
            return `new Integer[]{${value}}`;
        case "long[]":
            return `new long[]{${value}}`;
        case "Long[]":
            return `new Long[]{${value}}`;
        case "float[]":
            return `new float[]{${value}}`;
        case "Float[]":
            return `new Float[]{${value}}`;
        case "double[]":
            return `new double[]{${value}}`;
        case "Double[]":
            return `new Double[]{${value}}`;
        case "char[]":
            return `new char[]{${value}}`;
        case "Character[]":
            return `new Character[]{${value}}`;
        case "String[]":
            return `new String[]{${value}}`;

        default:
            return value;
    }
}
const generateStaticAssert = (staticBlock: StaticAssertBlock, indent: string = '') => {
    const uniqueSuffix = staticBlock.id ? staticBlock.id.replace(/-/g, '_') : Math.random().toString(36).substr(2, 9);
    if (staticBlock.checkType === 'CLASS_EXISTS' as StaticAssertType) {
        return `${indent}String fileName_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .filter(cu -> cu.getTypes().stream()
${indent}                .filter(TypeDeclaration::isClassOrInterfaceDeclaration)
${indent}                .map(td -> ((ClassOrInterfaceDeclaration) td).getNameAsString())
${indent}                .anyMatch(n -> n.equals("${staticBlock.varName}")))
${indent}        .map(cu -> cu.getStorage().map(storage -> storage.getPath().getFileName().toString()).orElse("Unknown"))
${indent}        .findFirst()
${indent}        .orElse(null);

${indent}Assertions.assertThat(fileName_${uniqueSuffix}).as("Static test: Expect class named '${staticBlock.varName}' to exist in some file").isNotNull();
${indent}System.out.println("Found '${staticBlock.varName}' class in file: " + fileName_${uniqueSuffix});
`;
    }
    // FUNCTION existence (method, any class)
    else if (staticBlock.checkType === 'FUNCTION_EXISTS' as StaticAssertType) {
        return `${indent}boolean functionExists_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
${indent}        .anyMatch(md -> md.getNameAsString().equals("${staticBlock.varName}"));
${indent}Assertions.assertThat(functionExists_${uniqueSuffix}).as("Static test: Expect method named '${staticBlock.varName}' to exist in some file").isTrue();
`;
    }
    // VARIABLE existence (field, any class)
    else if (staticBlock.checkType === 'VARIABLE_EXISTS' as StaticAssertType) {
        return `${indent}boolean variableNameExists_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(FieldDeclaration.class).stream())
${indent}        .flatMap(fd -> fd.getVariables().stream())
${indent}        .anyMatch(vd -> vd.getNameAsString().equals("${staticBlock.varName}"));
${indent}Assertions.assertThat(variableNameExists_${uniqueSuffix}).as("Static test: Expect variable named '${staticBlock.varName}' to exist").isTrue();
`;
    }
    // FUNCTION in specific class
    else if (staticBlock.checkType === 'FUNCTION_EXISTS_IN_CLASS' as StaticAssertType) {
        return `${indent}boolean functionExistsInClass_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(ClassOrInterfaceDeclaration.class).stream())
${indent}        .filter(c -> c.getNameAsString().equals("${staticBlock.className}"))
${indent}        .flatMap(c -> c.getMethods().stream())
${indent}        .anyMatch(m -> m.getNameAsString().equals("${staticBlock.varName}"));
${indent}Assertions.assertThat(functionExistsInClass_${uniqueSuffix}).as("Static test: Expect method named '${staticBlock.varName}' to exist in class '${staticBlock.className}'")
${indent}        .isTrue();
`;
    }
    // VARIABLE in specific class
    else if (staticBlock.checkType === 'VARIABLE_EXISTS_IN_CLASS' as StaticAssertType) {
        return `${indent}boolean variableExistsInClass_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(ClassOrInterfaceDeclaration.class).stream())
${indent}        .filter(c -> c.getNameAsString().equals("${staticBlock.className}"))
${indent}        .flatMap(c -> c.getFields().stream())
${indent}        .flatMap(fd -> fd.getVariables().stream())
${indent}        .anyMatch(vd -> vd.getNameAsString().equals("${staticBlock.varName}"));
${indent}Assertions.assertThat(variableExistsInClass_${uniqueSuffix})
${indent}.as("Static test: Expect variable named '${staticBlock.varName}' to exist in class '${staticBlock.className}'")
${indent}        .isTrue();
`;
    }
    // VARIABLE in specific function (declared)
    else if (staticBlock.checkType === 'VARIABLE_EXISTS_IN_FUNCTION' as StaticAssertType) {
        return `${indent}boolean variableExistsInFunction_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
${indent}        .filter(m -> m.getNameAsString().equals("${staticBlock.methodName}"))
${indent}        .flatMap(m -> m.findAll(VariableDeclarator.class).stream())
${indent}        .anyMatch(vd -> vd.getNameAsString().equals("${staticBlock.varName}"));
${indent}Assertions.assertThat(variableExistsInFunction_${uniqueSuffix})
${indent}        .as("Static test: Expect variable named '${staticBlock.varName}' to exist in method '${staticBlock.methodName}'").isTrue();
`;
    }
    // VARIABLE called in function
    else if (staticBlock.checkType === 'VARIABLE_CALLED_IN_FUNCTION' as StaticAssertType) {
        return `${indent}boolean isVariableCalled_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
${indent}        .filter(m -> m.getNameAsString().equals("${staticBlock.methodName}"))
${indent}        .anyMatch(md -> md.toString().contains("${staticBlock.varName}"));
${indent}Assertions.assertThat(isVariableCalled_${uniqueSuffix})
${indent}        .as("Static test: Expect static field '${staticBlock.varName}' to be called within method '${staticBlock.methodName}'")
${indent}        .isTrue();
`;
    }
    // VARIABLE called in class
    else if (staticBlock.checkType === 'VARIABLE_CALLED_IN_CLASS' as StaticAssertType) {
        return `${indent}boolean isVariableCalled_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(ClassOrInterfaceDeclaration.class).stream())
${indent}        .filter(c -> c.getNameAsString().equals("${staticBlock.className}"))
${indent}        .anyMatch(md -> md.toString().contains("${staticBlock.varName}"));
${indent}Assertions.assertThat(isVariableCalled_${uniqueSuffix})
${indent}        .as("Static test: Expect static field '${staticBlock.varName}' to be called within method '${staticBlock.className}'")
${indent}        .isTrue();
`;
    }
};

const generateStructureCheck = (block: StructureCheckBlock, indent: string = '') => {
    const uniqueSuffix = block.id ? block.id.replace(/-/g, '_') : Math.random().toString(36).substr(2, 9);
    const prefix = 'sc';
    switch (block.checkType) {
        case "HAS_LOOP":
            return `${indent}String ${prefix}_methodName_${uniqueSuffix} = "${block.methodName}";
${indent}String ${prefix}_loopType_${uniqueSuffix} = "${block.varType}";
${indent}boolean ${prefix}_hasLoop_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
${indent}        .filter(md -> md.getNameAsString().equals(${prefix}_methodName_${uniqueSuffix}))
${indent}        .anyMatch(md -> {
${indent}            if (!md.getBody().isPresent()) {
${indent}                return false;
${indent}            }
${indent}            BlockStmt body = md.getBody().get();
${indent}            switch (${prefix}_loopType_${uniqueSuffix}) {
${indent}                case "for":
${indent}                    return body.findAll(ForStmt.class).size() > 0;
${indent}                case "while":
${indent}                    return body.findAll(WhileStmt.class).size() > 0;
${indent}                case "do-while":
${indent}                    return body.findAll(DoStmt.class).size() > 0;
${indent}                case "for-each":
${indent}                    return body.findAll(ForEachStmt.class).size() > 0;
${indent}                case "any":
${indent}                    return body.findAll(ForStmt.class).size() > 0 ||
${indent}                            body.findAll(WhileStmt.class).size() > 0 ||
${indent}                            body.findAll(DoStmt.class).size() > 0 ||
${indent}                            body.findAll(ForEachStmt.class).size() > 0;
${indent}                default:
${indent}                    return false;
${indent}            }
${indent}        });

${indent}Assertions.assertThat(${prefix}_hasLoop_${uniqueSuffix})
${indent}        .as("Structure Check (has loop): Expect method '${block.methodName}' to implement a loop of type '${block.varType}'")
${indent}        .isTrue();
`;


        case "HAS_CONDITIONAL":
            return `${indent}String ${prefix}_methodName_${uniqueSuffix} = "${block.methodName}";
${indent}String ${prefix}_conditionalType_${uniqueSuffix} = "${block.varType}"; // Expected conditional type, e.g., "if", "switch", "any"
${indent}boolean ${prefix}_hasConditional_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
${indent}        .filter(md -> md.getNameAsString().equals(${prefix}_methodName_${uniqueSuffix}))
${indent}        .anyMatch(md -> md.getBody().isPresent() &&
${indent}            (${prefix}_conditionalType_${uniqueSuffix}.equalsIgnoreCase("if") && md.getBody().get().findAll(com.github.javaparser.ast.stmt.IfStmt.class).size() > 0 ||
${indent}            ${prefix}_conditionalType_${uniqueSuffix}.equalsIgnoreCase("switch") && md.getBody().get().findAll(com.github.javaparser.ast.stmt.SwitchStmt.class).size() > 0 ||
${indent}            ${prefix}_conditionalType_${uniqueSuffix}.equalsIgnoreCase("any") && (md.getBody().get().findAll(com.github.javaparser.ast.stmt.IfStmt.class).size() > 0 ||
${indent}            md.getBody().get().findAll(com.github.javaparser.ast.stmt.SwitchStmt.class).size() > 0)));
${indent}Assertions.assertThat(${prefix}_hasConditional_${uniqueSuffix})
${indent}        .as("Structure Check (has conditional): Expect method '${block.methodName}' to implement a conditional statement '${block.varType}'")
${indent}        .isTrue();
`;
        case "HAS_RETURN":
            return `${indent}String ${prefix}_methodName_${uniqueSuffix} = "${block.methodName}";
${indent}String ${prefix}_expectedReturnType_${uniqueSuffix} = "${block.varType}"; 
${indent}boolean ${prefix}_hasCorrectReturnType_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
${indent}        .filter(md -> md.getNameAsString().equals(${prefix}_methodName_${uniqueSuffix}))
${indent}        .anyMatch(md -> {
${indent}            Type returnType = md.getType();
${indent}            if (returnType.isClassOrInterfaceType()) {
${indent}                return returnType.asClassOrInterfaceType().getNameAsString().equals(${prefix}_expectedReturnType_${uniqueSuffix});
${indent}            } else if (returnType.isPrimitiveType()) {
${indent}                return returnType.asPrimitiveType().asString().equals(${prefix}_expectedReturnType_${uniqueSuffix}.toLowerCase());
${indent}            } else if (returnType.isVoidType()) {
${indent}                return ${prefix}_expectedReturnType_${uniqueSuffix}.equals("void"); 
${indent}            }
${indent}            return false;
${indent}        });
${indent}Assertions.assertThat(${prefix}_hasCorrectReturnType_${uniqueSuffix})
${indent}        .as("Structure Check (has return): Expect method '${block.methodName}' to have return value '${block.value}' and type of '${block.varType}'")
${indent}        .isTrue();
`;
        case "HAS_PARAMETER":
            return `${indent}String ${prefix}_methodName_${uniqueSuffix} = "${block.methodName}";
${indent}String ${prefix}_parameterName_${uniqueSuffix} = "${block.varName}";
${indent}String ${prefix}_expectedType_${uniqueSuffix} = "${block.varType}";
${indent}boolean ${prefix}_hasCorrectParameterType_${uniqueSuffix} = allCompilationUnits.stream()
${indent}        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
${indent}        .filter(md -> md.getNameAsString().equals(${prefix}_methodName_${uniqueSuffix}))
${indent}        .anyMatch(md -> md.getParameters().stream()
${indent}                .filter(param -> param.getNameAsString().equals(${prefix}_parameterName_${uniqueSuffix}))
${indent}                .anyMatch(param -> {
${indent}                    Type type = param.getType();
${indent}                    if (type.isClassOrInterfaceType()) {
${indent}                        return type.asClassOrInterfaceType().getNameAsString().equals(${prefix}_expectedType_${uniqueSuffix});
${indent}                    } else if (type.isPrimitiveType()) {
${indent}                        return type.asPrimitiveType().asString().equals(${prefix}_expectedType_${uniqueSuffix}.toLowerCase());
${indent}                    }
${indent}                    return false;
${indent}                }));
${indent}Assertions.assertThat(${prefix}_hasCorrectParameterType_${uniqueSuffix})
${indent}        .as("Structure Check (has Parameter): Expect method '${block.methodName}' to have a parameter '${block.varName}' of type '${block.varType}'")
${indent}        .isTrue();
`;
        default:
            return '';
    }
};
