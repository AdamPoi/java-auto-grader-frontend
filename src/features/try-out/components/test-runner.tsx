import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ExecutionStatus, Rubric, RubricGrade } from '@/features/rubrics/data/types';
import type { Submission } from '@/features/submissions/data/types';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TestRunnerProps {
    isOpen: boolean;
    onClose: () => void;
    rubric: Rubric;
    isRunning: boolean;
    testResult?: Submission;
    liveTestOutput: string;
    onRunTests: () => void;
}

const getStatusIcon = (status: ExecutionStatus) => {
    switch (status) {
        case 'PASSED':
            return <CheckCircle className="h-4 w-4 text-green-500" />;
        case 'FAILED':
            return <XCircle className="h-4 w-4 text-red-500" />;
        case 'RUNNING':
            return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
        case 'PENDING':
            return <Clock className="h-4 w-4 text-yellow-500" />;
        case 'ERROR':
        case 'TIMEOUT':
            return <AlertCircle className="h-4 w-4 text-red-500" />;
        default:
            return <Clock className="h-4 w-4 text-gray-400" />;
    }
};

const getStatusColor = (status: ExecutionStatus) => {
    switch (status) {
        case 'PASSED':
            return 'text-green-600 bg-green-50 border-green-200';
        case 'FAILED':
            return 'text-red-600 bg-red-50 border-red-200';
        case 'RUNNING':
            return 'text-blue-600 bg-blue-50 border-blue-200';
        case 'PENDING':
            return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        case 'ERROR':
        case 'TIMEOUT':
            return 'text-red-600 bg-red-50 border-red-200';
        default:
            return 'text-gray-600 bg-gray-50 border-gray-200';
    }
};

const calculateScore = (rubricGrades: RubricGrade[], testResult?: Submission) => {
    if (!testResult?.testExecutions) return { score: 0, total: rubricGrades.length };

    const passedTests = testResult.testExecutions.filter(execution =>
        execution.status === 'PASSED'
    ).length;

    return {
        score: passedTests,
        total: rubricGrades.length,
        percentage: rubricGrades.length > 0 ? Math.round((passedTests / rubricGrades.length) * 100) : 0
    };
};

export function TestRunner({
    isOpen,
    onClose,
    rubric,
    isRunning,
    testResult,
    liveTestOutput,
    onRunTests
}: TestRunnerProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const rubricGrades = rubric.rubricGrades || [];
    const { score, total, percentage } = calculateScore(rubricGrades, testResult);

    useEffect(() => {
        if (isRunning) {
            setHasStarted(true);
        }
    }, [isRunning]);

    const handleRunTests = () => {
        setHasStarted(true);
        onRunTests();
    };

    const getTestStatus = (rubricGrade: RubricGrade): ExecutionStatus => {
        if (!testResult?.testExecutions) {
            return isRunning ? 'RUNNING' : 'PENDING';
        }

        const execution = testResult.testExecutions.find(
            exec => exec.rubricGrade?.name === rubricGrade.name
        );

        return execution?.status || 'PENDING';
    };

    const getTestFeedback = (rubricGrade: RubricGrade): string => {
        if (!testResult?.testExecutions) return '';

        const execution = testResult.testExecutions.find(
            exec => exec.rubricGrade?.name === rubricGrade.name
        );

        return execution?.rubricGrade?.description || execution?.error || '';
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[80vh] max-h-[80vh] overflow-hidden flex flex-col bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Test Runner - {rubric.name}
                        {hasStarted && (
                            <Badge variant="outline" className="ml-auto">
                                {score}/{total} ({percentage}%)
                            </Badge>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col gap-4">
                    {/* Action Bar */}
                    <div className="flex gap-2">
                        <Button
                            onClick={handleRunTests}
                            disabled={isRunning}
                            className="flex items-center gap-2"
                        >
                            {isRunning ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="h-4 w-4" />
                            )}
                            {isRunning ? 'Running Tests...' : 'Run Tests'}
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Close
                        </Button>
                    </div>

                    <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Test Results */}
                        <div className="flex flex-col gap-3 overflow-hidden">
                            <h3 className="font-semibold text-sm text-gray-700">Test Cases</h3>
                            <div className="flex-1 overflow-y-auto space-y-2">
                                {rubricGrades.map((rubricGrade, index) => {
                                    const status = getTestStatus(rubricGrade);
                                    const feedback = getTestFeedback(rubricGrade);

                                    return (
                                        <Card key={rubricGrade.id || index} className={cn("border", getStatusColor(status))}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm flex items-center gap-2">
                                                    {getStatusIcon(status)}
                                                    <span className="flex-1">{rubricGrade.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {status}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            {(rubricGrade.description || feedback) && (
                                                <CardContent className="pt-0">
                                                    <div className="text-xs text-gray-600 space-y-1">
                                                        {rubricGrade.description && (
                                                            <p><strong>Description:</strong> {rubricGrade.description}</p>
                                                        )}
                                                        {feedback && status !== 'PENDING' && status !== 'RUNNING' && (
                                                            <p><strong>Feedback:</strong> {feedback}</p>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Live Output */}
                        <div className="flex flex-col gap-3 overflow-hidden">
                            <h3 className="font-semibold text-sm text-gray-700">Live Output</h3>
                            <Card className="flex-1 overflow-hidden">
                                <CardContent className="p-3 h-full overflow-y-auto">
                                    <pre className="text-xs font-mono whitespace-pre-wrap text-gray-700 leading-relaxed">
                                        {isRunning && !liveTestOutput ? (
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Compiling and running tests...
                                            </div>
                                        ) : (
                                            liveTestOutput || 'Click "Run Tests" to start testing...'
                                        )}
                                    </pre>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Summary */}
                    {hasStarted && testResult && (
                        <Card className="border-t">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">Test Summary:</span>
                                        <Badge
                                            variant={percentage >= 70 ? "default" : "destructive"}
                                            className="text-xs"
                                        >
                                            {score}/{total} tests passed ({percentage}%)
                                        </Badge>
                                    </div>
                                    {testResult.executionTime && (
                                        <span className="text-xs text-gray-500">
                                            Completed in {testResult.executionTime}ms
                                        </span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}