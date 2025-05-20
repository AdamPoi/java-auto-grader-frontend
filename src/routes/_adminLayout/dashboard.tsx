import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_adminLayout/dashboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard"!</div>
}
