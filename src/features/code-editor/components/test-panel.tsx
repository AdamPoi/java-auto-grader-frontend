import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ExecutionStatus, Rubric, RubricGrade } from '@/features/rubrics/data/types';
import { useRubricGrades } from '@/features/rubrics/hooks/use-rubric-grade';
import type { Submission, TestSubmitRequest } from '@/features/submissions/data/types';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import type { SearchRequestParams } from '@/types/api.types';
import { AlertCircle, CheckCircle, Clock, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';

interface TestPanelProps {
    rubrics: Rubric[];
    assignmentId: string;
    testCode?: string;
    files: Array<{ fileName: string; content: string }>;
    submissionMutation: {
        mutateAsync: (payload: TestSubmitRequest) => Promise<Submission>;
        isLoading?: boolean;
        error?: any;
    };
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

interface RubricScore {
    score: number;
    total: number;
    percentage: number;
}
// Update the calculateOverallScore function to work with the new data structure
const calculateOverallScore = (rubrics: Rubric[], testResult?: Submission) => {
    if (!testResult?.testExecutions) return { score: 0, total: 0, percentage: 0 };

    let totalScore = 0;
    let totalTests = 0;

    rubrics.forEach(rubric => {
        const rubricGrades = rubric.rubricGrades || [];
        totalTests += rubricGrades.length;

        rubricGrades.forEach(grade => {
            const execution = testResult.testExecutions?.find(
                exec => exec.methodName?.includes(grade.name) ||
                    exec.rubricGrade?.name === grade.name
            );
            if (execution?.status === 'PASSED') {
                totalScore++;
            }
        });
    });

    return {
        score: totalScore,
        total: totalTests,
        percentage: totalTests > 0 ? Math.round((totalScore / totalTests) * 100) : 0
    };
};

// Update the calculateRubricScore function
const calculateRubricScore = (rubric: Rubric, testResult?: Submission): RubricScore => {
    const rubricGrades = rubric.rubricGrades || [];

    if (!testResult?.testExecutions) {
        return { score: 0, total: rubricGrades.length, percentage: 0 };
    }

    let passedTests = 0;
    rubricGrades.forEach(grade => {
        const execution = testResult.testExecutions?.find(
            exec => exec.methodName?.includes(grade.name) ||
                exec.rubricGrade?.name === grade.name
        );
        if (execution?.status === 'PASSED') {
            passedTests++;
        }
    });

    return {
        score: passedTests,
        total: rubricGrades.length,
        percentage: rubricGrades.length > 0 ? Math.round((passedTests / rubricGrades.length) * 100) : 0
    };
};

export function TestPanel({
    rubrics,
    assignmentId,
    testCode,
    files,
    submissionMutation
}: TestPanelProps) {
    const [hasStarted, setHasStarted] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('overview');
    const [isRunning, setIsRunning] = useState(false);
    const [testResult, setTestResult] = useState<Submission | undefined>();
    const [liveTestOutput, setLiveTestOutput] = useState<string>('');
    const { auth } = useAuthStore.getState();
    const rubricSearchParams: SearchRequestParams = {
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentId}`,
    };
    const { data: rubricGrades, isLoading: isLoadingRubricGrades } = useRubricGrades(rubricSearchParams);


    const handleRunTests = async () => {
        if (!testCode || !rubrics.length) {
            console.warn('No test code or rubrics available');
            return;
        }

        setIsRunning(true);
        setHasStarted(true);
        setLiveTestOutput('Compiling and running tests...\n');

        const submissionPayload: TestSubmitRequest = {
            assignmentId: assignmentId,
            sourceFiles: files.filter(file => !file.fileName.toLowerCase().includes('test'))
                .map(file => ({
                    fileName: file.fileName,
                    content: file.content
                })),
            testFiles: [{
                fileName: 'MainTest.java',
                content: testCode
            }],
            userId: auth.user?.id,
            testClassNames: ['MainTest'],
        };

        setTestResult(undefined);

        try {
            const response = await submissionMutation.mutateAsync(submissionPayload);
            console.log('Test response:', response);
            setTestResult(response);

        } catch (error: any) {
            console.error('Error running tests:', error);
            const errorOutput = `Error running tests: ${error.message || 'Unknown error'}\n`;
            setLiveTestOutput(errorOutput);
        } finally {
            setIsRunning(false);
        }
    };

    const getTestStatus = (rubricGrade: RubricGrade): ExecutionStatus => {
        console.log(testResult?.testExecutions)
        if (!testResult?.testExecutions) {
            return isRunning ? 'RUNNING' : 'PENDING';
        }

        const execution = testResult.testExecutions.find(
            exec => exec.methodName?.includes(rubricGrade.name) ||
                exec.rubricGrade?.name === rubricGrade.name
        );

        return execution?.status || 'PENDING';
    };

    const getTestFeedback = (rubricGrade: RubricGrade): string => {
        if (!testResult?.testExecutions) return '';

        const execution = testResult.testExecutions.find(
            exec => exec.methodName?.includes(rubricGrade.name) ||
                exec.rubricGrade?.name === rubricGrade.name
        );

        return execution?.error || execution?.output || execution?.rubricGrade?.description || '';
    };

    if (rubrics.length === 0) {
        return (
            <div className="h-full bg-neutral-800 border-t border-neutral-700 flex items-center justify-center">
                <div className="text-center text-neutral-400">
                    <p>No test rubrics available</p>
                    <p className="text-sm">Test rubrics will appear here when configured</p>
                </div>
            </div>
        );
    }

    const { score: totalScore, total: totalTests, percentage: overallPercentage } = calculateOverallScore(rubrics, testResult);
    const renderRubricContent = (rubric: Rubric) => {
        const rubricGrades = rubric.rubricGrades || [];
        const { score: rubricScore, total: rubricTotal, percentage: rubricPercentage } = calculateRubricScore(rubric, testResult);

        return (
            <div className="h-full flex flex-col">
                {/* Rubric Header */}
                <div className="flex-shrink-0 p-3 border-b border-neutral-700">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-neutral-200">
                            {rubric.name}
                        </h3>
                        {hasStarted && (
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs border-neutral-500",
                                    rubricPercentage >= 70
                                        ? "bg-green-900/20 text-green-300 border-green-500"
                                        : "bg-red-900/20 text-red-300 border-red-500"
                                )}
                            >
                                {rubricScore}/{rubricTotal} ({rubricPercentage}%)
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Test Cases */}
                <div className="flex-1 overflow-y-auto p-3">
                    {rubricGrades.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-neutral-400">
                            <p className="text-sm">No test cases defined for this rubric</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {rubricGrades.map((rubricGrade, index) => {
                                const status = getTestStatus(rubricGrade);
                                const feedback = getTestFeedback(rubricGrade);

                                return (
                                    <Card
                                        key={rubricGrade.id || index}
                                        className={cn(
                                            "border bg-neutral-700 border-neutral-600",
                                            status === 'PASSED' && "border-green-500 bg-green-900/20",
                                            status === 'FAILED' && "border-red-500 bg-red-900/20",
                                            status === 'RUNNING' && "border-blue-500 bg-blue-900/20"
                                        )}
                                    >
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm flex items-center gap-2 text-neutral-200">
                                                {getStatusIcon(status)}
                                                <span className="flex-1">{rubricGrade.name}</span>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs border-neutral-500",
                                                        status === 'PASSED' && "bg-green-900/20 text-green-300 border-green-500",
                                                        status === 'FAILED' && "bg-red-900/20 text-red-300 border-red-500",
                                                        status === 'RUNNING' && "bg-blue-900/20 text-blue-300 border-blue-500",
                                                        (status === 'PENDING' || !status) && "bg-neutral-600 text-neutral-200"
                                                    )}
                                                >
                                                    {status || 'PENDING'}
                                                </Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        {(rubricGrade.description || feedback) && (
                                            <CardContent className="pt-0">
                                                <div className="text-xs text-neutral-300 space-y-2">
                                                    {rubricGrade.description && (
                                                        <div>
                                                            <p className="font-medium text-neutral-200">Description:</p>
                                                            <p className="text-neutral-300">{rubricGrade.description}</p>
                                                        </div>
                                                    )}
                                                    {feedback && status !== 'PENDING' && status !== 'RUNNING' && (
                                                        <div>
                                                            <p className="font-medium text-neutral-200">
                                                                {status === 'FAILED' ? 'Error:' : 'Output:'}
                                                            </p>
                                                            <p className={cn(
                                                                "text-xs font-mono p-2 rounded border",
                                                                status === 'FAILED'
                                                                    ? "bg-red-900/10 text-red-300 border-red-500/30"
                                                                    : "bg-green-900/10 text-green-300 border-green-500/30"
                                                            )}>
                                                                {feedback}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-full bg-neutral-800 border-t border-neutral-700 flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 p-3 border-b border-neutral-700">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-neutral-200">
                        Test Cases
                    </h3>
                    {hasStarted && (
                        <Badge variant="outline" className="bg-neutral-700 text-neutral-200 border-neutral-600">
                            Overall: {totalScore}/{totalTests} ({overallPercentage}%)
                        </Badge>
                    )}
                </div>

                <Button
                    onClick={handleRunTests}
                    disabled={isRunning}
                    className="w-full bg-neutral-600 hover:bg-green-500 text-neutral-100 border-neutral-500 disabled:bg-neutral-700 disabled:text-neutral-400"
                    size="sm"
                >
                    {isRunning ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Running All Tests...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Run All Tests ({rubrics.length} rubric{rubrics.length !== 1 ? 's' : ''})
                        </>
                    )}
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="flex-shrink-0 mx-3 mt-2 bg-neutral-700 border border-neutral-600 overflow-x-auto">
                        <TabsTrigger
                            value="overview"
                            className="text-xs data-[state=active]:bg-neutral-600 data-[state=active]:text-neutral-100 text-neutral-300"
                        >
                            Overview
                        </TabsTrigger>
                        {rubrics.map((rubric) => {
                            const { score, total, percentage } = calculateRubricScore(rubric, testResult);

                            return (
                                <TabsTrigger
                                    key={rubric.id}
                                    value={rubric.id}
                                    className="text-xs data-[state=active]:bg-neutral-600 data-[state=active]:text-neutral-100 text-neutral-300 flex items-center gap-2"
                                >
                                    <span>{rubric.name}</span>
                                    {hasStarted && (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "text-xs scale-75",
                                                percentage >= 70
                                                    ? "bg-green-900/30 text-green-400 border-green-600"
                                                    : percentage > 0
                                                        ? "bg-red-900/30 text-red-400 border-red-600"
                                                        : "bg-neutral-600 text-neutral-400 border-neutral-500"
                                            )}
                                        >
                                            {score}/{total}
                                        </Badge>
                                    )}
                                </TabsTrigger>
                            );
                        })}
                        <TabsTrigger
                            value="output"
                            className="text-xs data-[state=active]:bg-neutral-600 data-[state=active]:text-neutral-100 text-neutral-300"
                        >
                            Output
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="flex-1 overflow-hidden m-3 mt-2">
                        <div className="h-full overflow-y-auto space-y-3">
                            {hasStarted ? (
                                <>
                                    {/* Overall Summary Card */}
                                    <Card className="bg-neutral-700 border-neutral-600">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-sm font-medium text-neutral-200">Overall Test Results</h4>
                                                <Badge
                                                    variant={overallPercentage >= 70 ? "default" : "destructive"}
                                                    className="text-sm"
                                                >
                                                    {totalScore}/{totalTests} ({overallPercentage}%)
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-neutral-400">
                                                {rubrics.length} rubric{rubrics.length !== 1 ? 's' : ''} tested
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Rubric Summaries */}
                                    {rubrics.map((rubric) => {
                                        const { score, total, percentage } = calculateRubricScore(rubric, testResult);

                                        return (
                                            <Card
                                                key={rubric.id}
                                                className={cn(
                                                    "border bg-neutral-700 border-neutral-600 cursor-pointer hover:bg-neutral-650 transition-colors",
                                                    percentage >= 70 && "border-green-500/50",
                                                    percentage < 70 && percentage > 0 && "border-red-500/50"
                                                )}
                                                onClick={() => setActiveTab(rubric.id)}
                                            >
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h5 className="text-sm font-medium text-neutral-200">{rubric.name}</h5>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-xs",
                                                                percentage >= 70
                                                                    ? "bg-green-900/20 text-green-300 border-green-500"
                                                                    : percentage > 0
                                                                        ? "bg-red-900/20 text-red-300 border-red-500"
                                                                        : "bg-neutral-600 text-neutral-400 border-neutral-500"
                                                            )}
                                                        >
                                                            {score}/{total} ({percentage}%)
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-neutral-400">
                                                        {total} test case{total !== 1 ? 's' : ''} • Click to view details
                                                    </div>
                                                    {/* Quick status indicators */}
                                                    <div className="flex gap-1 mt-2">
                                                        {rubricGrades?.content?.slice(0, 8).map((grade, index) => {
                                                            const status = getTestStatus(grade);
                                                            return (
                                                                <div
                                                                    key={grade.id || index}
                                                                    className={cn(
                                                                        "w-2 h-2 rounded-full",
                                                                        status === 'PASSED' && "bg-green-500",
                                                                        status === 'FAILED' && "bg-red-500",
                                                                        status === 'RUNNING' && "bg-blue-500 animate-pulse",
                                                                        status === 'PENDING' && "bg-gray-400"
                                                                    )}
                                                                    title={`${grade.name}: ${status}`}
                                                                />
                                                            );
                                                        })}
                                                        {(rubric.rubricGrades?.length || 0) > 8 && (
                                                            <div className="w-2 h-2 rounded-full bg-neutral-500" title="More tests..." />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-32 text-neutral-400">
                                    <div className="text-center">
                                        <p className="text-sm mb-2">Ready to test {rubrics.length} rubric{rubrics.length !== 1 ? 's' : ''}</p>
                                        <p className="text-xs">Click "Run All Tests" to start</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {rubrics.map((rubric) => (
                        <TabsContent key={rubric.id} value={rubric.id} className="flex-1 overflow-hidden m-0">
                            {renderRubricContent(rubric)}
                        </TabsContent>
                    ))}

                    <TabsContent value="output" className="flex-1 overflow-hidden m-3 mt-2">
                        <Card className="h-full bg-neutral-700 border-neutral-600">
                            <CardContent className="p-3 h-full overflow-y-auto">
                                <pre className="text-xs font-mono whitespace-pre-wrap text-neutral-300 leading-relaxed">
                                    {isRunning && !liveTestOutput ? (
                                        <div className="flex items-center gap-2 text-blue-400">
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                            Compiling and running all tests...
                                        </div>
                                    ) : (
                                        liveTestOutput || 'Click "Run All Tests" to start testing...'
                                    )}
                                </pre>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}