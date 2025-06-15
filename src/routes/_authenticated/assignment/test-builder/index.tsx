import { TestBuilder } from '@/features/test-builder';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/assignment/test-builder/',
)({
  component: TestBuilder,
})

