import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAssignmentById } from '@/features/assignments/hooks/use-assignment';
import CodeEditor from '@/features/code-editor';
import type { StudentSubmissionAiFeedbackRequest, Submission } from '@/features/submissions/data/types';
import { useAiCodeFeedback, useSubmission, useSubmissionsList, useUpdateSubmission } from '@/features/submissions/hooks/use-submission';
import { cn } from '@/lib/utils';
import { createFileRoute, useParams, useRouter } from '@tanstack/react-router';
import { ArrowLeft, Edit, Eye, SparklesIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

const SubmissionStatusBadge = ({ status }: { status: string }) => {
  const statusVariant = {
    COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
    TIMEOUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  };
  return <Badge className={cn(statusVariant[status] || 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', 'border-none')} variant="outline">{status}</Badge>;
};


function StudentSubmissionDetail() {
  const router = useRouter();
  const { submissionId } = useParams({ from: '/_authenticated/admin/submissions/$submissionId/' });

  // Component State
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [isSwitchingView, setIsSwitchingView] = useState(false);
  const [manualFeedback, setManualFeedback] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [savingFeedbackType, setSavingFeedbackType] = useState<'manual' | 'ai' | null>(null);
  const [isEditingManual, setIsEditingManual] = useState(false);
  const [isEditingAi, setIsEditingAi] = useState(false);
  const [isPreviewingManual, setIsPreviewingManual] = useState(false);
  const [isPreviewingAi, setIsPreviewingAi] = useState(false);


  // Data Fetching Hooks
  const { data: submission } = useSubmission(submissionId);
  const { data: assignment } = useAssignmentById(submission?.assignmentId, { enabled: !!submission });
  const { data: submissionsData, isLoading } = useSubmissionsList({
    page: 0,
    size: 1000,
    filter: `assignment=eq:${submission?.assignmentId}&student=eq:${submission?.studentId}`,
  }, {
    enabled: !!submission,
  });

  const attemptSubmissions = submissionsData?.content?.filter(sub => sub.type === 'ATTEMPT') ?? [];
  const finalSubmission = submissionsData?.content?.find(sub => sub.type === 'FINAL');

  // --- Effects ---
  useEffect(() => {
    if (!selectedSubmission && (finalSubmission || attemptSubmissions.length > 0)) {
      setSelectedSubmission(finalSubmission ?? attemptSubmissions[0]);
    }
  }, [finalSubmission, attemptSubmissions, selectedSubmission]);

  useEffect(() => {
    if (isSwitchingView) {
      const timer = setTimeout(() => setIsSwitchingView(false), 250);
      return () => clearTimeout(timer);
    }
  }, [selectedSubmission, isSwitchingView]);

  useEffect(() => {
    if (submission) {
      setManualFeedback(submission.manualFeedback ?? '');
      setAiFeedback(submission.aiFeedback ?? '');
    }
  }, [submission]);

  // Mutation Hooks
  const updateSubmission = useUpdateSubmission();
  const getAiCodeFeedback = useAiCodeFeedback();

  // --- Handlers ---
  const handleSelectSubmission = (sub: Submission) => {
    setIsSwitchingView(true);
    setSelectedSubmission(sub);
  };

  const handleSaveManualFeedback = async () => {
    setSavingFeedbackType('manual');
    try {
      await updateSubmission.mutateAsync({ id: submissionId, data: { manualFeedback } });
      setIsEditingManual(false);
      setIsPreviewingManual(false);
    } finally {
      setSavingFeedbackType(null);
    }
  };

  const handleCancelManualFeedback = () => {
    setManualFeedback(submission?.manualFeedback ?? '');
    setIsEditingManual(false);
    setIsPreviewingManual(false);
  };

  const handleSaveAiFeedback = async () => {
    setSavingFeedbackType('ai');
    try {
      await updateSubmission.mutateAsync({ id: submissionId, data: { aiFeedback } });
      setIsEditingAi(false);
      setIsPreviewingAi(false);
    } finally {
      setSavingFeedbackType(null);
    }
  };

  const handleCancelAiFeedback = () => {
    setAiFeedback(submission?.aiFeedback ?? '');
    setIsEditingAi(false);
    setIsPreviewingAi(false);
  };


  const handleGenerateAiFeedback = async () => {
    if (!selectedSubmission) return;
    const payload: StudentSubmissionAiFeedbackRequest = {
      studentCodes: submission?.submissionCodes?.map(code => ({ fileName: code.fileName, content: code.sourceCode })),
      instructions: assignment?.resource ?? '',
      rubrics: assignment?.rubrics?.map(rubric => ({ name: rubric.name, description: rubric.description })) ?? [],
    };
    const feedback = await getAiCodeFeedback.mutateAsync({ data: payload });
    setAiFeedback(feedback);
    setIsEditingAi(true);
    setIsPreviewingAi(false);
  };

  // --- Render Logic ---
  if (isLoading || !submission || !assignment) {
    return <div className="flex items-center justify-center h-full"><div className="text-2xl">Loading...</div></div>;
  }

  const MarkdownView = ({ content }: { content: string }) => (
    <div className="prose prose-sm dark:prose-invert prose-pre:bg-neutral-800 prose-pre:text-white rounded-md border bg-background p-4 min-h-[120px] w-full">
      {content ? <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>{content}</Markdown> : <p className="text-muted-foreground">No feedback yet.</p>}
    </div>
  );

  const renderManualFeedbackContent = () => {
    if (isEditingManual) {
      if (isPreviewingManual) {
        return (
          <div className="space-y-2">
            <MarkdownView content={manualFeedback} />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewingManual(false)}><Edit className="w-4 h-4 mr-2" />Back to Edit</Button>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-2">
          <Textarea placeholder="Type feedback in Markdown..." value={manualFeedback} onChange={(e) => setManualFeedback(e.target.value)} disabled={savingFeedbackType === 'manual'} rows={10} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleCancelManualFeedback}>Cancel</Button>
            <Button variant="outline" onClick={() => setIsPreviewingManual(true)}><Eye className="w-4 h-4 mr-2" />Preview</Button>
            <Button onClick={handleSaveManualFeedback} disabled={savingFeedbackType === 'manual'}>{savingFeedbackType === 'manual' ? 'Saving...' : 'Save Feedback'}</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <MarkdownView content={manualFeedback} />
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsEditingManual(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
        </div>
      </div>
    );
  };

  const renderAiFeedbackContent = () => {
    if (isEditingAi) {
      if (isPreviewingAi) {
        return (
          <div className="space-y-2">
            <MarkdownView content={aiFeedback} />
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setIsPreviewingAi(false)}><Edit className="w-4 h-4 mr-2" />Back to Edit</Button>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-2">
          <Textarea placeholder="Generate or edit AI feedback..." value={aiFeedback} onChange={(e) => setAiFeedback(e.target.value)} disabled={savingFeedbackType === 'ai' || getAiCodeFeedback.isPending} rows={10} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleCancelAiFeedback}>Cancel</Button>
            <Button variant="outline" onClick={() => setIsPreviewingAi(true)}><Eye className="w-4 h-4 mr-2" />Preview</Button>
            <Button onClick={handleSaveAiFeedback} disabled={savingFeedbackType === 'ai'}>{savingFeedbackType === 'ai' ? 'Saving...' : 'Save AI Feedback'}</Button>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <MarkdownView content={aiFeedback} />
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditingAi(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
          <Button variant="outline" size="sm" onClick={handleGenerateAiFeedback} disabled={getAiCodeFeedback.isPending || !!savingFeedbackType}>
            {getAiCodeFeedback.isPending ? 'Generating...' : <><SparklesIcon className="w-4 h-4 mr-2" /> Generate</>}
          </Button>
        </div>
      </div>
    );
  };


  return (
    <>
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch /><ProfileDropdown />
        </div>
      </Header>
      <Main>
        <div className='flex items-center space-x-4 mb-4'>
          <Button variant="outline" size="icon" className='h-7 w-7' onClick={() => router.history.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Submission Detail</h2>
            <p className='text-muted-foreground'>Review the student's submission history and provide feedback.</p>
          </div>
        </div>
        <Separator className="mb-6" />

        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader><CardTitle>Assignment & Student</CardTitle></CardHeader>
            <CardContent>
              <h3 className="text-2xl font-semibold">{assignment.title}</h3>
              <p className="text-muted-foreground">Submitted by <span className="font-semibold text-primary">{submission.student?.firstName} {submission.student?.lastName}</span> ({submission.student?.nim})</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Submission History</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Score</TableHead></TableRow></TableHeader>
                <TableBody>
                  {finalSubmission && (
                    <TableRow onClick={() => handleSelectSubmission(finalSubmission)} className={cn("cursor-pointer", selectedSubmission?.id === finalSubmission.id && 'bg-muted/50')}>
                      <TableCell><Badge>Final</Badge></TableCell>
                      <TableCell>{new Date(finalSubmission.completedAt).toLocaleString()}</TableCell>
                      <TableCell><SubmissionStatusBadge status={finalSubmission.status} /></TableCell>
                      <TableCell className="font-semibold">{finalSubmission.totalPoints}</TableCell>
                    </TableRow>
                  )}
                  {attemptSubmissions.map((attempt) => (
                    <TableRow key={attempt.id} onClick={() => handleSelectSubmission(attempt)} className={cn("cursor-pointer", selectedSubmission?.id === attempt.id && 'bg-muted/50')}>
                      <TableCell><Badge variant="secondary">Attempt</Badge></TableCell>
                      <TableCell>{new Date(attempt.completedAt).toLocaleString()}</TableCell>
                      <TableCell><SubmissionStatusBadge status={attempt.status} /></TableCell>
                      <TableCell className="font-semibold">{attempt.totalPoints}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Grade & Feedback</CardTitle>
              <CardDescription>Final score is {submission.totalPoints ?? 'N/A'} out of 100.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="manual-feedback">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="manual-feedback">Manual Feedback</TabsTrigger>
                  <TabsTrigger value="ai-feedback">AI Feedback</TabsTrigger>
                </TabsList>
                <TabsContent value="manual-feedback" className="pt-4">
                  {renderManualFeedbackContent()}
                </TabsContent>
                <TabsContent value="ai-feedback" className="pt-4">
                  {renderAiFeedbackContent()}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Code Viewer</CardTitle>
              <CardDescription>
                {selectedSubmission ? `Viewing code for: ${selectedSubmission.type === 'FINAL' ? 'Final Submission' : 'Attempt'} on ${new Date(selectedSubmission.completedAt || '').toLocaleString()}` : 'No submission selected.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSwitchingView || !selectedSubmission ? (
                <div className="space-y-4"><Skeleton className="h-[40px] w-full" /><Skeleton className="h-[520px] w-full" /></div>
              ) : (
                <div className="h-[600px] border rounded-md">
                  <CodeEditor key={selectedSubmission.id} readOnly={true} initialFilesData={selectedSubmission.submissionCodes.map(code => ({ fileName: code.fileName, content: code.sourceCode }))} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Main >
    </>
  );
}

export const Route = createFileRoute('/_authenticated/admin/submissions/$submissionId/')({
  component: StudentSubmissionDetail,
});