import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAssignmentById } from '@/features/assignments/hooks/use-assignment';
import { useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Award, BookOpen, Clock, FileText, PanelLeft, PanelRight } from 'lucide-react';

import CodeEditor from '@/features/code-editor';
import { useSubmissionsList, useSubmitStudentSubmission } from '@/features/submissions/hooks/use-submission';
import { useAuthStore } from '@/stores/auth.store';
import type { SearchRequestParams } from '@/types/api.types';
import { useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function StudentAssignment() {
    const { auth } = useAuthStore.getState();
    const { assignmentId } = useParams({ from: '/_authenticated/app/assignments/$assignmentId/' });
    const { data: assignment, isLoading } = useAssignmentById(assignmentId);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const studentSubmissionMutation = useSubmitStudentSubmission();
    const searchParams: SearchRequestParams = {
        page: 0,
        size: 1000,
        filter: `assignment=eq:${assignmentId}&student=eq:${auth.user?.id}`,
    };
    const { data: studentSubmission } = useSubmissionsList(searchParams);


    const router = useRouter();

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
                <div className="flex h-screen">
                    <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-1/3 p-4' : 'w-0 p-0'} overflow-hidden`}>
                        <Card className="border-border/60 bg-card/50 backdrop-blur-sm h-full flex flex-col">
                            <CardHeader className="border-b border-border/60">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5"><b>Due:</b> {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : 'No due date'}</span>
                                    <span className="flex items-center gap-1.5"><b>Points:</b> {assignment.totalPoints}</span>
                                    {assignment.timeLimit && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /><b>Time Limit:</b> {assignment.timeLimit / 60 / 1000} minutes</span>}
                                    {assignment.createdByTeacher && <span className="flex items-center gap-1.5"><b>Instructor:</b> {assignment.createdByTeacher.firstName}</span>}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                                    <TabsList className="m-4">
                                        <TabsTrigger value="overview" onClick={() => setActiveTab('overview')} data-state={activeTab === 'overview' ? 'active' : 'inactive'}><BookOpen className="mr-2 h-4 w-4" />Overview</TabsTrigger>
                                        <TabsTrigger value="rubrics" onClick={() => setActiveTab('rubrics')} data-state={activeTab === 'rubrics' ? 'active' : 'inactive'}><Award className="mr-2 h-4 w-4" />Rubrics</TabsTrigger>
                                        <TabsTrigger value="submission" onClick={() => setActiveTab('submission')} data-state={activeTab === 'submission' ? 'active' : 'inactive'}><FileText className="mr-2 h-4 w-4" />My Submission</TabsTrigger>
                                    </TabsList>

                                    <div className="p-6 pt-0">
                                        <TabsContent value="overview" hidden={activeTab !== 'overview'}>
                                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                                            <p className="text-muted-foreground mb-6">{assignment.description}</p>
                                            <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                                            <div className="prose prose-invert max-w-none bg-muted p-4 rounded-md">
                                                <pre className="whitespace-pre-wrap font-sans text-foreground">
                                                    <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                                        {"```java\npublic class MyClass {\n    public static void main(String[] args) {\n        System.out.println(\"Hello, Java Markdown!\");\n    }\n}\n```"}
                                                    </Markdown>
                                                </pre>
                                            </div>
                                            {/* <Button className="mt-6">Submit Assignment</Button> */}
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
                                        <TabsContent value="submission" hidden={activeTab !== 'submission'}>
                                            {studentSubmission && studentSubmission.content.length > 0 ? (
                                                <div className="space-y-6">
                                                    <h3 className="text-lg font-semibold">Student Submission ({studentSubmission.content.length})</h3>
                                                    <div className="max-h-[640px] overflow-y-auto space-y-4 pr-2">
                                                        {studentSubmission.content.map((submission) => (
                                                            <div key={submission.id} className="p-4 border border-border/60 rounded-lg space-y-3">
                                                                <div className="flex justify-between items-start">
                                                                    <h4 className="font-medium">{submission.student?.firstName || 'Unknown Student'}</h4>
                                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${submission.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                        submission.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                                                            'bg-gray-100 text-gray-800'
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
                                                    <p className="text-muted-foreground">No submissions yet for this assignment.</p>
                                                </div>
                                            )}
                                        </TabsContent>

                                    </div>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>
                    <div className={`flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-2/3' : 'w-full'}`}>
                        <div className="flex-grow flex flex-col bg-card border-l h-full">
                            <div className="p-2 border-b flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                                    {isSidebarOpen ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
                                </Button>
                            </div>
                            <div className="flex-grow">
                                <CodeEditor assignment={assignment} submissionMutation={studentSubmissionMutation} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
