import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import CodeEditor from '@/features/code-editor';
import type { FileData } from '@/features/code-editor/hooks/use-file-management';
import type { Submission } from '@/features/submissions/data/types';
import { useCreateSubmission } from '@/features/submissions/hooks/use-submission';
import { useUsersList } from '@/features/users/hooks/use-user';
import { ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { debounce } from "@tanstack/pacer";
import React, { useState } from 'react';
import TestButton from './test-button';

interface TryOutSubmissionItemProps {
    submission?: Submission;
    isNew?: boolean;
    assignmentId?: string;
    onTestSubmission?: (id: string, submissionCodes: FileData[]) => void;
    onCodeChange?: (id: string, files: FileData[]) => void;
    onDeleteSubmission?: (id: string) => void;
    onStudentChange?: (studentId: string) => void;
    onRefetch?: () => void;
}

const TryOutSubmissionItem: React.FC<TryOutSubmissionItemProps> = ({
    submission,
    isNew = false,
    assignmentId,
    onTestSubmission,
    onCodeChange,
    onDeleteSubmission,
    onStudentChange,
    onRefetch
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
    const [studentFilter, setStudentFilter] = useState<string>('roles=student');
    const [selectedStudentId, setSelectedStudentId] = useState<string>('');
    const [currentFiles, setCurrentFiles] = useState<FileData[]>([]);
    const [localStudentId, setLocalStudentId] = useState<string>(submission?.studentId || '');
    const lastStudentIdRef = React.useRef<string>(submission?.studentId || '');

    const createSubmissionMutation = useCreateSubmission();
    const { data: studentsData, isLoading: isLoadingStudents } = useUsersList({
        page: 0,
        size: 1000,
        filter: studentFilter
    });

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
        if (!submission?.id) return;

        const fileData: FileData[] = submission.submissionCodes?.map(code => ({
            fileName: code.fileName,
            content: code.sourceCode,
        })) || [];
        onTestSubmission?.(submission.id, fileData);
    };

    const handleFileChange = (files: FileData[]) => {
        if (!submission?.id) return;


        onCodeChange?.(submission.id, files);
    };

    const initialFilesData: FileData[] = submission?.submissionCodes?.map(code => ({
        fileName: code.fileName,
        content: code.sourceCode,
    })) || [];
    const handleSubmitNew = () => {
        if (!assignmentId || currentFiles.length === 0) {
            return;
        }

        const submissionData = {
            submissionCodes: currentFiles.map(file => ({
                fileName: file.fileName,
                sourceCode: file.content,
            })),
            status: 'pending',
            assignmentId,
            studentId: selectedStudentId || undefined,
        };

        createSubmissionMutation.mutate(submissionData, {
            onSuccess: () => {
                onRefetch?.();
                // Reset form
                setCurrentFiles([]);
                setSelectedStudentId('');
                setIsOpen(false);
            },
            onError: (error) => {
                console.error('Failed to create submission:', error);
            }
        });
    };

    const handleNewFileChange = (files: FileData[]) => {
        setCurrentFiles(files);
    };
    React.useEffect(() => {
        if (submission?.studentId !== lastStudentIdRef.current) {
            setLocalStudentId(submission?.studentId || '');
            lastStudentIdRef.current = submission?.studentId || '';
        }
    }, [submission?.studentId]);
    const handleExistingStudentChange = (value: string | undefined) => {
        const newValue = value || '';
        // Only call onStudentChange if the value actually changed
        if (newValue !== lastStudentIdRef.current) {
            setLocalStudentId(newValue);
            lastStudentIdRef.current = newValue;
            onStudentChange?.(newValue);
        }
    };

    if (isNew) {
        return (
            <Collapsible
                open={isOpen}
                onOpenChange={(open) => setIsOpen(open)}
                className="w-full space-y-2 border-2 border-dashed border-blue-300 rounded-md p-4 bg-blue-50"
            >
                <div className="flex items-center justify-between space-x-4 px-4">
                    <h4 className="text-sm font-semibold text-blue-700">
                        Create New Submission
                    </h4>
                    <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <IconPlus className="h-4 w-4" />
                            {isOpen ? <ChevronDownIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}
                            <span className="sr-only">Toggle</span>
                        </Button>
                    </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-2">
                    {/* Student selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assign Student (Optional)</label>
                        <SearchableSelect
                            value={selectedStudentId}
                            onChange={(value) => setSelectedStudentId(value || '')}
                            items={studentOptions}
                            placeholder="Select a student"
                            disabled={isLoadingStudents}
                            allowClear={true}
                            onSearch={handleStudentSearch}
                        />
                    </div>

                    <div className="border rounded-md p-2">
                        <CodeEditor
                            initialFilesData={[]}
                            onFileChange={handleNewFileChange}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => setIsOpen(false)}
                            variant="outline"
                            size="sm"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmitNew}
                            disabled={currentFiles.length === 0 || createSubmissionMutation.isPending}
                            size="sm"
                        >
                            {createSubmissionMutation.isPending ? 'Submitting...' : 'Submit'}
                        </Button>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        );
    }

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={(open) => setIsOpen(open)}
            className="w-full space-y-2 border rounded-md p-4"
        >
            <div className="flex items-center justify-between space-x-4 px-4">
                <h4 className="text-sm font-semibold">
                    Submission ID: {submission?.id.substring(0, 8)}... - Status: {submission?.status}
                </h4>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (submission?.id) {
                                onDeleteSubmission?.(submission.id);
                            }
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
                        value={localStudentId}
                        onChange={handleExistingStudentChange}
                        items={studentOptions}
                        placeholder="Select a student"
                        disabled={isLoadingStudents}
                        allowClear={true}
                        onSearch={handleStudentSearch}
                    />
                </div>


                <div className="border rounded-md p-2">
                    <CodeEditor
                        initialFilesData={initialFilesData}
                        onFileChange={handleFileChange}
                    />
                </div>
                <TestButton onClick={handleTestClick} disabled={submission?.status === 'testing'} />
            </CollapsibleContent>
        </Collapsible>
    );
};

export default TryOutSubmissionItem;