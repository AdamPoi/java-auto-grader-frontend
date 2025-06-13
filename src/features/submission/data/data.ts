export type CompilationError = {
    errorFile: string;
    line: number;
    errorMessage: string;
    codeSnippet: string;
    pointer: string;
}

interface ExecutionResult {
    success: boolean;
    output: string | null;  // Changed from null to string | null
    error: string | null;
    exception: string | null;
    executionTime: number;
    compilationErrors: CompilationError[] | null;  // Allow null
}

export type JavaFile = {
    fileName: string;
    content: string;
}

export type JavaProject = {
    files: JavaFile[];
    mainClassName: string;
}