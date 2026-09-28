export function initials(first = '', last = '', email = '') {
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || email.slice(0, 2).toUpperCase()
}
export function friendlyDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}
export function friendlyDateTime(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
export function friendlyTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number)
  const reference = new Date(2000, 0, 1, hours, minutes)
  return new Intl.DateTimeFormat(undefined, { timeStyle: 'short' }).format(reference)
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
