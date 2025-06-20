export type CompilationError = {
    errorFile: string;
    line: number;
    errorMessage: string;
    codeSnippet: string;
    pointer: string;
}

export interface ExecutionResult {
    success: boolean;
    output: string | null;
    error: string | null;
    exception: string | null;
    executionTime: number;
    compilationErrors: CompilationError[] | null;
}

export type TestCase = {
    className: string;
    methodName: string;
    status: 'PASSED' | 'FAILED' | 'SKIPPED' | 'ERROR';
    executionTime: number;
    failureMessage: string | null;
    errorMessage: string | null;
    stackTrace: string | null;
}

export type TestSuite = {
    name: string;
    totalTests: number;
    failures: number;
    errors: number;
    skipped: number;
    executionTime: number;
    testCases: TestCase[];
}

export interface TestExecutionResult {
    success: boolean;
    output: string | null;
    error: string | null;
    exitCode: string | null;
    executionTime: number;
    compilationErrors: CompilationError[] | null;
    testSuites: TestSuite[];
}

export type JavaFile = {
    fileName: string;
    content: string;
}

export type JavaProject = {
    files: JavaFile[];
    mainClassName: string;
}

export type TestJavaProject = {
    sourceFiles: JavaFile[];
    testFiles: JavaFile[];
    testClassNames: string[];
}

export interface TerminalOutputLine {
    text: string;
    type: 'log' | 'error' | 'input';
}

export type CodeEditorState = {
    fileName: string;
    content: string;
    terminalOutput: TerminalOutputLine[];
    isRunning: boolean;
};
