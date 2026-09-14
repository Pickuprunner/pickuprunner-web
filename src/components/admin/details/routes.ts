
import { getRouteApi } from '@tanstack/react-router'

export const orderDetailRoute = getRouteApi('/admin/orders/$orderId')

export const customerDetailRoute = getRouteApi('/admin/customers/$customerId')

export const driverDetailRoute = getRouteApi('/admin/drivers/$driverId')

export const applicationDetailRoute = getRouteApi('/admin/applications/$userId')

export const accountDetailRoute = getRouteApi('/admin/accounts/$userId')
