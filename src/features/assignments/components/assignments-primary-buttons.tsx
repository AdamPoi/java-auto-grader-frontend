import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate, useParams } from '@tanstack/react-router';

export function AssignmentsPrimaryButtons() {
  const navigate = useNavigate();
  const course = useParams({ from: '/_authenticated/courses/$courseId/assignments/' });

  const handleAddAssignmentClick = () => {
    navigate({ to: '/courses/$courseId/assignments/create', params: course });
  };
  const { auth } = useAuthStore()

  return (
    <div className='flex gap-2'>

      {auth.hasPermission(['ASSIGNMENT:CREATE']) &&
        <Button onClick={handleAddAssignmentClick}>Add Assignment
          <IconPlus size={18} /></Button>
      }
    </div>
  );
}