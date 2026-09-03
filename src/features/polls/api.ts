import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { Poll } from '@/types'

/** 여행 투표 목록 조회 */
export function usePolls(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId, 'polls'],
    queryFn: async () => {
      const { data } = await api.get<Poll[]>(`/trips/${tripId}/polls`)
      return data
    },
    enabled: Boolean(tripId),
  })
}
