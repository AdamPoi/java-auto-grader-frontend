import type { Rubric } from '@/features/rubrics/data/types';
import { useCallback, useState } from 'react';
import { useCodeRunner } from './use-code-runner';
import type { FileData } from './use-file-management';

interface UseTestRunnerReturn {
    isTestRunnerOpen: boolean;
    selectedRubric: Rubric | null;
    openTestRunner: (rubric: Rubric) => void;
    closeTestRunner: () => void;
    runTests: (sourceFiles: FileData[], testFiles: FileData[]) => Promise<void>;
    isRunning: boolean;
    testResult: any;
    liveTestOutput: string;
}

export function useTestRunner(): UseTestRunnerReturn {
    const [isTestRunnerOpen, setIsTestRunnerOpen] = useState(false);
    const [selectedRubric, setSelectedRubric] = useState<Rubric | null>(null);

    const {
        testCode,
        isRunning,
        testResult,
        liveTestOutput,
        setTestResult
    } = useCodeRunner();

    const openTestRunner = useCallback((rubric: Rubric) => {
        setSelectedRubric(rubric);
        setIsTestRunnerOpen(true);
        // Clear previous results when opening
        setTestResult(undefined);
    }, [setTestResult]);

    const closeTestRunner = useCallback(() => {
        setIsTestRunnerOpen(false);
        setSelectedRubric(null);
    }, []);

    const runTests = useCallback(async (sourceFiles: FileData[], testFiles: FileData[]) => {
        if (!selectedRubric) return;

        // Create test content from rubric grades
        const testCodeContent = selectedRubric.rubricGrades?.map(grade =>
            `// Test: ${grade.name}\n// ${grade.description || 'No description'}`
        ).join('\n\n') || '';

        await testCode(sourceFiles, testFiles, testCodeContent);
    }, [selectedRubric, testCode]);

    return {
        isTestRunnerOpen,
        selectedRubric,
        openTestRunner,
        closeTestRunner,
        runTests,
        isRunning,
        testResult,
        liveTestOutput
    };
}