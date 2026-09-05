import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ExpenseCategory, ItineraryItem, SavedPlace } from '@/types'

export interface SharedTrip {
  trip: {
    title: string
    destination: string
    startsOn: string
    endsOn: string
    timezone: string
    baseCurrency: string
    memberCount?: number
  }
  itinerary: ItineraryItem[]
  places: SavedPlace[]
  includeExpenses: boolean
  expenseSummary: {
    baseCurrency: string
    totalBase: number
    byCategory: { category: ExpenseCategory; amount: number }[]
  } | null
}

/** 공개 공유 데이터 조회 (인증 불필요) */
export function useSharedTrip(token: string | undefined) {
  return useQuery({
    queryKey: ['share', token],
    queryFn: async () => {
      const { data } = await api.get<SharedTrip>(`/share/${token}`)
      return data
    },
    enabled: Boolean(token),
    retry: false,
  })
}
