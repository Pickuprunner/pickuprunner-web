
import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { type Role, usersApi } from '../../../lib/api'
import { Avatar, BackLink, DetailHeader, Section, Spinner, StatusBadge, useAdmin, useAdminData } from '../ui'
import { AccountFields, HeaderActions } from './account'
import { accountDetailRoute } from './routes'
import { Contact, DetailState, useScreenRefresh } from './shared'

export function AccountDetailPage() {
  const { userId } = accountDetailRoute.useParams()
  const { token, user: me } = useAdmin()
  const navigate = useNavigate()

  const { data, loading, error, reload } = useAdminData(
    () => usersApi.get(token, userId),
    [token, userId],
  )
  useScreenRefresh(reload)

  const account = data?.user
  const name = account?.displayName || account?.email || 'Unnamed account'
  const profileRole = account?.role === 'customer' || account?.role === 'driver' ? account.role : null

  useEffect(() => {
    if (!account || !profileRole) return

    if (profileRole === 'customer') {
      navigate({ to: '/admin/customers/$customerId', params: { customerId: account.id }, replace: true })
    } else {
      navigate({ to: '/admin/drivers/$driverId', params: { driverId: account.id }, replace: true })
    }
  }, [account, profileRole, navigate])

  if (profileRole) return <Spinner />

  return (
    <>
      <BackLink to="/admin/accounts" label="Accounts" />

      <DetailState loading={loading} error={error} found={Boolean(account)}>
        {account && (
          <>
            <DetailHeader
              media={<Avatar url={account.photoUrl} name={name} size={56} zoom />}
              title={name}
              subtitle={<Contact account={account} />}
              badges={
                <>
                  <StatusBadge value={account.status} />
                  <StatusBadge label="Role" value={account.role} />
                  {account.id === me.id && <StatusBadge value="you" />}
                </>
              }
              aside={<HeaderActions account={account} onChanged={reload} />}
            />

            <Section title="Details">
              <AccountFields account={account} />
            </Section>
          </>
        )}
      </DetailState>
    </>
  )
}
