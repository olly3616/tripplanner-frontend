import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { Expense } from '@/types'

/** 여행 경비 목록 조회 */
export function useExpenses(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId, 'expenses'],
    queryFn: async () => {
      const { data } = await api.get<Expense[]>(`/trips/${tripId}/expenses`)
      return data
    },
    enabled: Boolean(tripId),
  })
}
