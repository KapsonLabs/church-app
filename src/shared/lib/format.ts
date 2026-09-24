export function initials(first = '', last = '', email = '') {
  return `${first[0] || ''}${last[0] || ''}`.toUpperCase() || email.slice(0, 2).toUpperCase()
}
export function friendlyDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}
export function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
