import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ItineraryItem } from '@/types'

/**
 * 여행 일정 목록 조회.
 * 편집(생성/수정/삭제/정렬)은 API 연결 단계에서 mutation 훅으로 추가한다.
 * 현재는 마크업+기능 단계라 조회만 제공하고, 편집은 화면의 로컬 상태로 처리한다.
 */
export function useItinerary(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId, 'itinerary'],
    queryFn: async () => {
      const { data } = await api.get<ItineraryItem[]>(`/trips/${tripId}/itinerary`)
      return data
    },
    enabled: Boolean(tripId),
  })
}
