import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/features/users/data/types';
import { useUsersList } from '@/features/users/hooks/use-user';
import { handleServerErrors } from '@/lib/form-utils';
import { debounce } from '@tanstack/pacer';
import type { UseMutationResult } from '@tanstack/react-query';
import { useRouter, useSearch } from '@tanstack/react-router';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { assignmentFormSchema } from '../data/schema';
import type { Assignment, AssignmentForm } from '../data/types';
import { useCreateAssignment, useUpdateAssignment } from '../hooks/use-assignment';

interface AssignmentsFormProps {
    initialData?: Assignment;
    onSubmit?: (data: AssignmentForm) => void;
    onSuccess?: () => void;
    onCancel?: () => void;
    mutation?: UseMutationResult<Assignment, Error, AssignmentForm, unknown>;
    withFooter?: boolean;
}


export function AssignmentsForm({
    initialData,
    onSubmit,
    onSuccess,
    onCancel,
    withFooter = true,
}: AssignmentsFormProps) {
    const createAssignmentMutation = useCreateAssignment();
    const updateAssignmentMutation = useUpdateAssignment();
    const router = useRouter()
    const searchParams = useSearch({
        strict: false,
    }) as { courseId: string };;
    const courseId = searchParams.courseId;

    const isEditMode = !!initialData;
    const mutation = isEditMode ? updateAssignmentMutation : createAssignmentMutation;

    const form = useForm<AssignmentForm>({
        resolver: zodResolver(assignmentFormSchema),
        defaultValues: initialData ? {
            id: initialData.id,
            title: initialData.title,
            description: initialData.description,
            resource: initialData.resource,
            dueDate: initialData.dueDate || '',
            isPublished: initialData.isPublished || false,
            starterCode: initialData.starterCode,
            solutionCode: initialData.solutionCode,
            timeLimit: initialData.timeLimit,
            totalPoints: initialData.totalPoints,
            courseId: initialData.course?.id,
            teacherId: initialData.createdByTeacher?.id,
        } : {
            id: '',
            title: '',
            description: '',
            resource: '',
            dueDate: '',
            isPublished: false,
            starterCode: '',
            solutionCode: '',
            timeLimit: undefined,
            totalPoints: 0,
            courseId: courseId ?? undefined,
            teacherId: undefined,
        },
    });


    const [searchFilter, setSearchFilter] = useState<string>("");

    const [teacherSearchTerm, setTeacherSearchTerm] = useState<string>("");

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
    const getFilteredTeachers = (searchTerm: string = "") => {
        if (!searchTerm.trim()) return teachers;
        return teachers.filter(teacher =>
            `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };
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


    const teacherOptions = getFilteredTeachers(teacherSearchTerm).map((teacher: User) => ({
        label: `${teacher.firstName} ${teacher.lastName}`,
        value: teacher.id,
    }));

    useEffect(() => {
        if (initialData) {
            form.reset({
                id: initialData.id,
                title: initialData.title,
                description: initialData.description,
                dueDate: initialData.dueDate || '',
                isPublished: initialData.isPublished || false,
                starterCode: initialData.starterCode,
                solutionCode: initialData.solutionCode,
                timeLimit: initialData.timeLimit,
                totalPoints: initialData.totalPoints,
                courseId: initialData.course?.id,
                teacherId: initialData.createdByTeacher?.id,
            });
        }
    }, [initialData, form]);

    const handleFormSubmit = (data: AssignmentForm) => {
        if (onSubmit) {
            onSubmit(data);
            return;
        }

        if (isEditMode && initialData?.id) {
            updateAssignmentMutation.mutate({ assignmentId: initialData.id, assignmentData: data }, {
                onSuccess: () => {
                    toast.success(`Assignment "${data.title}" updated successfully.`);
                    onSuccess?.();
                },
                onError: (error) => {
                    toast.error(`Failed to update assignment "${data.title}": ${error.message}`);
                },
            });
        } else {
            createAssignmentMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(`Assignment "${data.title}" created successfully.`);
                    onSuccess?.();
                },
                onError: (error) => {
                    toast.error(`Failed to create assignment "${data.title}": ${error.message}`);
                },
            });
        }
    };

    const handleFormError = (errors: any) => {
        console.error('Form validation errors:', errors);
        toast.error('Please fix the validation errors before submitting');
        handleServerErrors(errors, form.setError);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className='space-y-6'>
                {form.formState.errors.root && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <p className="text-red-800 text-sm">
                            {form.formState.errors.root.message}
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name='title' render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input placeholder='Enter assignment title' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField
                        control={form.control}
                        name='teacherId'
                        render={({ field }) => (
                            <FormItem>
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

                    <FormField control={form.control} name='dueDate' render={({ field }) => (
                        <FormItem>
                            <FormLabel>Due Date</FormLabel>
                            <FormControl>
                                <Input
                                    type="datetime-local"
                                    {...field}
                                    value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const date = new Date(e.target.value);
                                            field.onChange(date.toISOString());
                                        } else {
                                            field.onChange('');
                                        }
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name='totalPoints' render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Points</FormLabel>
                            <FormControl>
                                <Input type='number' placeholder='Enter total points' {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />



                    <FormField control={form.control} name='timeLimit' render={({ field }) => (
                        <FormItem>
                            <FormLabel>Time Limit (seconds)</FormLabel>
                            <FormControl>
                                <Input type='number' placeholder='Enter time limit in seconds' {...field}
                                    onChange={e => field.onChange(parseInt(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name='description' render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder='Enter assignment description' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name='resource' render={({ field }) => (
                        <FormItem>
                            <FormLabel>Resource</FormLabel>
                            <FormControl>
                                <Textarea placeholder='Enter assignment resource' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name='starterCode' render={({ field }) => (
                        <FormItem>
                            <FormLabel>Starter Code</FormLabel>
                            <FormControl>
                                <Textarea placeholder='Enter starter code' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField control={form.control} name='solutionCode' render={({ field }) => (
                        <FormItem>
                            <FormLabel>Solution Code</FormLabel>
                            <FormControl>
                                <Textarea placeholder='Enter solution code' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>

                <div className="max-w-lg">
                    <FormField control={form.control} name='isPublished' render={({ field }) => (
                        <FormItem>
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">Publish Assignment</FormLabel>
                                <FormMessage />
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )} />
                </div>

                {withFooter && <div className="flex justify-between">
                    <div className="flex justify-start">
                        <Button type='button' variant='outline' onClick={() => router.history.back()}>
                            Back
                        </Button>
                    </div>
                    <div className="flex justify-end items-center mt-4 gap-4">
                        {onCancel && (
                            <Button type='button' variant='outline' onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button type='submit' disabled={mutation.status === 'pending'}>
                            {mutation.status === 'pending'
                                ? isEditMode
                                    ? 'Saving...'
                                    : 'Creating...'
                                : isEditMode
                                    ? 'Save Changes'
                                    : 'Create Assignment'}
                        </Button>
                    </div>
                </div>}
            </form>
        </Form>
    );
}