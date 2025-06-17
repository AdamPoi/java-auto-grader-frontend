import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { DataTable } from '@/components/data-table';
import { MultiSelect } from '@/components/multi-select';
import { SearchableSelect } from '@/components/searchable-select';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { classroomFormSchema } from '@/features/classrooms/data/schema';
import { type User } from '@/features/users/data/types';
import { handleServerErrors } from '@/lib/form-utils';
import { debounce } from '@tanstack/pacer';
import { useRouter } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { Classroom, ClassroomForm } from '../data/types';
import { useCreateClassroom, useUpdateClassroom } from '../hooks/use-classroom';
import { createStudentColumns } from './student-columns';
import { useUsersList } from '@/features/users/hooks/use-user';

interface ClassroomFormProps {
    initialData?: Classroom;
    onSubmit: (data: ClassroomForm) => void;
}


export function ClassroomForm({
    initialData,
}: ClassroomFormProps) {
    const router = useRouter();
    const createClassroomMutation = useCreateClassroom();
    const updateClassroomMutation = useUpdateClassroom();

    const isEditMode = !!initialData;
    const mutation = isEditMode ? updateClassroomMutation : createClassroomMutation;
    const form = useForm<ClassroomForm>({
        resolver: zodResolver(classroomFormSchema),
        defaultValues: initialData ? {
            id: initialData.id,
            name: initialData.name,
            teacherId: initialData.teacher?.id,
            studentIds: initialData.students?.map(students => students.id) || [],
            isActive: initialData.isActive
        } : {
            id: '',
            name: '',
            teacherId: undefined,
            studentIds: undefined,
            isActive: true,
        }
    });

    const [searchFilter, setSearchFilter] = useState<string>("");
    const [teacherSearchTerm, setTeacherSearchTerm] = useState<string>("");
    const [studentSearchTerm, setStudentSearchTerm] = useState<string>("");

    const buildFilter = (searchTerm: string = "") => {
        const baseFilter = "roles=in:teacher,student";
        if (searchTerm.trim()) {
            return `${baseFilter}&search=like:${encodeURIComponent(searchTerm)}`;
        }
        return baseFilter;
    };

    const { data: usersData, isLoading: isLoadingUsers } = useUsersList({
        page: 0,
        size: 1000,
        filter: buildFilter(searchFilter)
    });


    const teachers = usersData?.content?.filter((user: User) => user.roles.includes('teacher')) || [];
    const students = usersData?.content?.filter((user: User) => user.roles.includes('student')) || [];

    const getFilteredTeachers = (searchTerm: string = "") => {
        if (!searchTerm.trim()) return teachers;
        return teachers.filter(teacher =>
            `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const getFilteredStudents = (searchTerm: string = "") => {
        if (!searchTerm.trim()) return students;
        return students.filter(student =>
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    const teacherOptions = getFilteredTeachers(teacherSearchTerm).map((teacher: User) => ({
        label: `${teacher.firstName} ${teacher.lastName}`,
        value: teacher.id,
    }));

    const studentOptions = getFilteredStudents(studentSearchTerm).map((student: User) => ({
        label: `${student.firstName} ${student.lastName}`,
        value: student.id,
    }));

    const debouncedUpdateFilter = useCallback(
        debounce((searchTerm: string) => {
            setSearchFilter(searchTerm);
        }, { wait: 500 }),
        []
    );

    const handleTeacherSearch = useCallback((searchTerm: string) => {
        setTeacherSearchTerm(searchTerm);

        if (!searchTerm.trim()) {
            setSearchFilter("");
            return;
        }

        const localMatches = getFilteredTeachers(searchTerm);
        if (localMatches.length > 0) {
            setSearchFilter("");
            return;
        }

        if (!isLoadingUsers) {
            debouncedUpdateFilter(searchTerm);
        }
    }, [isLoadingUsers, debouncedUpdateFilter]);

    const handleStudentSearch = useCallback((searchTerm: string) => {
        setStudentSearchTerm(searchTerm);

        if (!searchTerm.trim()) {
            setSearchFilter("");
            return;
        }

        const localMatches = getFilteredStudents(searchTerm);
        if (localMatches.length > 0) {
            setSearchFilter("");
            return;
        }

        if (!isLoadingUsers) {
            debouncedUpdateFilter(searchTerm);
        }
    }, [isLoadingUsers, debouncedUpdateFilter]);
    const [selectedStudents, setSelectedStudents] = useState<User[]>(
        initialData?.students || []
    );
    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const handleAddStudents = (studentIds: string[]) => {
        const studentsToAdd = students.filter(student =>
            studentIds.includes(student.id) &&
            !selectedStudents.some(existing => existing.id === student.id)
        );

        const updatedStudents = [...selectedStudents, ...studentsToAdd];
        setSelectedStudents(updatedStudents);

        form.setValue('studentIds', updatedStudents.map(student => student.id));
    };

    const handleRemoveStudent = (studentId: string) => {
        const updatedStudents = selectedStudents.filter(student => student.id !== studentId);
        setSelectedStudents(updatedStudents);
        form.setValue('studentIds', updatedStudents.map(student => student.id));

        const newRowSelection = { ...rowSelection };
        const studentIndex = selectedStudents.findIndex(s => s.id === studentId);
        if (studentIndex !== -1) {
            delete newRowSelection[studentIndex];
            setRowSelection(newRowSelection);
        }
    };

    const handleBulkDelete = () => {
        const selectedIndexes = Object.keys(rowSelection).filter(key => rowSelection[key]);
        const studentsToRemove = selectedIndexes.map(index => selectedStudents[parseInt(index)].id);

        const updatedStudents = selectedStudents.filter(student =>
            !studentsToRemove.includes(student.id)
        );

        setSelectedStudents(updatedStudents);
        form.setValue('studentIds', updatedStudents.map(student => student.id));
        setRowSelection({});
    };

    const selectedCount = Object.values(rowSelection).filter(Boolean).length;


    useEffect(() => {
        if (initialData) {
            form.reset({
                id: initialData.id,
                name: initialData.name,
                teacherId: initialData.teacher?.id,
                studentIds: initialData.students?.map(student => student.id) || [],
                isActive: initialData.isActive
            });
            setSelectedStudents(initialData.students || []);
        }
    }, [initialData, form]);

    useEffect(() => {
        if (mutation.error) {
            handleServerErrors(mutation.error, form.setError);
        }
    }, [mutation.error, form.setError]);

    const handleFormSubmit = (data: ClassroomForm) => {
        if (isEditMode && initialData?.id) {
            updateClassroomMutation.mutate({ classroomId: initialData.id, classroomData: data }, {
                onSuccess: () => {
                    toast.success(`Classroom with Name ${data.name} updated successfully.`);
                    router.navigate({ to: '/classrooms' });
                },
                onError: (error) => {
                    toast.error(`Failed to update classroom with Name ${data.name}: ${error.message}`);
                },
            });
        } else {
            createClassroomMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(`Classroom with Name ${data.name} created successfully.`);
                    router.navigate({ to: '/classrooms' });
                },
                onError: (error) => {
                    toast.error(`Failed to create classroom with Name ${data.name}: ${error.message}`);
                },
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className='grid gap-4'>
                <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                        <FormItem className='max-w-xs'>
                            <FormLabel>Classroom Name</FormLabel>
                            <FormControl>
                                <Input placeholder='Enter classroom name' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='teacherId'
                    render={({ field }) => (
                        <FormItem className='max-w-xs'>
                            <FormLabel>Teacher</FormLabel>
                            <FormControl>
                                <SearchableSelect
                                    value={field.value || undefined}
                                    onChange={field.onChange}
                                    items={teacherOptions}
                                    placeholder='Select a teacher'
                                    disabled={isLoadingUsers}
                                    allowClear={true}
                                    onSearch={handleTeacherSearch}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='studentIds'
                    render={() => (
                        <FormItem>
                            <FormLabel>Add Students</FormLabel>
                            <FormControl>
                                <MultiSelect
                                    value={[]}
                                    onChange={handleAddStudents}
                                    items={studentOptions.filter(option =>
                                        !selectedStudents.some(student => student.id === option.value)
                                    )}
                                    placeholder='Select students to add'
                                    className='w-full'
                                    onSearch={handleStudentSearch}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='isActive'
                    render={({ field }) => (
                        <FormItem className='max-w-xs'>
                            <FormLabel>Active</FormLabel>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    value={field.value?.toString()}
                                    disabled={field.disabled}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Students Table */}
                <div className='mt-4'>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className='text-lg font-semibold'>
                            Selected Students ({selectedStudents.length})
                        </h3>
                        {selectedCount > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">
                                    {selectedCount} selected
                                </span>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleBulkDelete}
                                    className="h-8 px-3"
                                >
                                    Remove Selected ({selectedCount})
                                </Button>
                            </div>
                        )}
                    </div>

                    {selectedStudents.length > 0 ? (
                        <DataTable
                            columns={createStudentColumns({ onRemoveStudent: handleRemoveStudent })}
                            data={selectedStudents}
                            state={{
                                rowSelection,
                            }}
                            onRowSelectionChange={setRowSelection}

                        />
                    ) : (
                        <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center">
                            <p className="text-gray-500 italic">No students selected</p>
                            <p className="text-sm text-gray-400 mt-1">Use the dropdown above to add students</p>
                        </div>
                    )}
                </div>


                <div className="flex justify-between">
                    <div className="flex justify-start">
                        <Button type='button' variant='outline' onClick={() => router.history.back()}>
                            Back
                        </Button>
                    </div>
                    <div className="flex justify-end items-center mt-4 gap-4" >
                        <Button type='button' variant='outline' onClick={() => {
                            form.reset();
                            setSelectedStudents(initialData?.students || []);
                            setRowSelection({});
                        }}>
                            Reset
                        </Button>
                        <Button type='submit' disabled={mutation.status === 'pending'}>
                            {mutation.status === 'pending'
                                ? initialData
                                    ? 'Saving...'
                                    : 'Creating...'
                                : initialData
                                    ? 'Save Changes'
                                    : 'Create Classroom'}
                        </Button>
                    </div>
                </div>

            </form>
        </Form >
    );
}