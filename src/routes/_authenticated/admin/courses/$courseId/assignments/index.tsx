import Assignments from '@/features/assignments';
import { createFileRoute } from '@tanstack/react-router';

function AssignmentsPage() {
    return (

        <Assignments />
    );
}

export const Route = createFileRoute(
    '/_authenticated/admin/courses/$courseId/assignments/',
)({
    component: AssignmentsPage,
});


