import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { RoleForm as RoleFormComponent } from '@/features/roles/components/role-form';
import { type RoleForm } from '@/features/roles/data/schema';
import { usePermission } from '@/features/roles/hooks/use-permission';
import { useCreateRole } from '@/features/roles/hooks/use-role';
import { getQueryKey } from '@/features/users/hooks/use-user';
import { useAuthStore } from '@/stores/auth.store';
import type { SearchRequestParams } from '@/types/api.types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/roles/create/')({
  component: RoleFormPage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['ROLE:CREATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function RoleFormPage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const searchParams: SearchRequestParams = {
    page: 0,
    size: 1000,
    filter: "", // RHS colon filter
  };

  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermission(searchParams);
  const permissions = permissionsData?.content || [];

  const createRoleMutation = useCreateRole()

  const onSubmit = (data: RoleForm) => {
    createRoleMutation.mutate(data, {
      onSuccess: () => {
        toast.success(`Role with Name ${data.name} created successfully.`);
        navigate({ to: '/roles' });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to create role with Name ${data.name}: ${error.message}`);
      },
    });
  };

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
          {/* Add any header elements here if needed */}
        </div>
      </Header>
      <Main>
        <div className='mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>Create New Role</h2>
          <p className='text-muted-foreground'>
            Fill in the details for the new role and assign permissions.
          </p>
        </div>
        <div className='grid gap-4 py-4'>
          <RoleFormComponent
            onSubmit={onSubmit}
            mutation={createRoleMutation}
            isLoadingPermissions={isLoadingPermissions}
            permissions={permissions}
          />
        </div>
      </Main>
    </>
  );
}
