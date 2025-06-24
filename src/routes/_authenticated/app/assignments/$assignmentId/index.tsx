import { createFileRoute } from '@tanstack/react-router';

import StudentAssignment from '@/features/assignments/pages/student-assignment';
import TeacherAssignment from '@/features/assignments/pages/teacher-assignment';
import { useAuthStore } from '@/stores/auth.store';


export const Route = createFileRoute('/_authenticated/app/assignments/$assignmentId/')({
  component: AssignmentDetailPage,
})

export default function AssignmentDetailPage() {
  const { auth } = useAuthStore.getState();

  if (auth.hasRole(['student'])) {
    return <StudentAssignment />
  }

  else if (auth.hasRole(['teacher'])) {
    return <TeacherAssignment />
  }

  else {
    return <TeacherAssignment />
  }


}
