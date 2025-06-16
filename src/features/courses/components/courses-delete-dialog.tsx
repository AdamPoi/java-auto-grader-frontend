'use client'

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/query-client';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Course } from '../data/types';
import { getQueryKey, useDeleteCourse } from '../hooks/use-course';

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Course
}

export function CourseDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { mutate: deleteCourseMutate, status } = useDeleteCourse();
  const isDeleting = status === 'pending';

  const handleDelete = () => {
    if (value.trim() !== currentRow.name) {
      toast.error("Name does not match for deletion confirmation.");
      return;
    }

    deleteCourseMutate(currentRow?.id, {
      onSuccess: () => {
        toast.success(`Course with Name ${currentRow.name} deleted successfully.`);
        onOpenChange(false);
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to delete course with Name ${currentRow.name}: ${error.message}`);
      },
    });
  }


  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.name || isDeleting}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          Delete Course
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.name}</span>?
            <br />
            This action will permanently remove the course. This cannot be undone.
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