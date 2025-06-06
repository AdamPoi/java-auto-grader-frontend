import { ConfirmDialog } from '@/components/confirm-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useState } from 'react';
import { Label } from 'recharts';
import { toast } from 'sonner';
import { getQueryKey, useDeleteRole } from '../hooks/use-role';
import { queryClient } from '@/lib/query-client';
import type { Role } from '../data/schema';

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    currentRow: Role
}

export function RoleDeleteDialog({ open, onOpenChange, currentRow }: Props) {
    const [value, setValue] = useState('')
    const { mutate: deleteRoleMutate, status } = useDeleteRole();
    const isDeleting = status === 'pending';

    const handleDelete = () => {
        if (value.trim() !== currentRow.name) {
            toast.error("Name does not match for deletion confirmation.");
            return;
        }

        deleteRoleMutate(currentRow?.id, {
            onSuccess: () => {
                toast.success(`Role with Name ${currentRow.name} deleted successfully.`);
                queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
                onOpenChange(false);
            },
            onError: (error) => {
                toast.error(`Failed to delete role with Name ${currentRow.name}: ${error.message}`);
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
                    Delete Role
                </span>
            }
            desc={
                <div className='space-y-4'>
                    <p className='mb-2'>
                        Are you sure you want to delete{' '}
                        <span className='font-bold'>{currentRow.name}</span>?
                        <br />
                        This action will permanently remove the role with the role(s) of{' '}
                        <span className='font-bold'>
                            {currentRow.name}
                        </span>{' '}
                        from the system. This cannot be undone.
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
