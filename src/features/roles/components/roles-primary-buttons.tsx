import { Button } from '@/components/ui/button';
import { IconShieldPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

export function RolesPrimaryButtons() {
  const navigate = useNavigate();

  const handleAddRoleClick = () => {
    navigate({ to: '/roles/create' });
  };

  return (
    <Button onClick={handleAddRoleClick}>Add Role
      <IconShieldPlus size={18} /></Button>
  );
}
