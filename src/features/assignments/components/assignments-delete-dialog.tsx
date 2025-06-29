'use client'

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { queryClient } from '@/lib/query-client';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Assignment } from '../data/types';
import { getQueryKey, useDeleteAssignment } from '../hooks/use-assignment';

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Assignment
}

export function AssignmentsDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { mutate: deleteAssignmentMutate, status } = useDeleteAssignment();
  const isDeleting = status === 'pending';

  const handleDelete = () => {
    if (value.trim() !== currentRow.title) {
      toast.error("Name does not match for deletion confirmation.");
      return;
    }

    deleteAssignmentMutate(currentRow?.id, {
      onSuccess: () => {
        toast.success(`Assignment with Name ${currentRow.title} deleted successfully.`);
        onOpenChange(false);
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to delete assignment with Name ${currentRow.title}: ${error.message}`);
      },
    });
  }


  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.title || isDeleting}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          Delete Assignment
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.title}</span>?
            <br />
            This action will permanently remove the assignment. This cannot be undone.
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