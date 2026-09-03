import { eachDayOfInterval, format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Bike, Car, Footprints, Minus, Plane, TrainFront, type LucideIcon } from 'lucide-react'
import type { ItineraryItem, Transport } from '@/types'

export const transportMeta: Record<Transport, { label: string; icon: LucideIcon }> = {
  walk: { label: '도보', icon: Footprints },
  car: { label: '차량', icon: Car },
  transit: { label: '대중교통', icon: TrainFront },
  bike: { label: '자전거', icon: Bike },
  flight: { label: '항공', icon: Plane },
  none: { label: '이동 없음', icon: Minus },
}

export const transportOptions = (Object.keys(transportMeta) as Transport[]).map((key) => ({
  value: key,
  label: transportMeta[key].label,
}))

/** 여행 기간의 날짜 목록(YYYY-MM-DD) */
export function getTripDays(startsOn: string, endsOn: string): string[] {
  if (!startsOn || !endsOn) return []
  const days = eachDayOfInterval({ start: parseISO(startsOn), end: parseISO(endsOn) })
  return days.map((d) => format(d, 'yyyy-MM-dd'))
}

/** "8월 14일 (금)" */
export function formatDayLabel(date: string): string {
  return format(parseISO(date), 'M월 d일 (EEE)', { locale: ko })
}

/** "금요일" 등 요일 전체 */
export function formatWeekday(date: string): string {
  return format(parseISO(date), 'EEEE', { locale: ko })
}

/** 일정 항목의 대표 제목: 장소명 우선, 없으면 메모, 둘 다 없으면 기본값 */
export function itemTitle(item: ItineraryItem): string {
  return item.place?.name ?? item.note ?? '새 일정'
}

/** 같은 날짜 항목을 sortOrder 기준 정렬 */
export function sortByOrder(items: ItineraryItem[]): ItineraryItem[] {
  return [...items].sort((a, b) => a.sortOrder - b.sortOrder)
}
