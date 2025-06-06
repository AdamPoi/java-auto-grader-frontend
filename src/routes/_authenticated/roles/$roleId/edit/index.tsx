import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { RoleForm as RoleFormComponent } from '@/features/roles/components/role-form';
import { RoleApi } from '@/features/roles/data/api';
import { type RoleForm } from '@/features/roles/data/schema';
import { usePermission } from '@/features/roles/hooks/use-permission';
import { getQueryKey, useUpdateRole } from '@/features/roles/hooks/use-role';
import type { SearchRequestParams } from '@/types/api.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/roles/$roleId/edit/')({
  component: EditRolePage,
});

function EditRolePage() {
  const { roleId } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: role, isLoading: isLoadingRole } = useQuery({
    queryKey: ['role', roleId],
    queryFn: () => RoleApi.getRole(roleId),
    enabled: !!roleId,

  });

  const searchParams: SearchRequestParams = {
    page: 0,
    size: 1000,
    filter: "", // RHS colon filter
  };

  const { data: permissionsData, isLoading: isLoadingPermissions } = usePermission(searchParams);
  const permissions = permissionsData?.content || [];

  const updateRoleMutation = useUpdateRole()

  const onSubmit = (data: Omit<RoleForm, "id" | "createdAt" | "updatedAt">) => {
    updateRoleMutation.mutate({ roleId, roleData: data }, {
      onSuccess: () => {
        toast.success(`Role with Name ${data.name} updated successfully.`);
        navigate({ to: '/roles' });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to update role with Name ${data.name}: ${error.message}`);
      },
    });
  };

  return (
    <>
      <Header fixed>
        <div className='ml-auto flex items-center space-x-4'>
        </div>
      </Header>
      <Main>
        <div className='mb-4'>
          <h2 className='text-2xl font-bold tracking-tight'>Edit Role: {role?.name}</h2>
          <p className='text-muted-foreground'>
            Edit the details for the role and assign permissions.
          </p>
        </div>
        <div className='grid gap-4 py-4'>
          <RoleFormComponent
            initialData={role}
            onSubmit={onSubmit}
            mutation={updateRoleMutation}
            isLoadingPermissions={isLoadingPermissions}
            permissions={permissions}
          />
        </div>
      </Main>
    </>
  );
}
