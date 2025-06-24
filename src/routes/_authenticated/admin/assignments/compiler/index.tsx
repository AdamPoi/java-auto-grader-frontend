import CodeEditor from '@/features/code-editor';
import { useTryOutSubmission } from '@/features/submissions/hooks/use-submission';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/assignments/compiler/')({
  component: CompilerPage,
  // beforeLoad: async () => {
  //   const { auth } = await useAuthStore.getState()

  //   if (!auth.hasPermission(['ROLE:CREATE'])) {
  //     throw redirect({
  //       to: '/403',
  //     })
  //   }
  // }
});

export default function CompilerPage() {
  const tryOutMutation = useTryOutSubmission();

  return <CodeEditor submissionMutation={tryOutMutation} />;
}

