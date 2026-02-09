import { Button } from '@/components/ui/button'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/home/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div>Hello Home!

      <TestComponent />
    </div>
  )
}

function TestComponent() {
  return (
    <div>
      <Button>Test Component</Button>
    </div>
  )
}

