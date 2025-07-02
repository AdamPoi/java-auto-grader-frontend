import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AssignmentsForm as AssignmentFormComponent } from '@/features/assignments/components/assignments-form';
import BulkUpload from '@/features/assignments/components/bulk-upload';
import { useAssignmentById, useCreateAssignment } from '@/features/assignments/hooks/use-assignment';
import CodeEditor from '@/features/code-editor';
import Rubrics from '@/features/rubrics';
import RubricsProvider from '@/features/rubrics/context/rubrics-context';
import type { TestSubmitRequest } from '@/features/submissions/data/types';
import { useTryOutSubmission } from '@/features/submissions/hooks/use-submission';
import { TestBuilder } from '@/features/test-builder';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowLeft } from 'lucide-react';
import { Suspense, useState } from 'react';

export const Route = createFileRoute('/_authenticated/admin/assignments/$assignmentId/')({
  component: AssignmentManagePage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['ASSIGNMENT:CREATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});


function AssignmentManagePage() {
  const navigate = useNavigate();
  const router = useRouter()
  const { assignmentId } = Route.useParams();
  const [activeTab, setActiveTab] = useState("details");
  const [loadedTabs, setLoadedTabs] = useState(new Set(["details"]));
  const tryOutSubmissionMutation = useTryOutSubmission();

  const createAssignmentMutation = useCreateAssignment()
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentById(assignmentId);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLoadedTabs(prev => new Set([...prev, value]));
  };


  const TabLoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  const handleRunTests = async (payload: TestSubmitRequest) => {
    return tryOutSubmissionMutation.mutateAsync(payload);
  };



  return (
    <RubricsProvider>
      {/* Header Menu */}
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        {/* Header Page */}
        <div className='flex flex-col gap-2'>
          <Button variant="outline" size="icon" className='w-fit p-2' onClick={() => router.history.back()}>
            <ArrowLeft className="h-4 w-4" /> <span>Back</span>
          </Button>
          <div className="flex justify-between items-center">
            <div className='mb-4'>
              <h2 className='text-2xl font-bold tracking-tight'>Assignment Details</h2>
              <p className='text-muted-foreground'>
                Manage your assignment details, rubrics, tests, and code compilation.
              </p>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full-sm">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details" >
              Details
            </TabsTrigger>
            <TabsTrigger value="rubrics">
              Rubrics
            </TabsTrigger>
            <TabsTrigger value="test-builder">
              Test Builder
            </TabsTrigger>
            <TabsTrigger value="try-out">
              Submissions
            </TabsTrigger>
            <TabsTrigger value="compiler">
              Try Out
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <div className='grid gap-4 py-4'>
              <AssignmentFormComponent
                initialData={assignment}
                withFooter={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="rubrics" className="mt-6" data-testid="rubrics-tab">
            <div className="p-6 border rounded-lg" data-testid="rubrics-tab-content">
              {loadedTabs.has("rubrics") ? (
                <Suspense fallback={<TabLoadingSpinner />}>
                  <Rubrics assignmentId={assignmentId} />
                </Suspense>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="test-builder" className="mt-6" data-testid="test-builder-tab">
            {loadedTabs.has("test-builder") ? (
              <Suspense fallback={<TabLoadingSpinner />}>
                <TestBuilder />
              </Suspense>
            ) : null}
          </TabsContent>

          <TabsContent value="try-out" className="mt-6" data-testid="test-builder-tab">
            {loadedTabs.has("try-out") ? (
              <Suspense fallback={<TabLoadingSpinner />}>
                <BulkUpload />
              </Suspense>
            ) : null}
          </TabsContent>

          <TabsContent value="compiler" className="mt-6" data-testid="compiler-tab">
            {loadedTabs.has("compiler") ? (
              <Suspense fallback={<TabLoadingSpinner />}>
                <CodeEditor onRunTests={handleRunTests} />
              </Suspense>
            ) : null}
          </TabsContent>

        </Tabs>

        <div className="flex justify-start mt-8">
          <Button type='button' variant='outline' onClick={() => router.history.back()}>
            Back
          </Button>
        </div>
      </Main>
    </RubricsProvider>
  );
}
