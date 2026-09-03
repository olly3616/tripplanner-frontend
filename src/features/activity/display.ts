import { formatDistanceToNow, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import {
  CalendarDays,
  MapPin,
  Receipt,
  Users,
  Vote,
  Activity as ActivityIcon,
  type LucideIcon,
} from 'lucide-react'
import type { ActivityLog } from '@/types'

export type ActivityType = 'expense' | 'itinerary' | 'place' | 'poll' | 'member'

export const activityTypeMeta: Record<
  ActivityType,
  { label: string; icon: LucideIcon }
> = {
  expense: { label: '경비', icon: Receipt },
  itinerary: { label: '일정', icon: CalendarDays },
  place: { label: '장소', icon: MapPin },
  poll: { label: '투표', icon: Vote },
  member: { label: '멤버', icon: Users },
}

export const activityTypeOptions = (
  Object.keys(activityTypeMeta) as ActivityType[]
).map((value) => ({ value, label: activityTypeMeta[value].label }))

/** entityType → 활동 유형 (알 수 없으면 member 로 취급) */
export function activityType(log: ActivityLog): ActivityType {
  const t = log.entityType as ActivityType
  return t in activityTypeMeta ? t : 'member'
}

export function activityIcon(log: ActivityLog): LucideIcon {
  return activityTypeMeta[activityType(log)]?.icon ?? ActivityIcon
}

/** 행동을 사람이 읽는 문장으로 변환한다. 굵게 표시할 부분은 페이지에서 처리. */
export function activityText(log: ActivityLog): string {
  const m = log.metadata as Record<string, string | undefined>
  switch (log.action) {
    case 'expense.created':
      return `'${m.title ?? '지출'}' 지출을 추가했어요${m.amount ? ` · ${m.amount}` : ''}`
    case 'expense.updated':
      return `'${m.title ?? '지출'}' 지출을 수정했어요`
    case 'expense.deleted':
      return `지출을 삭제했어요`
    case 'itinerary.created':
      return `'${m.title ?? '일정'}'을 일정에 추가했어요`
    case 'itinerary.updated':
      return `일정을 수정했어요`
    case 'itinerary.reordered':
      return `${m.date ?? ''} 일정 순서를 변경했어요`
    case 'place.created':
      return `'${m.name ?? '장소'}'을 장소에 저장했어요`
    case 'poll.created':
      return `'${m.title ?? '투표'}' 투표를 만들었어요`
    case 'poll.closed':
      return `투표가 마감됐어요`
    case 'member.joined':
      return `여행에 합류했어요`
    case 'member.invited':
      return `${m.email ?? '동행자'}님을 초대했어요`
    default:
      return log.action
  }
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ko })
}
