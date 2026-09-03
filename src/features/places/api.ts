import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { SavedPlace } from '@/types'

/** 여행에 저장된 장소 목록 */
export function useSavedPlaces(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId, 'places'],
    queryFn: async () => {
      const { data } = await api.get<SavedPlace[]>(`/trips/${tripId}/places`)
      return data
    },
    enabled: Boolean(tripId),
  })
}
