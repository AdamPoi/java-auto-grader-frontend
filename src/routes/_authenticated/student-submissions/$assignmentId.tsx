import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import StudentSubmission from '@/features/student-submission'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/student-submissions/$assignmentId',
)({
  component: StudentSubmissionPage,
})

function StudentSubmissionPage() {
  <>
    <Header fixed>
      <div className='ml-auto flex items-center space-x-4'>
        {/* Add any header elements here if needed */}
      </div>
    </Header>
    <Main>
      <div className='mb-4'>
        <h2 className='text-2xl font-bold tracking-tight'>Create New Course</h2>
        <p className='text-muted-foreground'>
          Fill in the details for the new course and assign permissions.
        </p>
      </div>
      <div className='grid gap-4 py-4'>
        <StudentSubmission />
      </div>
    </Main>
  </>
}
