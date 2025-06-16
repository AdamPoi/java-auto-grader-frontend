import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth.store'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { useNavigate } from '@tanstack/react-router'
import { type Row } from '@tanstack/react-table'
import { useClassroomsContext } from '../context/classrooms-context'
import { type Classroom } from '../data/types'

interface ClassroomsTableRowActionsProps {
  row: Row<Classroom>
}

export function ClassroomsTableRowActions({ row }: ClassroomsTableRowActionsProps) {
  const navigate = useNavigate({ from: '/classrooms' })
  const { setOpen, setCurrentRow } = useClassroomsContext()
  const { auth } = useAuthStore();
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
          >
            <DotsHorizontalIcon className='h-4 w-4' />
            <span className='sr-only'>Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[160px]'>
          {auth.hasPermission(['CLASSROOM:UPDATE']) &&
            <DropdownMenuItem
              onClick={() => {
                navigate({
                  to: '/classrooms/$classroomId/edit',
                  params: { classroomId: row.original.id },
                })
              }}
            >
              Edit
              <DropdownMenuShortcut>
                <IconEdit size={16} />
              </DropdownMenuShortcut>
            </DropdownMenuItem>}
          {auth.hasPermission(['CLASSROOM:DELETE']) &&
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentRow(row.original)
                  setOpen('delete')
                }}
                className='text-red-500!'
              >
                Delete
                <DropdownMenuShortcut>
                  <IconTrash size={16} />
                </DropdownMenuShortcut>
              </DropdownMenuItem>
            </>}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}