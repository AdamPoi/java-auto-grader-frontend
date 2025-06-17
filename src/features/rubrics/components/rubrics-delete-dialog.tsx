'use client'

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/query-client';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Rubric } from '../data/types';
import { getQueryKey, useDeleteRubric } from '../hooks/use-rubric';

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    rubric: Rubric
}

export function RubricsDeleteDialog({ open, onOpenChange, rubric }: Props) {
    const [value, setValue] = useState('')
    const { mutate: deleteRubricMutate, status } = useDeleteRubric();
    const isDeleting = status === 'pending';

    const handleDelete = () => {
        if (value.trim() !== rubric.name) {
            toast.error("Name does not match for deletion confirmation.");
            return;
        }

        deleteRubricMutate(rubric?.id, {
            onSuccess: () => {
                toast.success(`Rubric with Name ${rubric.name} deleted successfully.`);
                onOpenChange(false);
                queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
            },
            onError: (error) => {
                toast.error(`Failed to delete rubric with Name ${rubric.name}: ${error.message}`);
            },
        });
    }


    return (
        <ConfirmDialog
            open={open}
            onOpenChange={onOpenChange}
            handleConfirm={handleDelete}
            disabled={value.trim() !== rubric.name || isDeleting}
            title={
                <span className='text-destructive'>
                    <IconAlertTriangle
                        className='stroke-destructive mr-1 inline-block'
                        size={18}
                    />{' '}
                    Delete Rubric
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to delete{' '}
                        <span className='font-bold'>{rubric.name}</span>?
                        <br />
                        This action will permanently remove the rubric. This cannot be undone.
                    </p>

                    <Label className='my-2'>
                        Name:
                        <Input
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder='Enter name to confirm deletion.'
                        />
                    </Label>

                    <Alert variant='destructive'>
                        <AlertTitle>Warning!</AlertTitle>
                        <AlertDescription>
                            Please be carefull, this operation can not be rolled back.
                        </AlertDescription>
                    </Alert>
                </div>
            }
            confirmText={isDeleting ? 'Deleting...' : 'Delete'}
            destructive
        />
    )
}