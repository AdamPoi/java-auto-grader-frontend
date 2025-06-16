import { useCoursesContext } from '../context/courses-context'
import { CourseDeleteDialog } from './courses-delete-dialog'

export function CoursesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useCoursesContext()
  return (
    <>
      {currentRow && (
        <>
          <CourseDeleteDialog
            key={`course-delete-${currentRow.id}`}
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