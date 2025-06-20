import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CodeEditor from '@/features/code-editor';
import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import { useUsersList } from '@/features/users/hooks/use-user';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { IconTrash } from '@tabler/icons-react';
import { debounce } from "@tanstack/pacer";
import React, { useState } from 'react';
import type { TryOutSubmission } from '../data/types';
import TestButton from './test-button';

interface TryOutSubmissionItemProps {
    submission: TryOutSubmission;
    onTestSubmission: (id: string, submissionCodes: FileData[]) => void;
    onCodeChange: (id: string, files: FileData[]) => void;
    onDeleteSubmission?: (id: string) => void;
    onStudentChange?: (studentId: string) => void;
}

const TryOutSubmissionItem: React.FC<TryOutSubmissionItemProps> = ({
    submission,
    onTestSubmission,
    onCodeChange,
    onDeleteSubmission,
    onStudentChange
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
    const [studentFilter, setStudentFilter] = useState<string>('roles=student');

    // Fetch students using existing hook
    const { data: studentsData, isLoading: isLoadingStudents } = useUsersList({
        page: 0,
        size: 1000,
        filter: studentFilter
    });

    // Build student options for SearchableSelect
    const studentOptions = studentsData?.content
        ?.filter((user) => user.roles.includes('student'))
        .map((student) => ({
            label: `${student.firstName} ${student.lastName}`,
            value: student.id,
        })) || [];

    // Handle student search with debounce
    const debouncedSetStudentFilter = React.useCallback(
        debounce((searchTerm: string) => {
            setStudentFilter(`roles=student${searchTerm ? `&search=like:${encodeURIComponent(searchTerm)}` : ''}`);
        }, { wait: 500 }),
        []
    );

    const handleStudentSearch = (searchTerm: string) => {
        setStudentSearchTerm(searchTerm);
        debouncedSetStudentFilter(searchTerm);
    };

    const handleTestClick = () => {
        onTestSubmission(submission.id, submission.submissionCodes);
    };

    const handleFileChange = (files: FileData[]) => {
        onCodeChange(submission.id, files);
    };

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
            className="w-full space-y-2 border rounded-md p-4"
        >
            <div className="flex items-center justify-between space-x-4 px-4">
                <h4 className="text-sm font-semibold">
                    Submission ID: {submission.id.substring(0, 8)}... - Status: {submission.status}
                </h4>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSubmission?.(submission.id);
                        }}
                        title="Delete submission"
                    >
                        <IconTrash className='h-4 w-4 text-red-500' />
                    </Button>

                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            {isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
            </div>
            <CollapsibleContent className="space-y-2">
                {/* Student selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assign Student</label>
                    <SearchableSelect
                        value={submission.studentId}
                        onChange={onStudentChange}
                        items={studentOptions}
                        placeholder="Select a student"
                        disabled={isLoadingStudents}
                        allowClear={true}
                        onSearch={handleStudentSearch}
                    />
                </div>

                <div className="border rounded-md p-2">
                    <CodeEditor
                        initialFilesData={submission.submissionCodes}
                        onFileChange={handleFileChange}
                    />
                </div>
                <TestButton onClick={handleTestClick} disabled={submission.status === 'testing'} />
            </CollapsibleContent>
        </Collapsible>
    );
};

export default TryOutSubmissionItem;