import { createFileRoute } from '@tanstack/react-router';
import CodeEditor from '@/features/code-editor';

export const Route = createFileRoute('/_authenticated/assignment/compiler/')({
  component: CodeEditor,
  // beforeLoad: async () => {
  //   const { auth } = await useAuthStore.getState()

  //   if (!auth.hasPermission(['ROLE:CREATE'])) {
  //     throw redirect({
  //       to: '/403',
  //     })
  //   }
  // }
});

