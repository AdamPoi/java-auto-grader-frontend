import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { useAssignmentById } from '@/features/assignments/hooks/use-assignment';
import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import { AssignmentDetail } from '@/features/student-assignment';
import type { SubmissionForm } from '@/features/submissions/data/types';
import { useCreateSubmission } from '@/features/submissions/hooks/use-submission';
import { getQueryKey } from '@/features/users/hooks/use-user';
import { useAuthStore } from '@/stores/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router';
import { toast } from 'sonner';

export const Route = createFileRoute(
  '/_authenticated/admin/student-assignments/$assignmentId',
)({
  component: StudentAssignmentDetailPage,
})

function StudentAssignmentDetailPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { auth } = useAuthStore()
  const { assignmentId } = useParams({ from: '/_authenticated/admin/student-assignments/$assignmentId' });

  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentById(assignmentId);

  const createSubmissionMutation = useCreateSubmission()


  const onSubmit = (data: { files: FileData[]; codeEditorContent: string }) => {
    const submissionData: SubmissionForm = {
      ...data,
      status: 'SUBMITTED',
      assignmentId: assignmentId,
      studentId: auth.user?.id,
    };

    createSubmissionMutation.mutate(submissionData, {
      onSuccess: () => {
        toast.success(`Submission created successfully.`);
        navigate({ to: '/admin/submissions' });
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
        <div className="space-y-6">
          {assignment && <AssignmentDetail
            title={assignment.title}
            dueDate={assignment.dueDate}
            description={assignment.description}
            // requirements={assignment.requirements}
            rubric={assignment.rubrics}
          />}

          {/* You can add the submission form below if needed */}
          <div className="mt-8">
            {/* <SubmissionsForm onSubmit={onSubmit} /> */}
          </div>
        </div>
      </Main>
    </>
  );
}