import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { IconPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

export function CoursesPrimaryButtons() {
  const navigate = useNavigate();

  const handleAddCourseClick = () => {
    navigate({ to: '/admin/courses/create' });
  };
  const { auth } = useAuthStore()

  return (
    <div className='flex gap-2'>

      {auth.hasPermission(['COURSE:CREATE']) &&
        <Button onClick={handleAddCourseClick}>Add Course
          <IconPlus size={18} /></Button>
      }
    </div>
  );
}