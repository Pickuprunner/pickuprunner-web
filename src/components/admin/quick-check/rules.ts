
export const PHOTO_ITEMS = ['front of licence', 'back of licence', 'insurance card']

export function approveBlockers(application: { submittedAt?: string | null; missing?: string[] | null }) {
  const missing = application.missing ?? []
  return application.submittedAt ? missing.filter((item) => PHOTO_ITEMS.includes(item)) : missing
}

export const MIN_DRIVER_AGE = 18

const todayIso = () => {
  const now = new Date()
  return [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part, index) => String(part).padStart(index ? 2 : 4, '0'))
    .join('-')
}

export const isPast = (date?: string | null) => !!date && date.slice(0, 10) < todayIso()

export const ageFrom = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return null
  const [year, month, dayOfMonth] = dateOfBirth.slice(0, 10).split('-').map(Number)
  if (!year || !month || !dayOfMonth) return null
  const now = new Date()
  const hadBirthday =
    now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() >= dayOfMonth)
  return now.getFullYear() - year - (hadBirthday ? 0 : 1)
}
