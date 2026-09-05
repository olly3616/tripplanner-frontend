import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { Trip, TripMember } from '@/types'

export interface CreateTripInput {
  title: string
  destination: string
  startsOn: string
  endsOn: string
  baseCurrency: string
  timezone: string
}

/** 내 여행 목록 */
export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data } = await api.get<Trip[]>('/trips')
      return data
    },
  })
}

/** 여행 상세 */
export function useTrip(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId],
    queryFn: async () => {
      const { data } = await api.get<Trip>(`/trips/${tripId}`)
      return data
    },
    enabled: Boolean(tripId),
  })
}

/** 여행 멤버 */
export function useTripMembers(tripId: string | undefined) {
  return useQuery({
    queryKey: ['trip', tripId, 'members'],
    queryFn: async () => {
      const { data } = await api.get<TripMember[]>(`/trips/${tripId}/members`)
      return data
    },
    enabled: Boolean(tripId),
  })
}

export interface UpdateTripInput {
  title: string
  destination: string
  startsOn: string
  endsOn: string
  baseCurrency: string
  timezone: string
}

/** 여행 정보 수정 */
export function useUpdateTrip(tripId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateTripInput) => {
      const { data } = await api.patch<Trip>(`/trips/${tripId}`, input)
      return data
    },
    onSuccess: (trip) => {
      qc.setQueryData(['trip', tripId], trip)
      qc.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}

/** 여행 생성 */
export function useCreateTrip() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTripInput) => {
      const { data } = await api.post<Trip>('/trips', input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trips'] })
    },
  })
}
