import {
  Activity,
  CalendarDays,
  Home,
  MapPin,
  Receipt,
  Users,
  Vote,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  /** 여행 상세 하위 경로 (상대) */
  segment: string
  label: string
  icon: LucideIcon
}

/** 여행 상세 좌측 사이드바 항목 — 06-화면설계서.md 정보 구조 기준 */
export const tripNavItems: NavItem[] = [
  { segment: '', label: '여행 홈', icon: Home },
  { segment: 'itinerary', label: '일정', icon: CalendarDays },
  { segment: 'places', label: '장소', icon: MapPin },
  { segment: 'polls', label: '투표', icon: Vote },
  { segment: 'expenses', label: '경비·정산', icon: Receipt },
  { segment: 'activity', label: '활동', icon: Activity },
  { segment: 'members', label: '멤버·설정', icon: Users },
]

/** 모바일 하단 탭 (5개): 홈·일정·장소·경비·더보기 */
export const mobileTabItems: NavItem[] = [
  { segment: '', label: '홈', icon: Home },
  { segment: 'itinerary', label: '일정', icon: CalendarDays },
  { segment: 'places', label: '장소', icon: MapPin },
  { segment: 'expenses', label: '경비', icon: Receipt },
]
