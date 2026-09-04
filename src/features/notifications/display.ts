import { formatDistanceToNow, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  CalendarDays,
  Receipt,
  UserPlus,
  Vote,
  AtSign,
  type LucideIcon,
} from 'lucide-react'
import type { AppNotification, NotificationType } from '@/types'

export const notificationMeta: Record<
  NotificationType,
  { icon: LucideIcon; label: string }
> = {
  invite: { icon: UserPlus, label: '초대' },
  itinerary_changed: { icon: CalendarDays, label: '일정' },
  expense_added: { icon: Receipt, label: '경비' },
  poll_created: { icon: Vote, label: '투표' },
  poll_closed: { icon: Vote, label: '투표' },
  mention: { icon: AtSign, label: '멘션' },
}

/** 알림 문장 */
export function notificationText(n: AppNotification): string {
  const p = n.payload as Record<string, string | undefined>
  const actor = p.actor ?? '누군가'
  const title = p.title ?? ''
  switch (n.type) {
    case 'invite':
      return `${actor}님이 여행에 초대했어요`
    case 'itinerary_changed':
      return `${actor}님이 일정을 변경했어요${title ? ` · ${title}` : ''}`
    case 'expense_added':
      return `${actor}님이 지출을 추가했어요${title ? ` · ${title}` : ''}`
    case 'poll_created':
      return `${actor}님이 투표를 만들었어요${title ? ` · ${title}` : ''}`
    case 'poll_closed':
      return `투표가 마감됐어요${title ? ` · ${title}` : ''}`
    case 'mention':
      return `${actor}님이 나를 멘션했어요`
    default:
      return '새 알림'
  }
}

/** 알림 클릭 시 이동할 경로(여행 하위 화면) */
export function notificationHref(n: AppNotification): string | null {
  const p = n.payload as Record<string, string | undefined>
  const tripId = p.tripId
  if (!tripId) return null
  const seg: Record<NotificationType, string> = {
    invite: 'members',
    itinerary_changed: 'itinerary',
    expense_added: 'expenses',
    poll_created: 'polls',
    poll_closed: 'polls',
    mention: 'activity',
  }
  return `/trips/${tripId}/${seg[n.type]}`
}

export function notificationTime(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ko })
}
