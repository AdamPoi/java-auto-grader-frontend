import { useRolesContext } from '../context/roles-context'
import { RoleDeleteDialog } from './role-delete-dialog'

export function RolesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRolesContext()
  return (
    <>
      {currentRow && currentRow?.id != null && (
        <>
          <RoleDeleteDialog
            key={`role-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setCurrentRow(null)
              }, 500)
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
