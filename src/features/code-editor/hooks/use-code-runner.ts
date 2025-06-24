import type { ExecutionStatus } from '@/features/rubrics/data/types';
import type { Submission } from '@/features/submissions/data/types';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { CodeRunnerApi } from '../data/api';
import type { CompilationError, ExecutionResult, JavaFile, JavaProject, TerminalOutputLine, TestExecutionResult, TestJavaProject } from '../data/types';
import { type FileData } from '../hooks/use-file-management';

interface UseCodeRunnerReturn {
    terminalOutput: TerminalOutputLine[];
    isRunning: boolean;
    clearTerminal: () => void;
    runCode: (files: FileData[]) => Promise<void>;
    testCode: (sourceFiles: FileData[], testFiles: FileData[], testCodeContent: string) => Promise<void>;
    testResult: Submission | undefined;
    setTestResult: React.Dispatch<React.SetStateAction<Submission | undefined>>;
    liveTestOutput: string;
    setLiveTestOutput: React.Dispatch<React.SetStateAction<string>>; // New: Live output for tests
}

export function useCodeRunner(): UseCodeRunnerReturn {
    const [terminalOutput, setTerminalOutput] = useState<TerminalOutputLine[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [testResult, setTestResult] = useState<Submission | undefined>(undefined);
    const [liveTestOutput, setLiveTestOutput] = useState<string>(''); // New state

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

    const testCodeMutation = useMutation<TestExecutionResult, Error, TestJavaProject>({
        mutationFn: async (javaProject: TestJavaProject): Promise<TestExecutionResult> => {
            return CodeRunnerApi.testCode(javaProject);
        },
        onMutate: () => {
            // Set initial live output when mutation starts
            setLiveTestOutput('Initializing test environment...\nCompiling source files...\n');
        },
        onSuccess: (data: TestExecutionResult) => {
            let currentLiveOutput = 'Test execution completed.\n\n';

            // Add compilation info
            if (data.compilationErrors && data.compilationErrors.length > 0) {
                currentLiveOutput += '❌ Compilation Errors:\n';
                data.compilationErrors.forEach((error: CompilationError) => {
                    currentLiveOutput += `  ${error.errorFile}:${error.line} - ${error.errorMessage}\n`;
                });
                currentLiveOutput += '\n';
            } else {
                currentLiveOutput += '✅ Compilation successful\n\n';
            }

            // Add test execution output
            if (data.output) {
                currentLiveOutput += `📋 Test Output:\n${data.output}\n\n`;
            }

            // Add test suite results
            if (data.testSuites && data.testSuites.length > 0) {
                currentLiveOutput += '🔍 Test Results:\n';
                data.testSuites.forEach(suite => {
                    currentLiveOutput += `\nSuite: ${suite.name}\n`;
                    suite.testCases.forEach(testCase => {
                        const icon = testCase.status === 'PASSED' ? '✅' : '❌';
                        currentLiveOutput += `  ${icon} ${testCase.methodName}: ${testCase.status}\n`;
                        if (testCase.failureMessage) {
                            currentLiveOutput += `     Failure: ${testCase.failureMessage}\n`;
                        }
                        if (testCase.errorMessage) {
                            currentLiveOutput += `     Error: ${testCase.errorMessage}\n`;
                        }
                    });
                });
            }

            if (data.error) {
                currentLiveOutput += `\n❌ Execution Error:\n${data.error}`;
            }

            setLiveTestOutput(currentLiveOutput);

            // Create submission result with proper mapping
            const feedbackMessage = data.testSuites?.map(suite => {
                const testCasesFeedback = suite.testCases.map(testCase => {
                    let msg = `- ${testCase.methodName}: ${testCase.status}`;
                    if (testCase.failureMessage) {
                        msg += `\n  Failure: ${testCase.failureMessage}`;
                    }
                    if (testCase.errorMessage) {
                        msg += `\n  Error: ${testCase.errorMessage}`;
                    }
                    return msg;
                }).join('\n');
                return `Test Suite: ${suite.name}\n${testCasesFeedback}`;
            }).join('\n\n') || 'No test suites executed.';

            setTestResult({
                id: 'test-submission',
                status: data.success ? 'PASSED' : 'FAILED',
                executionTime: data.executionTime?.toString() || '0',
                feedback: feedbackMessage,
                testExecutions: data.testSuites?.flatMap(suite =>
                    suite.testCases.map(testCase => ({
                        id: `execution-${testCase.methodName}`,
                        status: testCase.status as ExecutionStatus,
                        actual: testCase.failureMessage || testCase.errorMessage || undefined,
                        expected: testCase.status === 'PASSED' ? 'Test should pass' : undefined,
                        error: testCase.errorMessage || undefined,
                        executionTime: data.executionTime,
                        rubricGradeId: testCase.methodName,
                        submissionId: 'test-submission',
                        rubricGrade: {
                            id: testCase.methodName,
                            name: testCase.methodName,
                            description: `Test case: ${testCase.methodName}`,
                            gradeType: 'AUTOMATIC' as const,
                            rubricId: 'test-rubric',
                            assignmentId: 'test-assignment'
                        }
                    }))
                ) || [],
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                assignmentId: 'test-assignment',
                studentId: 'test-student',
                submissionCodes: []
            });
        },
        onError: (error: Error) => {
            const errorOutput = `❌ Test Execution Failed\n\nError: ${error.message}\n\nPlease check your code and try again.`;
            setLiveTestOutput(errorOutput);

            setTestResult({
                id: 'test-submission-error',
                status: 'ERROR' as ExecutionStatus,
                executionTime: '0',
                feedback: `Error: ${error.message}`,
                testExecutions: [],
                startedAt: new Date().toISOString(),
                completedAt: new Date().toISOString(),
                assignmentId: 'test-assignment',
                studentId: 'test-student',
                submissionCodes: []
            });
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

    const testCode = useCallback(async (sourceFiles: FileData[], testFiles: FileData[], testCodeContent: string) => {
        setIsRunning(true);
        setLiveTestOutput('Compiling and running tests...'); // Initial message for live output

        const testClassNames = testFiles.map(f => f.fileName.replace('.java', ''));

        const javaProject: TestJavaProject = {
            sourceFiles,
            testFiles,
            testClassNames: [...new Set(testClassNames)]
        };

        testCodeMutation.mutate(javaProject);
    },
        [testCodeMutation]); // Removed addOutput as it's not used in this callback anymore

    return {
        terminalOutput,
        isRunning,
        clearTerminal,
        runCode,
        testCode,
        testResult,
        setTestResult,
        liveTestOutput, // New: Expose liveTestOutput
        setLiveTestOutput
    };
}