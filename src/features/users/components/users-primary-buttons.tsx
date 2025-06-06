import { Button } from '@/components/ui/button'
import { IconUserPlus } from '@tabler/icons-react'
import { useUsersContext } from '../context/users-context'

export function UsersPrimaryButtons() {
  const { setOpen } = useUsersContext()
  return (
    <div className='flex gap-2'>

      <Button className='space-x-1' onClick={() => setOpen('add')}>
        <span>Add User</span> <IconUserPlus size={18} />
      </Button>
    </div>
  )
}
