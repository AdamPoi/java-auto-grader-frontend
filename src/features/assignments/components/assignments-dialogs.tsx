import { useAssignmentsContext } from '../context/assignments-context'
import { AssignmentsDeleteDialog } from './assignments-delete-dialog'

export function AssignmentsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAssignmentsContext()
  return (
    <>
      {currentRow && (

        <AssignmentsDeleteDialog
          key={`user-delete-${currentRow.id}`}
          open={open === 'delete'}
          onOpenChange={() => {
            setOpen('delete')
            setTimeout(() => {
              setCurrentRow(null)
            }, 500)
          }}
          currentRow={currentRow}
        />
      )
      }
    </>
  )
}
