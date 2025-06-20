import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import { handleServerErrors } from '@/lib/form-utils';
import type { UseMutationResult } from '@tanstack/react-query';
import { useParams, useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { rubricFormSchema } from '../data/schema';
import type { Rubric, RubricForm } from '../data/types';
import { useCreateRubric, useUpdateRubric } from '../hooks/use-rubric';

interface RubricFormProps {
    initialData?: Rubric;
    onSubmit?: (data: RubricForm) => void;
    mutation?: UseMutationResult<Rubric, Error, RubricForm, unknown>;
    rubric?: Rubric;
}

export function RubricForm({
    initialData,
    onSubmit,
}: RubricFormProps) {
    const router = useRouter();
    const createRubricMutation = useCreateRubric();
    const updateRubricMutation = useUpdateRubric();
    const { assignmentId } = useParams({ from: '/_authenticated/assignments/$assignmentId/' });
    const isEditMode = !!initialData;
    const mutation = isEditMode ? updateRubricMutation : createRubricMutation;
    const form = useForm<RubricForm>({
        resolver: zodResolver(rubricFormSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            description: initialData.description,
            points: initialData.points,
            assignmentId: initialData.assignmentId || assignmentId,
        } : {
            name: '',
            description: '',
            points: 0,
            assignmentId: assignmentId || '',
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                name: initialData.name,
                description: initialData.description,
                points: initialData.points,
                assignmentId: initialData.assignmentId || assignmentId,
            });
        }
    }, [initialData, form]);

    useEffect(() => {
        if (mutation.error) {
            handleServerErrors(mutation.error, form.setError);
        }
    }, [mutation.error, form.setError]);

    const handleFormSubmit = (data: RubricForm) => {
        if (isEditMode && initialData?.id) {
            updateRubricMutation.mutate({ rubricId: initialData.id, rubricData: data }, {
                onSuccess: () => {
                    toast.success(`Rubric with Name ${data.name} updated successfully.`);
                    // router.navigate({ to: `/assignments/${initialData.assignmentId}` });
                    onSubmit?.(data);
                },
                onError: (error) => {
                    toast.error(`Failed to update rubric with Name ${data.name}: ${error.message}`);
                },
            });
        } else {
            createRubricMutation.mutate(data, {
                onSuccess: () => {
                    toast.success(`Rubric with Name ${data.name} created successfully.`);
                    // router.navigate({ to: `/assignments/${assignmentId}` });
                    onSubmit?.(data);
                },
                onError: (error) => {
                    toast.error(`Failed to create rubric with Name ${data.name}: ${error.message}`);
                },
            });
        }
    };

    const handleFormError = (errors: any) => {
        console.error('Form validation errors:', errors);
        toast.error('Please fix the validation errors before submitting');

        const errorMessages = Object.entries(errors)
            .map(([field, error]: [string, any]) => `${field}: ${error.message}`)
            .join(', ');

        if (errorMessages) {
            console.error('Detailed errors:', errorMessages);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit, handleFormError)} className='grid gap-4'>
                {form.formState.errors.root && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
                        <p className="text-red-800 text-sm">
                            {form.formState.errors.root.message}
                        </p>
                    </div>
                )}

                <FormField control={form.control} name='name' render={({ field }) => (
                    <FormItem className='max-w-xs'>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                            <Input placeholder='Enter rubric name' {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                        <FormItem className='max-w-xs'>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Input placeholder='Enter description' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name='points'
                    render={({ field }) => (
                        <FormItem className='max-w-xs'>
                            <FormLabel>Max Points</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder='Enter max points' {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />


                {/* 
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
                /> */}

                <div className="flex justify-between items-center">
                    <div className="flex justify-start">
                        <Button type='button' variant='outline' onClick={() => onSubmit?.(form.getValues())}>
                            Back
                        </Button>
                    </div>
                    <div className="flex justify-end items-center gap-4" >
                        <Button type='button' variant='outline' onClick={() => {
                            form.reset();
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
                                    : 'Create Rubric'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}