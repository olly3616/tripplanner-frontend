import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ActivityLog } from '@/types'

/** 여행 활동 로그 조회 */
export function useActivity(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId, 'activity'],
    queryFn: async () => {
      const { data } = await api.get<ActivityLog[]>(`/trips/${tripId}/activity`)
      return data
    },
    enabled: Boolean(tripId),
  })
}
