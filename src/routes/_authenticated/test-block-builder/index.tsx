import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/test-block-builder/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/test-block-builder/"!</div>
}
