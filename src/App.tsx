import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, redirect } from '@tanstack/react-router'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { DriversPage } from './pages/DriversPage'
import { OrderPage } from './pages/OrderPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'
import { AdminPage } from './pages/AdminPage'
import {
  ACCOUNT_ROLES,
  AccountsPanel,
  APPLICATION_STATUSES,
  ApplicationsPanel,
  CustomersPanel,
  DriversPanel,
  ORDER_STATUSES,
  OrdersPanel,
  type AccountFilter,
  type ApplicationFilter,
  type OrderFilter,
} from './components/AdminPanels'
import {
  AccountDetailPage,
  ApplicationDetailPage,
  CustomerDetailPage,
  DriverDetailPage,
  OrderDetailPage,
} from './components/AdminDetails'
import { DeleteProfilePage } from './pages/DeleteProfilePage'
import { ContactPage } from './pages/ContactPage'
import { NotFoundPage } from './pages/NotFoundPage'

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

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: ContactPage,
})

// ── Admin ───────────────────────────────────────────────────────────────────
// AdminPage is the layout (sign-in, header, tabs); every section is a child
// route with its own URL, and each list has a detail route for one record.

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
})

const adminIndexRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/admin/orders', replace: true })
  },
})

// List filters are kept in the query string so Back restores them. Anything
// unrecognised is dropped rather than trusted.
const text = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim().slice(0, 200) : undefined

const oneOf = <T extends string>(options: readonly T[], value: unknown): T | undefined =>
  typeof value === 'string' && value !== 'all' && (options as readonly string[]).includes(value)
    ? (value as T)
    : undefined

const adminOrdersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'orders',
  validateSearch: (search: Record<string, unknown>): { status?: OrderFilter; q?: string } => ({
    status: oneOf(ORDER_STATUSES, search.status),
    q: text(search.q),
  }),
  component: OrdersPanel,
})

const adminOrderRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'orders/$orderId',
  component: OrderDetailPage,
})

const adminCustomersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'customers',
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: text(search.q),
  }),
  component: CustomersPanel,
})

const adminCustomerRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'customers/$customerId',
  component: CustomerDetailPage,
})

const adminDriversRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'drivers',
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: text(search.q),
  }),
  component: DriversPanel,
})

const adminDriverRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'drivers/$driverId',
  component: DriverDetailPage,
})

const adminApplicationsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'applications',
  validateSearch: (search: Record<string, unknown>): { status?: ApplicationFilter } => ({
    status: oneOf(APPLICATION_STATUSES, search.status),
  }),
  component: ApplicationsPanel,
})

const adminApplicationRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'applications/$userId',
  component: ApplicationDetailPage,
})

const adminAccountsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'accounts',
  validateSearch: (search: Record<string, unknown>): { role?: AccountFilter } => ({
    role: oneOf(ACCOUNT_ROLES, search.role),
  }),
  component: AccountsPanel,
})

const adminAccountRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'accounts/$userId',
  component: AccountDetailPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  orderRoute,
  driversRoute,
  privacyRoute,
  termsRoute,
  deleteProfileRoute,
  contactRoute,
  adminRoute.addChildren([
    adminIndexRoute,
    adminOrdersRoute,
    adminOrderRoute,
    adminCustomersRoute,
    adminCustomerRoute,
    adminDriversRoute,
    adminDriverRoute,
    adminApplicationsRoute,
    adminApplicationRoute,
    adminAccountsRoute,
    adminAccountRoute,
  ]),
])

const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
})

export default function App() {
  return <RouterProvider router={router} />
}
