import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_studentLayout/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_studentLayout/profile"!</div>
}
