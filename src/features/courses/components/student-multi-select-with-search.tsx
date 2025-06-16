import { MultiSelect } from '@/components/multi-select';
import { Input } from '@/components/ui/input';
import { type User } from '@/features/users/data/types';
import { useUsersContext } from '@/features/users/hooks/use-user';
import useDebounce from '@/hooks/use-debounce';
import React, { useEffect, useState } from 'react';

interface StudentMultiSelectWithSearchProps {
    value: string[];
    onChange: (value: string[]) => void;
}

const StudentMultiSelectWithSearch: React.FC<StudentMultiSelectWithSearchProps> = ({ value, onChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const filter = debouncedSearchTerm
        ? `role:student AND (firstName:*${debouncedSearchTerm}* OR lastName:*${debouncedSearchTerm}* OR email:*${debouncedSearchTerm}*)`
        : 'role:student';

    const { data: studentsData, isLoading: isLoadingStudents, refetch } = useUsersContext({
        page: 0,
        size: 1000,
        filter: filter,
    });

    useEffect(() => {
        refetch();
    }, [debouncedSearchTerm, refetch]);

    const studentOptions = studentsData?.content?.map((student: User) => ({
        label: `${student.firstName} ${student.lastName} (${student.email})`,
        value: student.id,
    })) || [];

    return (
        <div className="space-y-2">
            <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
            />
            <MultiSelect
                value={value}
                onChange={onChange}
                items={studentOptions}
                placeholder={isLoadingStudents ? 'Loading students...' : 'Select students'}
                className='w-full'
            />
        </div>
    );
};

export default StudentMultiSelectWithSearch;