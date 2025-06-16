import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import type { SearchRequestParams } from '@/types/api.types'
import { type SortingState } from '@tanstack/react-table'
import { useEffect, useState } from 'react'
import { columns } from './components/courses-columns'
import { CoursesDialogs } from './components/courses-dialogs'
import { CoursesPrimaryButtons } from './components/courses-primary-buttons'
import { CoursesTable } from './components/courses-table'
import CoursesProvider from './context/courses-context'
import { useCourse } from './hooks/use-course'


export default function courses() {
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [sorting, setSorting] = useState<SortingState>([]);
    const [filter, setFilter] = useState<string | undefined>(undefined);

    const [searchValue, setSearchValue] = useState('');
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

    useEffect(() => {
        const filters: string[] = [];
        if (debouncedSearchValue) {
            filters.push(`search=like:${debouncedSearchValue}`);
        }
        if (sorting.length > 0) {
            const sort = sorting[0];
            const sortString = `sort=${sort.desc ? '-' : '+'}${sort.id}`;
            filters.push(sortString);
        }
        setFilter(filters.length > 0 ? filters.join('&') : undefined);

        const url = new URL(window.location.href);
        if (filters.length > 0) {
            url.searchParams.set('filter', filters.join('&'));
        } else {
            url.searchParams.delete('filter');
        }
        window.history.replaceState({}, '', url.toString());

    }, [debouncedSearchValue, sorting]);


    const searchParams: SearchRequestParams = {
        page: pagination.pageIndex,
        size: pagination.pageSize,
        filter: filter,
    };

    const { data, isLoading } = useCourse(searchParams);

    const content = data?.content || [];
    const totalRowCount = data?.totalElements || 0;

    return (
        <CoursesProvider>
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
                            Manage your courses here.
                        </p>
                    </div>
                    <CoursesPrimaryButtons />
                </div>
                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-y-0 lg:space-x-12'>
                    <CoursesTable
                        columns={columns}
                        data={content}
                        isLoading={isLoading}
                        pagination={pagination}
                        setPagination={setPagination}
                        sorting={sorting}
                        setSorting={setSorting}
                        searchValue={searchValue}
                        setSearchValue={setSearchValue}
                        totalRowCount={totalRowCount}
                    />
                </div>
            </Main>
            <CoursesDialogs />
        </CoursesProvider>
    )
}