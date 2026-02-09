import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'
import { AppProvider } from '@/feature/provider/app-provider'

const RootLayout = () => (
  <>
    <AppProvider>
      <Outlet />
    </AppProvider>
    {/* <TanStackRouterDevtools /> */}
  </>
)

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    if (location.pathname === '/') {
      throw redirect({ to: '/home' })
    }
  },
  component: RootLayout,
})
