import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import StudentSubmissionList from './components/StudentSubmissionList'
import { SubmissionsPrimaryButtons } from './components/submissionss-primary-buttons'
import SubmissionsProvider from './context/submissions-context'

export default function Submissions() {
    return (
        <SubmissionsProvider>
            <Header fixed>
                <Search />
                <div className='ml-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-2 flex flex-wrap items-center justify-between space-y-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Submission List</h2>
                        <p className='text-muted-foreground'>
                            Manage student submissions here.
                        </p>
                    </div>
                    <SubmissionsPrimaryButtons />
                </div>
                <StudentSubmissionList />
            </Main>
        </SubmissionsProvider>
    )
}

