import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { IconShieldPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

export function RolesPrimaryButtons() {
  const navigate = useNavigate();

  const handleAddRoleClick = () => {
    navigate({ to: '/admin/roles/create' });
  };
  const { auth } = useAuthStore()

  return (
    <div className='flex gap-2'>

      {auth.hasPermission(['ROLE:CREATE']) &&
        <Button onClick={handleAddRoleClick}>Add Role
          <IconShieldPlus size={18} /></Button>
      }
    </div>
  );
}
