import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { IconShieldPlus } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

export function SubmissionsPrimaryButtons() {
  const navigate = useNavigate();

  const handleAddSubmissionClick = () => {
    navigate({ to: '/admin/submissions/create' });
  };
  const { auth } = useAuthStore()

  return (
    <div className='flex gap-2'>

      {auth.hasPermission(['SUBMISSION:CREATE']) &&
        <Button onClick={handleAddSubmissionClick}>Add Submission
          <IconShieldPlus size={18} /></Button>
      }
    </div>
  );
}
