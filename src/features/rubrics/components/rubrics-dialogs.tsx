import { useRubricsContext } from '../context/rubrics-context'
import { RubricsActionDialog } from './rubrics-action-dialog'
import { RubricsDeleteDialog } from './rubrics-delete-dialog'

export function RubricsDialogs() {
  const { open, setOpen, rubric, setRubric } = useRubricsContext()
  return (
    <>
      <RubricsActionDialog
        key='rubric-add'
        open={open === 'add'}
        onOpenChange={() => setOpen('add')}
      />


      {rubric && (
        <>
          <RubricsActionDialog
            key={`rubric-edit-${rubric.id}`}
            open={open === 'edit'}
            onOpenChange={() => {
              setOpen('edit')
              setTimeout(() => {
                setRubric(null)
              }, 500)
            }}
            rubric={rubric}
          />

          <RubricsDeleteDialog
            key={`rubric-delete-${rubric.id}`}
            open={open === 'delete'}
            onOpenChange={() => {
              setOpen('delete')
              setTimeout(() => {
                setRubric(null)
              }, 500)
            }}
            rubric={rubric}
          />
        </>
      )}
    </>
  )
}
