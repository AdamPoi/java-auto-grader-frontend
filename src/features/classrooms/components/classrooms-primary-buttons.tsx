import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

export function ClassroomsPrimaryButtons() {
  const navigate = useNavigate();

  const handleAddClassroomClick = () => {
    navigate({ to: '/classrooms/create' });
  };
  const { auth } = useAuthStore()

  return (
    <div className='flex gap-2'>

      {auth.hasPermission(['CLASSROOM:CREATE']) &&
        <Button onClick={handleAddClassroomClick}>Add Classroom
          <IconPlus size={18} /></Button>
      }
    </div>
  );
}