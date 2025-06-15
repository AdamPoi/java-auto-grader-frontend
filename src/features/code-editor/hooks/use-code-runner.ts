import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { CodeRunnerApi } from '../data/api';
import type { CompilationError, ExecutionResult, JavaFile, JavaProject, TerminalOutputLine } from '../data/types';
import { type FileData } from '../hooks/use-file-management';
interface UseCodeRunnerReturn {
    terminalOutput: TerminalOutputLine[];
    isRunning: boolean;
    clearTerminal: () => void;
    runCode: (files: FileData[]) => Promise<void>;
}

export function useCodeRunner(): UseCodeRunnerReturn {
    const [terminalOutput, setTerminalOutput] = useState<TerminalOutputLine[]>([]);
    const [isRunning, setIsRunning] = useState(false);

    const addOutput = useCallback((text: string, type: 'log' | 'error' = 'log') => {
        setTerminalOutput(p => [...p, { text, type }]);
    }, []);

    const clearTerminal = useCallback(() => setTerminalOutput([]), []);

    const runCodeMutation = useMutation({
        mutationFn: async (javaProject: JavaProject): Promise<ExecutionResult> => {
            return CodeRunnerApi.runCode(javaProject);
        },
        onSuccess: (data: ExecutionResult) => {
            if (data.compilationErrors && Array.isArray(data.compilationErrors) && data.compilationErrors.length > 0) {
                data.compilationErrors.forEach((error: CompilationError) => {
                    addOutput(`Compilation Error in ${error.errorFile}:${error.line}`, 'error');
                    addOutput(error.errorMessage, 'error');
                    if (error.codeSnippet) {
                        addOutput(error.codeSnippet, 'log');
                    }
                    if (error.pointer) {
                        addOutput(error.pointer, 'log');
                    }
                });
                return;
            }

            if (data.success) {
                if (data.output) {
                    const outputLines = data.output.split('\n');
                    outputLines.forEach((line: string) => {
                        if (line.trim()) {
                            addOutput(line, 'log');
                        }
                    });
                }
                addOutput(`Execution completed in ${data.executionTime}ms`, 'log');
            } else {
                if (data.error) {
                    addOutput(data.error, 'error');
                }
                if (data.exception) {
                    addOutput(data.exception, 'error');
                }
            }
        },
        onError: (error: Error) => {
            addOutput(`Error: ${error.message}`, 'error');
        },
        onSettled: () => {
            setIsRunning(false);
        }
    });

    const runCode = useCallback(async (files: FileData[]) => {
        setIsRunning(true);
        setTerminalOutput([]);

        const mainFile = files.find(f => f.fileName.endsWith('Main.java'));
        if (!mainFile) {
            addOutput("Error: Main.java not found.", 'error');
            setIsRunning(false);
            return;
        }

        const mainClassName = mainFile.fileName.replace('.java', '');

        const javaFiles: JavaFile[] = files.map((file: FileData) => ({
            fileName: file.fileName,
            content: file.content
        }));

        const javaProject: JavaProject = {
            files: javaFiles,
            mainClassName: mainClassName
        };

        runCodeMutation.mutate(javaProject);
    }, [addOutput, runCodeMutation]);

    return {
        terminalOutput,
        isRunning: runCodeMutation.isPending,
        clearTerminal,
        runCode,
    };
}