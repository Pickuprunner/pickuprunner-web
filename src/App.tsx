import {
  createRouter,
  createRoute,
  createRootRoute,
  lazyRouteComponent,
  RouterProvider,
  Outlet,
  redirect,
  type RouterHistory,
} from '@tanstack/react-router'
import { Seo, Breadcrumbs } from './components/Seo'
import { Navbar } from './components/Navbar'
import { Footer } from './components/Footer'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { DownloadPage } from './pages/DownloadPage'
import { DriversPage } from './pages/drivers'
import { OrderPage } from './pages/order'
import { PrivacyPage } from './pages/PrivacyPage'
import { TermsPage } from './pages/TermsPage'

import {
  ACCOUNT_ROLES,
  APPLICATION_STATUSES,
  DRIVER_VIEWS,
  ORDER_STATUSES,
  type AccountFilter,
  type ApplicationFilter,
  type DriverView,
  type OrderFilter,
} from './components/admin/panels/filters'

const AdminPage = lazyRouteComponent(() => import('./pages/admin'), 'AdminPage')
const panels = () => import('./components/admin/panels')
const OrdersPanel = lazyRouteComponent(panels, 'OrdersPanel')
const CustomersPanel = lazyRouteComponent(panels, 'CustomersPanel')
const DriversPanel = lazyRouteComponent(panels, 'DriversPanel')
const ApplicationsPanel = lazyRouteComponent(panels, 'ApplicationsPanel')
const AccountsPanel = lazyRouteComponent(panels, 'AccountsPanel')
const details = () => import('./components/admin/details')
const OrderDetailPage = lazyRouteComponent(details, 'OrderDetailPage')
const CustomerDetailPage = lazyRouteComponent(details, 'CustomerDetailPage')
const DriverDetailPage = lazyRouteComponent(details, 'DriverDetailPage')
const ApplicationDetailPage = lazyRouteComponent(details, 'ApplicationDetailPage')
const AccountDetailPage = lazyRouteComponent(details, 'AccountDetailPage')
import { DeleteProfilePage } from './pages/delete-profile'
import { ContactPage } from './pages/contact'
import { NotFoundPage } from './pages/NotFoundPage'

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Seo />
      <a href="#main-content" className="skip-link">Skip to content</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 flex flex-col">
        <Breadcrumbs />
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

const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/about', component: AboutPage })
const downloadRoute = createRoute({ getParentRoute: () => rootRoute, path: '/download', component: DownloadPage })

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
  validateSearch: (search: Record<string, unknown>): { q?: string; view?: DriverView } => ({
    q: text(search.q),
    view: oneOf(DRIVER_VIEWS, search.view),
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
  aboutRoute,
  downloadRoute,
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

export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, history, defaultNotFoundComponent: NotFoundPage })
}

export const router = createAppRouter()

export default function App() {
  return <RouterProvider router={router} />
}
