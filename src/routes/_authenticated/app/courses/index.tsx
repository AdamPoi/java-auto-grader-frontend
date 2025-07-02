import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { Search } from '@/components/search';
import { ThemeSwitch } from '@/components/theme-switch';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseCard } from '@/features/courses/components/courses-card';
import { useCourse } from '@/features/courses/hooks/use-course';
import { useAuthStore } from '@/stores/auth.store';
import type { SearchRequestParams } from '@/types/api.types';
import { createFileRoute } from '@tanstack/react-router';
import { Suspense, useEffect, useState } from 'react';

export const Route = createFileRoute('/_authenticated/app/courses/')({
    component: CoursePage,
})

function CoursePage() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const { auth } = useAuthStore()
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearchValue, setDebouncedSearchValue] = useState('');


    useEffect(() => {
        if (searchValue === '') {
            setDebouncedSearchValue('');
        } else {
            const handler = setTimeout(() => {
                setDebouncedSearchValue(searchValue);
            }, 500);

            return () => {
                clearTimeout(handler);
            };
        }
    }, [searchValue]);


    const [filter, setFilter] = useState<string | undefined>(undefined);
    const searchParams: SearchRequestParams = {
        page: pagination.pageIndex,
        size: pagination.pageSize,
        filter: filter,
    };

    useEffect(() => {
        const filters: string[] = [];
        if (debouncedSearchValue) {
            filters.push(`search=like:${debouncedSearchValue}`);
        }

        setFilter(filters.length > 0 ? filters.join('&') : undefined);

        const url = new URL(window.location.href);
        if (filters.length > 0) {
            url.searchParams.set('filter', filters.join('&'));
        } else {
            url.searchParams.delete('filter');
        }
        window.history.replaceState({}, '', url.toString());
    }, [debouncedSearchValue]);

    useEffect(() => {
        if (auth.user) {
            setFilter(`student=eq:${auth.user.id}`)
        }
    }, [auth]);

    const { data: courses, isLoading } = useCourse(searchParams);
    return (
        <>
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
                        <h2 className='text-2xl font-bold tracking-tight'>Course List</h2>
                        <p className='text-muted-foreground'>
                            See your courses here.
                        </p>
                    </div>
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                        <Input
                            placeholder="Search courses..."
                            value={searchValue}
                            onChange={e => setSearchValue(e.target.value)}
                            className="max-w-xs"
                        />
                    </div>

                    <div className="mb-4 text-muted-foreground">
                        {courses?.content.length} courses
                    </div>

                    <Suspense fallback={<SkeletonGrid count={9} />}>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {courses?.content.map(course => (
                                <CourseCard key={course.id} course={course} />
                            ))}
                        </div>

                    </Suspense>
                </div>
            </Main>
        </>
    );
}

function SkeletonGrid({ count = 9 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton
                    key={i}
                    className="h-[200px] w-full rounded-xl"
                />
            ))}
        </div>
    )
}