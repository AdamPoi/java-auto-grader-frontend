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

export type JavaFile = {
    fileName: string;
    content: string;
}

export type JavaProject = {
    files: JavaFile[];
    mainClassName: string;
}

export interface TerminalOutputLine {
    text: string;
    type: 'log' | 'error' | 'input';
}
