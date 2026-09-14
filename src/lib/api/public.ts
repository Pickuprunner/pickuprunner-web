
import { request, send } from './client'
import type { ContactEnquiry, DriverApplicationPayload, DriverApplicationResult } from './types'

export const applicationsApi = {
  apply: (application: DriverApplicationPayload) =>
    request<DriverApplicationResult>('/applications', {
      method: 'POST',
      body: JSON.stringify({ ...application, source: 'website' }),
    }),

  /**
   * POST /applications/invite — emails the applicant the links to the driver
   * app. Separate from `apply`, which records the application; this is the
   * "check your email" half of what the form promises.
   */
  invite: (applicant: { name: string; email: string }) =>
    send<{ message?: string }>('/applications/invite', {
      method: 'POST',
      body: JSON.stringify(applicant),
    }),
}

export const contactApi = {
 
  send: (enquiry: ContactEnquiry) =>
    send<{ message?: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(enquiry),
    }),
}
