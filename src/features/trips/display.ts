import { format, parseISO } from 'date-fns'
import type { TripStatus } from '@/types'

export const tripStatusLabel: Record<TripStatus, string> = {
  upcoming: '예정',
  ongoing: '진행 중',
  completed: '완료',
}

export const tripStatusVariant: Record<
  TripStatus,
  'confirmed' | 'considering' | 'closed'
> = {
  ongoing: 'confirmed',
  upcoming: 'considering',
  completed: 'closed',
}

/** "2026. 08. 14–17" 형태로 기간 표시 */
export function formatTripRange(startsOn: string, endsOn: string): string {
  if (!startsOn || !endsOn) return ''
  const start = parseISO(startsOn)
  const end = parseISO(endsOn)
  const sameMonth =
    start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
  const startStr = format(start, 'yyyy. MM. dd')
  const endStr = sameMonth ? format(end, 'dd') : format(end, 'yyyy. MM. dd')
  return `${startStr}–${endStr}`
}
