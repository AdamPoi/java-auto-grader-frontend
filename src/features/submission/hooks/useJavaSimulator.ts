import { useMutation } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import type { ExecutionResult, JavaFile, JavaProject } from '../data/data';
import { type FileData } from './useFileManagement';

export interface TerminalOutputLine {
    text: string;
    type: 'log' | 'error' | 'input';
}

interface UseJavaSimulatorReturn {
    terminalOutput: TerminalOutputLine[];
    isRunning: boolean;
    isAwaitingInput: boolean;
    terminalInputValue: string;
    setTerminalInputValue: React.Dispatch<React.SetStateAction<string>>;
    clearTerminal: () => void;
    runCode: (files: FileData[]) => Promise<void>;
    onInputSubmit: (input: string) => void;
}

function useJavaSimulator(): UseJavaSimulatorReturn {
    const [terminalOutput, setTerminalOutput] = useState<TerminalOutputLine[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [isAwaitingInput, setIsAwaitingInput] = useState(false);
    const [terminalInputValue, setTerminalInputValue] = useState('');
    const inputPromiseResolveRef = useRef<((value: string | null) => void) | null>(null);

    const addOutput = useCallback((text: string, type: 'log' | 'error' = 'log') => {
        setTerminalOutput(p => [...p, { text, type }]);
    }, []);

    const clearTerminal = useCallback(() => setTerminalOutput([]), []);

    const promptForInput = useCallback((): Promise<string> => {
        setIsAwaitingInput(true);
        return new Promise(resolve => {
            inputPromiseResolveRef.current = (value: string | null) => {
                resolve(value ?? ''); // Convert null to empty string
            };
        });
    }, []);

    const onInputSubmit = useCallback((input: string) => {
        if (isAwaitingInput) {
            inputPromiseResolveRef.current?.(input);
            setIsAwaitingInput(false);
            setTerminalInputValue('');
            setTerminalOutput(p => [...p, { text: input, type: 'input' }]);
        }
    }, [isAwaitingInput]);

    const runCodeMutation = useMutation({
        mutationFn: async (javaProject: JavaProject): Promise<ExecutionResult> => {
            const response = await fetch('http://localhost:8080/api/submission-codes/run', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(javaProject),
            });

            if (!response.ok) {
                throw new Error('Failed to execute Java code');
            }

            return response.json();
        },
        onSuccess: ({ data }: ExecutionResult) => {
            // Handle compilation errors (check for null and length)
            if (data.compilationErrors && Array.isArray(data.compilationErrors) && data.compilationErrors.length > 0) {
                data.compilationErrors.forEach(error => {
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

            // Handle execution datas
            console.log(data)
            if (data.success) {
                if (data.output) {
                    // Split output by newlines and add each line separately
                    const outputLines = data.output.split('\n');
                    outputLines.forEach(line => {
                        if (line.trim()) { // Only add non-empty lines
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

        const javaFiles: JavaFile[] = files.map(file => ({
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
        terminalOutput, isAwaitingInput, terminalInputValue, setTerminalInputValue, clearTerminal, runCode,
        isRunning: runCodeMutation.isPending, onInputSubmit
    };
}

export default useJavaSimulator;