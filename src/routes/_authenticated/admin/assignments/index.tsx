import Assignments from '@/features/assignments';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
    '/_authenticated/admin/assignments/',
)({
    component: Assignments,
});


