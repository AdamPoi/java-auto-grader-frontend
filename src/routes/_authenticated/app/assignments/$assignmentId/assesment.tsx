import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAssignmentById } from "@/features/assignments/hooks/use-assignment";
import CodeEditor from '@/features/code-editor';
import { type FileData } from "@/features/code-editor/hooks/use-file-management";
import type { TestSubmitRequest } from "@/features/submissions/data/types";
import { useSubmissionsList, useSubmitStudentSubmission } from "@/features/submissions/hooks/use-submission";
import { useTimedAssessmentStart, useTimedAssessmentStatus, useTimedAssessmentSubmit } from "@/features/submissions/hooks/use-timed-assesment";
import { useAuthStore } from "@/stores/auth.store";
import type { SearchRequestParams } from "@/types/api.types";
import { createFileRoute, useNavigate, useParams, useRouter } from "@tanstack/react-router";
import 'highlight.js/styles/vs.min.css';
import { ArrowLeft, Award, BookOpen, Clock, FileText, PanelLeft, PanelRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

export const Route = createFileRoute('/_authenticated/app/assignments/$assignmentId/assesment')({
    component: TimedAssessmentPage,
});

export default function TimedAssessmentPage() {
    const { assignmentId } = useParams({ from: "/_authenticated/app/assignments/$assignmentId/assesment" });
    const navigate = useNavigate();
    const router = useRouter();
    const { auth } = useAuthStore();

    const { data: assignment, isLoading: assignmentLoading } = useAssignmentById(assignmentId);
    const [files, setFiles] = useState<FileData[]>([{ fileName: "Main.java", content: assignment?.starterCode ?? "" }]);
    const searchParams: SearchRequestParams = {
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentId}&student=eq:${auth.user?.id}`,
    };
    const { data: studentSubmission, isLoading: submissionLoading } = useSubmissionsList(searchParams);

    // Mutations
    const startMutation = useTimedAssessmentStart(assignmentId);
    const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useTimedAssessmentStatus(assignmentId, {
        refetchInterval: 60000,
    });
    const submitMutation = useTimedAssessmentSubmit(assignmentId);

    // UI state
    const [timer, setTimer] = useState<number | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const timerInterval = useRef<NodeJS.Timeout | null>(null);
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    const isTimed = assignment?.options?.isTimed === true && typeof assignment?.options?.timeLimit === "number" && assignment.options.timeLimit > 0;
    const attemptSubmissions = studentSubmission?.content?.filter(sub => sub.type === "ATTEMPT") ?? [];

    // ---- Main change: Only start the assessment if NOT started
    useEffect(() => {
        // Only try to start if: not loading, not started, not submitted, and no error in status
        if (!assignmentId || statusLoading || startMutation.isPending || startMutation.isSuccess) return;

        // Status might be undefined on very first load, or if not started yet
        const assessmentNeverStarted = !status || !status.startedAt;
        const alreadySubmitted = !!status?.submitted; // Or check for status.status === 'COMPLETED' if your API returns it

        // Only trigger start if never started and not submitted
        if (assessmentNeverStarted && !alreadySubmitted) {
            startMutation.mutate(undefined, {
                onSuccess: () => refetchStatus(),
                // Optionally handle error: do nothing (user is not blocked)
            });
        }
    }, [assignmentId, status, statusLoading, startMutation.isPending, startMutation.isSuccess, refetchStatus]);

    // File change
    const handleFileChange = (updatedFiles: FileData[]) => setFiles(updatedFiles);

    // -- Timer logic (unchanged)
    useEffect(() => {
        if (!isTimed) return;
        function doPoll() {
            if (!status?.submitted && !status?.expired) refetchStatus();
        }
        if (pollInterval.current) clearInterval(pollInterval.current);
        if (!status?.submitted && !status?.expired) {
            pollInterval.current = setInterval(doPoll, 60000);
        }
        function onVisibilityChange() {
            if (document.visibilityState === "visible") doPoll();
        }
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [isTimed, status?.submitted, status?.expired, refetchStatus]);

    useEffect(() => {
        if (!isTimed) return;
        if (status?.remainingMs !== undefined && !status.submitted && !status.expired) {
            setTimer(Math.floor(status.remainingMs / 1000));
        }
    }, [isTimed, status?.remainingMs, status?.submitted, status?.expired]);

    useEffect(() => {
        if (!isTimed) return;
        if (timerInterval.current) clearInterval(timerInterval.current);
        if (timer === null || timer <= 0 || status?.submitted || status?.expired) return;
        timerInterval.current = setInterval(() => {
            setTimer((prev) => (prev !== null ? prev - 1 : null));
        }, 1000);
        return () => clearInterval(timerInterval.current as NodeJS.Timeout);
    }, [isTimed, timer, status?.submitted, status?.expired]);

    useEffect(() => {
        if (!isTimed) return;
        if (status && !status.submitted && (status.expired || timer === 0)) {
            handleSubmit();
        }
        // eslint-disable-next-line
    }, [isTimed, timer, status]);

    const handleRunTests = async (payload: TestSubmitRequest) => {
        return studentSubmissionMutation.mutateAsync(payload);
    };

    const handleSubmit = async () => {
        if (submitMutation.isPending || status?.submitted) return;
        try {
            const submissionPayload: TestSubmitRequest = {
                assignmentId: assignmentId,
                sourceFiles: files.filter(file => !file.fileName.toLowerCase().includes('test'))
                    .map(file => ({
                        fileName: file.fileName,
                        content: file.content
                    })),
                testFiles: [{
                    fileName: 'MainTest.java',
                    content: assignment?.testCode ?? ''
                }],
                userId: auth.user?.id,
                testClassNames: ['MainTest'],
                buildTool: 'gradle',
                mainClassName: 'Main'
            };
            await submitMutation.mutateAsync(submissionPayload);
            toast.success("Your submission has been submitted successfully.");
            navigate({ to: `/app/assignments/$assignmentId`, params: { assignmentId } });
        } catch (e) {
            toast.error("Something went wrong. Please try again.");
        }
    };

    const studentSubmissionMutation = useSubmitStudentSubmission();

    if (assignmentLoading || statusLoading || !assignment || !status) {
        return (
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                        <div className="h-6 w-72 bg-muted rounded animate-pulse" />
                    </div>
                </div>
                <Card>
                    <CardHeader className="space-y-4">
                        <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
                        <div className="flex gap-6">
                            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-4 w-40 bg-muted rounded animate-pulse" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-10 w-64 mb-4 bg-muted rounded animate-pulse" />
                        <div className="h-48 w-full bg-muted rounded animate-pulse" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (status.submitted) {
        return (
            <Card className="max-w-2xl mx-auto mt-10 p-6">
                <h1 className="text-xl font-bold mb-6">Assessment Submitted</h1>
                <div>Your submission was successful!</div>
            </Card>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans">
            <div className="mx-auto p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="outline" size="icon" onClick={() => router.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <span className="text-sm text-muted-foreground">{assignment.course?.name}</span>
                        <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
                    </div>
                </div>
                <div className="flex h-screen">
                    <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-1/2 p-4' : 'w-0 p-0'} overflow-hidden`}>
                        <Card className="border-border/60 bg-card/50 backdrop-blur-sm h-full flex flex-col">
                            <CardHeader className="border-b border-border/60">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-md text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><b>Due:</b> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No due date'}</span>
                                    <span className="flex items-center gap-1.5"><b>Points:</b> {assignment.totalPoints}</span>
                                    {assignment.createdByTeacher && <span className="flex items-center gap-1.5"><b>Instructor:</b> {assignment.createdByTeacher.firstName}</span>}
                                </div>
                                {isTimed && (
                                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-md text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            <b><Clock className="h-4 w-4" /></b>
                                            <b> Time Left:</b>{" "}
                                            <span className="flex items-center gap-1.5">
                                                {timer !== null
                                                    ? `${String(Math.floor(timer / 60)).padStart(2, "0")}:${String(timer % 60).padStart(2, "0")}`
                                                    : "--:--"} minutes
                                            </span>
                                        </span>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="p-0 grow">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="m-4">
                                        <TabsTrigger value="overview" onClick={() => setActiveTab('overview')} data-state={activeTab === 'overview' ? 'active' : 'inactive'}><BookOpen className="mr-2 h-4 w-4" />Overview</TabsTrigger>
                                        <TabsTrigger value="rubrics" onClick={() => setActiveTab('rubrics')} data-state={activeTab === 'rubrics' ? 'active' : 'inactive'}><Award className="mr-2 h-4 w-4" />Rubrics</TabsTrigger>
                                        {assignment.options?.showTrySubmission && (
                                            <TabsTrigger
                                                value="submission-attempt"
                                                onClick={() => setActiveTab('submission-attempt')}
                                                data-state={activeTab === 'submission-attempt' ? 'active' : 'inactive'}
                                            >
                                                <FileText className="mr-2 h-4 w-4" />Submission Attempt
                                            </TabsTrigger>
                                        )}
                                    </TabsList>
                                    <div className="p-6 pt-0">
                                        <TabsContent value="overview">
                                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                                            <p className="text-muted-foreground mb-6">{assignment.description}</p>
                                            <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                                            <div
                                                className="prose prose-invert max-w-none p-4 rounded-md"
                                                style={{
                                                    maxHeight: 480,
                                                    overflowY: "auto",
                                                }}
                                            >
                                                <Markdown
                                                    remarkPlugins={[remarkGfm]}
                                                    rehypePlugins={[rehypeHighlight]}
                                                    components={{
                                                        code({ node, className, children, ...props }) {
                                                            const match = /language-(\w+)/.exec(className || "");
                                                            const language = match ? match[1] : "java";
                                                            return (
                                                                <code className={`hljs language-${language} px-2 py-1 rounded-md`} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        },
                                                        pre({ node, ...props }) {
                                                            return (
                                                                <pre
                                                                    {...props}
                                                                    className="overflow-x-auto my-2 rounded-md"
                                                                    style={{ background: "inherit" }}
                                                                />
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {assignment.resource ?? "No instructions provided."}
                                                </Markdown>
                                            </div>
                                        </TabsContent>
                                        <TabsContent value="rubrics" hidden={activeTab !== 'rubrics'}>
                                            <h3 className="text-lg font-semibold mb-4">Grading Rubric</h3>
                                            <div className="space-y-4">
                                                {assignment.rubrics?.map(rubric => (
                                                    <div key={rubric.id} className="p-4 border border-border/60 rounded-lg">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-semibold text-foreground">{rubric.name}</span>
                                                            <span className="text-primary font-bold">{rubric.points} pts</span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">{rubric.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </TabsContent>
                                        {assignment.options?.showTrySubmission && (
                                            <TabsContent value="submission-attempt" hidden={activeTab !== 'submission-attempt'}>
                                                {attemptSubmissions.length > 0 ? (
                                                    <div className="space-y-6">
                                                        <h3 className="text-lg font-semibold">Submission Attempts ({attemptSubmissions.length})</h3>
                                                        <div className="max-h-[640px] overflow-y-auto space-y-4 pr-2">
                                                            {attemptSubmissions.map((submission) => (
                                                                <div key={submission.id} className="p-4 border border-border/60 rounded-lg space-y-3">
                                                                    <div className="flex justify-between items-start">
                                                                        <h4 className="font-medium">{submission.student?.firstName || 'Unknown Student'}</h4>
                                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${submission.status === 'COMPLETED'
                                                                            ? 'bg-green-100 text-green-800'
                                                                            : submission.status === 'IN_PROGRESS'
                                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                                : 'bg-gray-100 text-gray-800'
                                                                            }`}>
                                                                            {submission.status}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex gap-4 text-sm justify-between">
                                                                        <p><b>Submitted On:</b> {new Date(submission?.completedAt ?? '').toLocaleString()}</p>
                                                                        <p><b>Grade:</b> <span className="font-bold text-green-600">
                                                                            {submission.totalPoints} / {assignment.totalPoints}
                                                                        </span></p>
                                                                    </div>
                                                                    {submission.feedback && (
                                                                        <div>
                                                                            <p className="font-semibold mb-1">Instructor:</p>
                                                                            <p className="text-muted-foreground p-3 bg-muted rounded-md">{submission.feedback}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10">
                                                        <p className="text-muted-foreground">No submission attempts yet for this assignment.</p>
                                                    </div>
                                                )}
                                            </TabsContent>
                                        )}
                                    </div>
                                </Tabs>
                            </CardContent>
                            <CardFooter>
                                <Button className="mt-auto ml-auto mb-0" onClick={handleSubmit}>Submit Assignment</Button>
                            </CardFooter>
                        </Card>
                    </div>
                    <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-1/2' : 'w-full'}`}>
                        <div className="flex-grow flex flex-col bg-card border-l h-full">
                            <div className="p-2 border-b flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    {isSidebarOpen ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
                                </Button>
                            </div>
                            <div className="flex-grow">
                                <CodeEditor assignment={assignment}
                                    onRunTests={handleRunTests}
                                    initialFilesData={files}
                                    onFileChange={handleFileChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
