import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { SubmissionsForm as SubmissionFormComponent } from '@/features/submissions/components/submissions-form';
import { type SubmissionForm } from '@/features/submissions/data/types';
import { useCreateSubmission } from '@/features/submissions/hooks/use-submission';
import { getQueryKey } from '@/features/users/hooks/use-user';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/submissions/create/')({
  component: SubmissionFormPage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['SUBMISSION:CREATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function SubmissionFormPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createSubmissionMutation = useCreateSubmission()

  const onSubmit = (data: { files: FileData[]; codeEditorContent: string }) => {
    // For now, using placeholder values for required fields.
    // In a real application, these would come from user input, route params, or context.
    const submissionData: SubmissionForm = {
      ...data,
      attemptNumber: 1, // Placeholder
      status: 'SUBMITTED', // Placeholder
      assignmentId: 'some-assignment-id', // Placeholder - replace with actual ID
      studentId: 'some-student-id', // Placeholder - replace with actual ID
    };

    createSubmissionMutation.mutate(submissionData, {
      onSuccess: () => {
        toast.success(`Submission created successfully.`);
        navigate({ to: '/submissions' });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to create submission with: ${error.message}`);
      },
    });
  };

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          {/* Add any header elements here if needed */}
        </div>
      </Header>
      <Main>
        <div className='mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>Create New Submission</h2>
          <p className='text-muted-foreground'>
            Fill in the details for the new submission and assign permissions.
          </p>
        </div>
        <div className='grid gap-4 py-4'>
          <SubmissionFormComponent
            onSubmit={onSubmit}
          />
        </div>
      </Main>
    </>
  );
}
