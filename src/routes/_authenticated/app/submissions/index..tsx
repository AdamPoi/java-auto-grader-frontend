import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/app/submissions/index/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/app/submissions/index/"!</div>
}
