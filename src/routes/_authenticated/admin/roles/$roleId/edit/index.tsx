import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { ProfileDropdown } from '@/components/profile-dropdown';
import { ThemeSwitch } from '@/components/theme-switch';
import { Button } from '@/components/ui/button';
import { RoleForm as RoleFormComponent } from '@/features/roles/components/role-form';
import { RoleApi } from '@/features/roles/data/api';
import { type RoleForm } from '@/features/roles/data/schema';
import { usePermission } from '@/features/roles/hooks/use-permission';
import { getQueryKey, useUpdateRole } from '@/features/roles/hooks/use-role';
import { useAuthStore } from '@/stores/auth.store';
import type { SearchRequestParams } from '@/types/api.types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/roles/$roleId/edit/')({
  component: EditRolePage,
  beforeLoad: async () => {
    const { auth } = await useAuthStore.getState()

    if (!auth.hasPermission(['ROLE:UPDATE'])) {
      throw redirect({
        to: '/403',
      })
    }

  }
});

function EditRolePage() {
  const { roleId } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const router = useRouter();

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
        navigate({ to: '/admin/roles' });
        queryClient.refetchQueries({ queryKey: getQueryKey({ action: 'list' }) });
      },
      onError: (error) => {
        toast.error(`Failed to update role with Name ${data.name}: ${error.message}`);
      },
    });
  };

  return (
    <>
      {/* Header Menu */}
      <Header fixed>
        <Search />
        <div className='ml-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>
      <Main>
        {/* Header Page */}
        <div className='flex flex-col gap-2'>
          <Button variant="outline" size="icon" className='w-fit p-2' onClick={() => router.history.back()}>
            <ArrowLeft className="h-4 w-4" /> <span>Back</span>
          </Button>
          <div className="flex justify-between items-center">
            <div className='mb-4'>
              <h2 className='text-2xl font-bold tracking-tight'>Edit Role: {role?.name}</h2>
              <p className='text-muted-foreground'>
                Edit the details for the role and assign permissions.
              </p>
            </div>
          </div>
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
