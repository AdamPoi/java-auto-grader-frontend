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
            starterCode: initialData.starterCode,
            solutionCode: initialData.solutionCode,
            totalPoints: initialData.totalPoints,
            courseId: initialData.course?.id,
            teacherId: initialData.createdByTeacher?.id,
            options: initialData.options,
        } : {
            id: '',
            title: '',
            description: '',
            resource: '',
            dueDate: '',
            starterCode: '',
            solutionCode: '',
            totalPoints: 0,
            courseId: courseId ?? undefined,
            teacherId: undefined,
            options: {
                isTimed: false,
                isPublished: false,
                showTrySubmission: true,
                showFeedback: true,
                showSolution: false,
                allowUpload: false,
                timeLimit: undefined,
                maxAttempts: undefined,
            },
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
                resource: initialData.resource,
                dueDate: initialData.dueDate || '',
                starterCode: initialData.starterCode,
                solutionCode: initialData.solutionCode,
                totalPoints: initialData.totalPoints,
                courseId: initialData.course?.id,
                teacherId: initialData.createdByTeacher?.id,
                options: initialData.options ?? {
                    isTimed: false,
                    showTrySubmission: true,
                    showFeedback: true,
                    showSolution: false,
                    allowUpload: false,
                    timeLimit: undefined,
                    maxAttempts: undefined,
                },
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

                <div className="w-full">
                    <fieldset className="border rounded-lg p-4 mb-4">
                        <legend className="font-semibold px-2">Assessment Options</legend>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField control={form.control} name="options.isTimed" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Timed Assessment</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="options.timeLimit" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Time Limit (minutes)</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            placeholder="e.g. 60"
                                            {...field}
                                            value={field.value ? Math.floor(field.value / 60) : ''}
                                            onChange={e => {
                                                const minutes = parseInt(e.target.value);
                                                field.onChange(isNaN(minutes) ? undefined : minutes * 60);
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="options.maxAttempts" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Max Attempts</FormLabel>
                                    <FormControl>
                                        <Input type="number" min={1} placeholder="e.g. 3" {...field}
                                            onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="options.showTrySubmission" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Show Try Submission</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="options.showFeedback" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Show Feedback After Submit</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="options.showSolution" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Show Solution After Submit</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="options.allowUpload" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Allow Code Upload</FormLabel>
                                    <FormControl>
                                        <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>
                    </fieldset>
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