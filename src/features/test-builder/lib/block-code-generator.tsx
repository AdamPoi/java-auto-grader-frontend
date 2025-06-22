import type { AssertThatBlock, Block, CaseSourceBlock, ExceptionAssertBlock, FunctionBlock, FunctionTestBlock, MatcherBlock, StaticAssertBlock, StaticAssertType, StructureCheckBlock, VariableBlock } from '../data/types';


export const generateSetupCode = () => {
    let code = ''
    // Junit, Assertj, Java Parser setup code
    code += `
private static final String SOURCE_PATH = "src/main/java";
private static List<CompilationUnit> allCompilationUnits;
private static CombinedTypeSolver combinedTypeSolver;

@BeforeAll
public static void setup() throws IOException {
    SourceRoot sourceRoot = new SourceRoot(Paths.get(SOURCE_PATH));

    allCompilationUnits = sourceRoot.tryToParse("").stream()
            .filter(result -> result.isSuccessful() && result.getResult().isPresent())
            .map(result -> result.getResult().get())
            .toList();

    Assertions.assertThat(allCompilationUnits).isNotEmpty();
    System.out.printf("Successfully parsed %d Java files for testing.%n", allCompilationUnits.size());

    combinedTypeSolver = new CombinedTypeSolver();
    combinedTypeSolver.add(new ReflectionTypeSolver()); // Add ReflectionTypeSolver for basic types
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
        'com.github.javaparser.ast.type.Type',
        'com.github.javaparser.symbolsolver.resolution.typesolvers.CombinedTypeSolver',
        'com.github.javaparser.symbolsolver.resolution.typesolvers.ReflectionTypeSolver',
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
        case 'ASSERT_THAT':
            const assertBlock = block as AssertThatBlock;
            const matchers = activeSuite.blocks.filter((b: Block) => b.parentId === assertBlock.id);
            let chain = matchers.map((m: MatcherBlock) => {
                const methodName = m.type.toLowerCase().replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
                return `.${methodName}${m.value ? `(${m.value})` : '()'}`;
            }).join('');
            blockCode += `${indent} Assertions.assertThat(${assertBlock.target})${chain}; \n`;
            break;
        case 'COMMENT':
            blockCode += `${indent}// ${block.value}\n`;
            break;

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
        case 'STATIC_ASSERT': {
            const staticBlock = block as StaticAssertBlock;
            blockCode += generateStaticAssert(staticBlock);
            break;
        }
        case 'STRUCTURE_CHECK':
            const structureBlock = block as StructureCheckBlock;
            blockCode += generateStructureCheck(structureBlock);
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
            const params = fb.parameters.map(p => `${p.varType} ${p.name} = ${formatValueByType(p.value, p.varType)}`).join('; ');
            const args = fb.parameters.map(p => p.name).join(', ');
            // blockCode += '@Test\n';
            // blockCode += `void test${fb.methodName}() {\n`;
            blockCode += `    ${fb.className} obj = new ${fb.className}();\n`;
            blockCode += `    ${params};\n`;
            blockCode += `   ${fb.expected.varType} ${fb.expected.name} = ${fb.expected.value};\n`;
            blockCode += `    var actual = obj.${fb.methodName}(${args});\n`;
            blockCode += `    Assertions.assertThat(actual)\n`;
            blockCode += `        .as("Expect ${fb.methodName}(${args}) → " + ${fb.expected.name})\n`;
            blockCode += `        .isEqualTo(${fb.expected.name});\n`;
            // blockCode += `}\n\n`;

            break;
        }
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
const generateStaticAssert = (staticBlock: StaticAssertBlock) => {
    // CLASS existence
    if (staticBlock.checkType === 'CLASS_EXISTS' as StaticAssertType) {
        return `

                String fileName = allCompilationUnits.stream()
                        .filter(cu -> cu.getTypes().stream()
                                .filter(TypeDeclaration::isClassOrInterfaceDeclaration)
                                .map(td -> ((ClassOrInterfaceDeclaration) td).getNameAsString())
                                .anyMatch(n -> n.equals("${staticBlock.varName}")))
                        .map(cu -> cu.getStorage().map(storage -> storage.getPath().getFileName().toString()).orElse("Unknown"))
                        .findFirst()
                        .orElse(null);

                Assertions.assertThat(fileName).as("Expect class named '${staticBlock.varName}' to exist in some file").isNotNull();
                System.out.println("Found '${staticBlock.varName}' class in file: " + fileName);
        `;
    }
    // FUNCTION existence (method, any class)
    else if (staticBlock.checkType === 'FUNCTION_EXISTS' as StaticAssertType) {
        return `
                boolean functionExists = allCompilationUnits.stream()
                        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
                        .anyMatch(md -> md.getNameAsString().equals("${staticBlock.varName}"));
                Assertions.assertThat(functionExists).as("Expect method named '${staticBlock.varName}' to exist in some file").isTrue();
        `;
    }
    // VARIABLE existence (field, any class)
    else if (staticBlock.checkType === 'VARIABLE_EXISTS' as StaticAssertType) {
        return `
            
                boolean variableNameExists = allCompilationUnits.stream()
                        .flatMap(cu -> cu.findAll(FieldDeclaration.class).stream())
                        .flatMap(fd -> fd.getVariables().stream())
                        .anyMatch(vd -> vd.getNameAsString().equals("${staticBlock.varName}"));
                Assertions.assertThat(variableNameExists).as("Expect field named '${staticBlock.varName}' to exist").isTrue();
        `;
    }
    // FUNCTION in specific class
    else if (staticBlock.checkType === 'FUNCTION_EXISTS_IN_CLASS' as StaticAssertType && staticBlock.className) {
        return `
         
                boolean functionExistsInClass = allCompilationUnits.stream()
                        .flatMap(cu -> cu.findAll(ClassOrInterfaceDeclaration.class).stream())
                        .filter(c -> c.getNameAsString().equals("${staticBlock.className}"))
                        .flatMap(c -> c.getMethods().stream())
                        .anyMatch(m -> m.getNameAsString().equals("${staticBlock.varName}"));
                Assertions.assertThat(functionExistsInClass).as("Expect method '${staticBlock.varName}' to exist in class '${staticBlock.className}'")
                        .isTrue();
        `;
    }
    // VARIABLE in specific class
    else if (staticBlock.checkType === 'VARIABLE_EXISTS_IN_CLASS' as StaticAssertType && staticBlock.className) {
        return `
                boolean fieldExistsInClass = allCompilationUnits.stream()
                        .flatMap(cu -> cu.findAll(ClassOrInterfaceDeclaration.class).stream())
                        .filter(c -> c.getNameAsString().equals("${staticBlock.className}"))
                        .flatMap(c -> c.getFields().stream())
                        .flatMap(fd -> fd.getVariables().stream())
                        .anyMatch(vd -> vd.getNameAsString().equals("${staticBlock.varName}"));
                Assertions.assertThat(fieldExistsInClass).as("Expect field '${staticBlock.varName}' to exist in class '${staticBlock.className}'")
                        .isTrue();
            `;
    }
    // VARIABLE in specific function (declared)
    else if (staticBlock.checkType === 'VARIABLE_EXISTS_IN_FUNCTION' as StaticAssertType && staticBlock.methodName) {
        return `
           
                boolean variableExistsInFunction = allCompilationUnits.stream()
                        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
                        .filter(m -> m.getNameAsString().equals("${staticBlock.methodName}"))
                        .flatMap(m -> m.findAll(VariableDeclarator.class).stream())
                        .anyMatch(vd -> vd.getNameAsString().equals("${staticBlock.varName}"));
                Assertions.assertThat(variableExistsInFunction)
                        .as("Expect variable '${staticBlock.varName}' to exist in method '${staticBlock.methodName}'").isTrue();
        `;
    }
    // VARIABLE called in function
    else if (staticBlock.checkType === 'VARIABLE_CALLED_IN_FUNCTION' as StaticAssertType && staticBlock.methodName) {
        return `
              
                    boolean isVariableCalled = allCompilationUnits.stream()
                            .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
                            .filter(m -> m.getNameAsString().equals("${staticBlock.methodName}"))
                            .anyMatch(md -> md.toString().contains("${staticBlock.varName}"));
                    Assertions.assertThat(isVariableCalled)
                            .as("Expect static field '${staticBlock.varName}' to be called within method '${staticBlock.methodName}'")
                            .isTrue();
                }
        `;
    }
    // VARIABLE called in class
    else if (staticBlock.checkType === 'VARIABLE_CALLED_IN_CLASS' as StaticAssertType && staticBlock.className) {
        return `
                @Test
                void testVariableCalledInClass_${staticBlock.className}_${staticBlock.varName}() {
                    boolean isVariableCalled = allCompilationUnits.stream()
                            .flatMap(cu -> cu.findAll(ClassOrInterfaceDeclaration.class).stream())
                            .filter(c -> c.getNameAsString().equals("${staticBlock.className}"))
                            .anyMatch(md -> md.toString().contains("${staticBlock.varName}"));
                    Assertions.assertThat(isVariableCalled)
                            .as("Expect static field '${staticBlock.varName}' to be called within method '${staticBlock.className}'")
                            .isTrue();
                }
        `;
    }
};

