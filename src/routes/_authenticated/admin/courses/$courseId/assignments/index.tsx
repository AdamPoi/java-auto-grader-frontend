import Assignments from '@/features/assignments';
import { createFileRoute, useParams } from '@tanstack/react-router';



export const Route = createFileRoute(
    '/_authenticated/admin/courses/$courseId/assignments/',
)({
    component: CourseAssignmentsPage,
});


function CourseAssignmentsPage() {
    const { courseId } = useParams({ from: '/_authenticated/admin/courses/$courseId/assignments/' });
    return (
        <Assignments courseId={courseId} />
    );
}