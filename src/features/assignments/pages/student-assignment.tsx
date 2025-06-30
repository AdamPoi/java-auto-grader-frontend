import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssignmentById } from '@/features/assignments/hooks/use-assignment';
import { useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Award, BookOpen, Clock, FileText } from 'lucide-react';

import { useSubmissionsList } from '@/features/submissions/hooks/use-submission';
import { useAuthStore } from '@/stores/auth.store';
import { useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function StudentAssignment() {
    const { assignmentId } = useParams({ from: "/_authenticated/app/assignments/$assignmentId/" });
    const { data: assignment, isLoading } = useAssignmentById(assignmentId);
    const { auth } = useAuthStore();
    const router = useRouter();

    const { data: studentSubmission, isLoading: submissionLoading } = useSubmissionsList({
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentId}&student=eq:${auth.user?.id}`,
    });

    const attemptSubmissions = studentSubmission?.content?.filter(sub => sub.type === "ATTEMPT") ?? [];
    const finalSubmission = studentSubmission?.content?.find(sub => sub.type === "FINAL");

    const [activeTab, setActiveTab] = useState("overview");

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-4 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-6 w-72" />
                    </div>
                </div>
                <Card>
                    <CardHeader className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <div className="flex gap-6">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-40" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-64 mb-4" />
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!assignment) {
        return <div className="text-center text-muted-foreground mt-10">Assignment not found.</div>;
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
                <div className="flex flex-col items-center">
                    <Card className="w-full max-w-2xl mb-10">
                        <CardHeader className="border-b">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-md text-muted-foreground">
                                <span className="flex items-center gap-1.5"><b>Due:</b> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No due date'}</span>
                                <span className="flex items-center gap-1.5"><b>Points:</b> {assignment.totalPoints}</span>
                                {assignment.timeLimit && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><b>Time Limit:</b> {assignment.timeLimit / 60 / 1000} minutes</span>}
                                {assignment.createdByTeacher && <span className="flex items-center gap-1.5"><b>Instructor:</b> {assignment.createdByTeacher.firstName}</span>}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                <TabsList className="m-4">
                                    <TabsTrigger value="overview"><BookOpen className="mr-2 h-4 w-4" />Overview</TabsTrigger>
                                    <TabsTrigger value="rubrics"><Award className="mr-2 h-4 w-4" />Rubrics</TabsTrigger>
                                    <TabsTrigger value="attempts"><FileText className="mr-2 h-4 w-4" />Attempt Submissions</TabsTrigger>
                                    <TabsTrigger value="final"><FileText className="mr-2 h-4 w-4" />Final Submission</TabsTrigger>
                                </TabsList>
                                <div className="p-6 pt-0">
                                    <TabsContent value="overview">
                                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                                        <p className="text-muted-foreground mb-6">{assignment.description}</p>
                                        <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                                        <div
                                            className="prose prose-invert max-w-none bg-muted p-4 rounded-md"
                                            style={{
                                                maxHeight: 340,
                                                overflowY: "auto",
                                            }}
                                        >
                                            <Markdown
                                                remarkPlugins={[remarkGfm]}
                                                rehypePlugins={[rehypeHighlight]}
                                                components={{
                                                    pre: props => (
                                                        <pre
                                                            {...props}
                                                            className="overflow-x-auto"
                                                            style={{ maxWidth: "100%" }}
                                                        />
                                                    ),
                                                    code: props => (
                                                        <code
                                                            {...props}
                                                            className="break-words"
                                                            style={{ whiteSpace: "pre" }}
                                                        />
                                                    ),
                                                }}
                                            >
                                                {assignment.resource ?? "No instructions provided."}
                                            </Markdown>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="rubrics">
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
                                    <TabsContent value="attempts">
                                        <h3 className="text-lg font-semibold mb-4">Your Attempt Submissions</h3>
                                        {submissionLoading ? (
                                            <Skeleton className="h-24 w-full" />
                                        ) : attemptSubmissions.length === 0 ? (
                                            <div className="text-muted-foreground">No attempt submissions yet.</div>
                                        ) : (
                                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
                                        )}
                                    </TabsContent>
                                    <TabsContent value="final">
                                        <h3 className="text-lg font-semibold mb-4">Your Final Submission</h3>
                                        {submissionLoading ? (
                                            <Skeleton className="h-24 w-full" />
                                        ) : !finalSubmission ? (
                                            <div className="text-muted-foreground">No final submission yet.</div>
                                        ) : (
                                            <div className="p-4 border border-border/60 rounded-lg space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium">{finalSubmission.student?.firstName || 'Unknown Student'}</h4>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${finalSubmission.status === 'COMPLETED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : finalSubmission.status === 'IN_PROGRESS'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {finalSubmission.status}
                                                    </span>
                                                </div>
                                                <div className="flex gap-4 text-sm justify-between">
                                                    <p><b>Submitted On:</b> {new Date(finalSubmission?.completedAt ?? '').toLocaleString()}</p>
                                                    <p><b>Grade:</b> <span className="font-bold text-green-600">
                                                        {finalSubmission.totalPoints} / {assignment.totalPoints}
                                                    </span></p>
                                                </div>
                                                {finalSubmission.feedback && (
                                                    <div>
                                                        <p className="font-semibold mb-1">Instructor:</p>
                                                        <p className="text-muted-foreground p-3 bg-muted rounded-md">{finalSubmission.feedback}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </CardContent>
                    </Card>
                    {!finalSubmission && (<Card className="max-w-lg w-full mx-auto mb-10 p-10 flex flex-col items-center">
                        <h2 className="text-xl font-bold mb-6">Ready to take the timed assessment?</h2>
                        <Button
                            size="lg"
                            onClick={() => router.navigate({ to: `/app/assignments/$assignmentId/assesment`, params: { assignmentId } })}
                        >
                            Start Timed Assessment
                        </Button>
                    </Card>)}
                </div>
            </div>
        </div>
    );
}