const generateStructureCheck = (block: StructureCheckBlock) => {
    switch (block.checkType) {
        case "HAS_LOOP":
            return `
        String methodName = "${block.methodName}";
        String loopType = "${block.varType}"; // Expected loop type, e.g., "for", "while", "do-while", "for-each","any"
        boolean hasLoop = allCompilationUnits.stream()
                .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
                .filter(md -> md.getNameAsString().equals(methodName))
                .anyMatch(md -> {
                    if (!md.getBody().isPresent()) {
                        return false;
                    }
                    BlockStmt body = md.getBody().get();
                    switch (loopType) {
                        case "for":
                            return body.findAll(ForStmt.class).size() > 0;
                        case "while":
                            return body.findAll(WhileStmt.class).size() > 0;
                        case "do-while":
                            return body.findAll(DoStmt.class).size() > 0;
                        case "for-each":
                            return body.findAll(ForEachStmt.class).size() > 0;
                        case "any":
                            return body.findAll(ForStmt.class).size() > 0 ||
                                    body.findAll(WhileStmt.class).size() > 0 ||
                                    body.findAll(DoStmt.class).size() > 0 ||
                                    body.findAll(ForEachStmt.class).size() > 0;
                        default:
                            return false;
                    }
                });

        Assertions.assertThat(hasLoop)
                .as("Expect method '" + methodName + "' to implement a loop of type '" + loopType + "'")
                .isTrue();
`;
        case "HAS_CONDITIONAL":
            return `
                String methodName = "${block.methodName}";
                String conditionalType = "if"; // Expected conditional type, e.g., "if", "switch", "any"
                boolean hasConditional = allCompilationUnits.stream()
                        .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
                        .filter(md -> md.getNameAsString().equals(methodName))
                        .anyMatch(md -> md.getBody().isPresent() &&
                                (conditionalType.equalsIgnoreCase("if") && md.getBody().get().findAll(com.github.javaparser.ast.stmt.IfStmt.class).size() > 0 ||
                                        conditionalType.equalsIgnoreCase("switch") && md.getBody().get().findAll(com.github.javaparser.ast.stmt.SwitchStmt.class).size() > 0 ||
                                        conditionalType.equalsIgnoreCase("any") && (md.getBody().get().findAll(com.github.javaparser.ast.stmt.IfStmt.class).size() > 0 ||
                                                md.getBody().get().findAll(com.github.javaparser.ast.stmt.SwitchStmt.class).size() > 0)));

                Assertions.assertThat(hasConditional)
                        .as("Expect method '" + methodName + "' to implement a conditional statement (" + conditionalType + ")")
                        .isTrue();
            `
        case "HAS_RETURN":
            return `
    String methodName = "${block.methodName}";
    String expectedReturnType = "${block.type}";
    boolean hasCorrectReturnType = allCompilationUnits.stream()
            .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
            .filter(md -> md.getNameAsString().equals(methodName))
            .anyMatch(md -> {
                Type returnType = md.getType();
                if (returnType.isClassOrInterfaceType()) {
                    return returnType.asClassOrInterfaceType().getNameAsString().equals(expectedReturnType);
                } else if (returnType.isPrimitiveType()) {
                    return returnType.asPrimitiveType().asString().equals(expectedReturnType.toLowerCase());
                } else if (returnType.isVoidType()) {
                    return expectedReturnType === "void";
                }
                return false;
            });

    Assertions.assertThat(hasCorrectReturnType)
            .as("Expect method '" + methodName + "' to have return type '" + expectedReturnType + "'")
            .isTrue();
`;
        case "HAS_PARAMETER":
            return `
@Test
    String methodName = "${block.methodName}";
    String parameterName = "${block.varName}";
    String expectedType = "${block.varType}";
    boolean hasCorrectParameterType = allCompilationUnits.stream()
            .flatMap(cu -> cu.findAll(MethodDeclaration.class).stream())
            .filter(md -> md.getNameAsString().equals(methodName))
            .anyMatch(md -> md.getParameters().stream()
                    .filter(param -> param.getNameAsString().equals(parameterName))
                    .anyMatch(param -> {
                        Type type = param.getType();
                        if (type.isClassOrInterfaceType()) {
                            return type.asClassOrInterfaceType().getNameAsString().equals(expectedType);
                        } else if (type.isPrimitiveType()) {
                            return type.asPrimitiveType().asString().equals(expectedType.toLowerCase());
                        }
                        return false;
                    }));

    Assertions.assertThat(hasCorrectParameterType)
            .as("Expect method '" + methodName + "' to have a parameter '" + parameterName + "' of type '" + expectedType + "'")
            .isTrue();
`;

        default:
            return '';
    }

}