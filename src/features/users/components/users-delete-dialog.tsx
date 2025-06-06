'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { queryClient } from '@/lib/query-client'
import { IconAlertTriangle } from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { type User } from '../data/schema'
import { getQueryKey, useDeleteUser } from '../hooks/use-user'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersDeleteDialog({ open, onOpenChange, currentRow }: Props) {
  const [value, setValue] = useState('')
  const { mutate: deleteUserMutate, status } = useDeleteUser();
  const isDeleting = status === 'pending';

  const handleDelete = () => {
    if (value.trim() !== currentRow.email) {
      toast.error("Email does not match for deletion confirmation.");
      return;
    }

    deleteUserMutate(currentRow.id, {
      onSuccess: () => {
        toast.success(`User with Email ${currentRow.email} deleted successfully.`);
        onOpenChange(false);
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });

      },
      onError: (error) => {
        toast.error(`Failed to delete user with Email ${currentRow.email}: ${error.message}`);
      },
    });
  }


  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={value.trim() !== currentRow.email || isDeleting}
      title={
        <span className='text-destructive'>
          <IconAlertTriangle
            className='stroke-destructive mr-1 inline-block'
            size={18}
          />{' '}
          Delete User
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p className='mb-2'>
            Are you sure you want to delete{' '}
            <span className='font-bold'>{currentRow.email}</span>?
            <br />
            This action will permanently remove the user with the role(s) of{' '}
            <span className='font-bold'>
              {currentRow.roles.join(', ').toUpperCase()}
            </span>{' '}
            from the system. This cannot be undone.
          </p>

          <Label className='my-2'>
            Email:
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter email to confirm deletion.'
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
