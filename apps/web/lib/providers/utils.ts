export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, Math.max(0, maxLength - 1)).trimEnd() + '…'
}

export function getInitials(name: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] || ''
  const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export function formatExperience(years?: number | null): string {
  if (years == null) return ''
  return years >= 15 ? `${years}+ years` : `${years} years`
}

export function getAvailabilityColor(status?: string | null): string {
  switch (status) {
    case 'available':
      return 'bg-green-100 text-green-700'
    case 'busy':
      return 'bg-yellow-100 text-yellow-700'
    case 'unavailable':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}
