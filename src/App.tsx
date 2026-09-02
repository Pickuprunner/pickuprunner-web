import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { DriversPage } from './pages/DriversPage'
import { OrderPage } from './pages/OrderPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { AdminPage } from './pages/AdminPage'
import { DeleteProfilePage } from './pages/DeleteProfilePage'

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/order',
  component: OrderPage,
})

const driversRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/drivers',
  component: DriversPage,
})

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: PrivacyPage,
})

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: TermsPage,
})

const deleteProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/delete-profile',
  component: DeleteProfilePage,
})

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
})

const routeTree = rootRoute.addChildren([indexRoute, orderRoute, driversRoute, privacyRoute, termsRoute, deleteProfileRoute, adminRoute])

const router = createRouter({ routeTree })

export default function App() {
  return <RouterProvider router={router} />
}
