import Submissions from '@/features/submissions';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/admin/submissions/')({
    component: () => <Submissions />,
})
