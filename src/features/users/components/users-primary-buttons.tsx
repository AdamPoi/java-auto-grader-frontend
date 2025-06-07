import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { IconUserPlus } from '@tabler/icons-react'
import { useUsersContext } from '../context/users-context'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsersContext()
  const { auth } = useAuthStore()
  return (
    <div className='flex gap-2'>
      {auth.hasPermission(['ROLE:CREATE']) &&
        <Button className='space-x-1' onClick={() => setOpen('add')}>
          <span>Add User</span> <IconUserPlus size={18} />
        </Button>
      }
    </div>
  )
}
