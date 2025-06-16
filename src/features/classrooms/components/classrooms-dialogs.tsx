import { useClassroomsContext } from '../context/classrooms-context'
import { ClassroomDeleteDialog } from './classrooms-delete-dialog'

export function ClassroomsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useClassroomsContext()
  return (
    <>
      {currentRow && (
        <>
          <ClassroomDeleteDialog
            key={`classroom-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={(isOpen) => {
              if (!isOpen) {
                setOpen(null)
                setTimeout(() => {
                  setCurrentRow(null)
                }, 500)
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}