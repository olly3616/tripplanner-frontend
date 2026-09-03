import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { ItineraryItem, Transport } from '@/types'

const itineraryKey = (tripId: string | undefined) =>
  ['trip', tripId, 'itinerary'] as const

/** 여행 일정 목록 조회. */
export function useItinerary(tripId: string | undefined) {
  return useQuery({
    queryKey: itineraryKey(tripId),
    queryFn: async () => {
      const { data } = await api.get<ItineraryItem[]>(`/trips/${tripId}/itinerary`)
      return data
    },
    enabled: Boolean(tripId),
  })
}

export interface ItineraryItemInput {
  date: string
  startsAt?: string
  endsAt?: string
  placeId?: string
  note?: string
  transport: Transport
}

/** 일정 생성 — 낙관적 추가 후 서버 응답으로 확정. */
export function useCreateItineraryItem(tripId: string) {
  const qc = useQueryClient()
  const key = itineraryKey(tripId)
  return useMutation({
    mutationFn: async (input: ItineraryItemInput) => {
      const { data } = await api.post<ItineraryItem>(`/trips/${tripId}/itinerary`, input)
      return data
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}

/** 일정 수정 — version 을 함께 보내 낙관적 잠금 검증(409 처리). */
export function useUpdateItineraryItem(tripId: string) {
  const qc = useQueryClient()
  const key = itineraryKey(tripId)
  return useMutation({
    mutationFn: async (payload: { id: string; version: number } & Partial<ItineraryItemInput>) => {
      const { id, ...body } = payload
      const { data } = await api.patch<ItineraryItem>(`/itinerary/${id}`, body)
      return data
    },
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ItineraryItem[]>(key)
      qc.setQueryData<ItineraryItem[]>(key, (old) =>
        (old ?? []).map((i) => (i.id === payload.id ? { ...i, ...payload } : i)),
      )
      return { prev }
    },
    onError: (_err, _payload, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}

/** 일정 삭제 — 낙관적 제거. */
export function useDeleteItineraryItem(tripId: string) {
  const qc = useQueryClient()
  const key = itineraryKey(tripId)
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/itinerary/${id}`)
      return id
    },
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ItineraryItem[]>(key)
      qc.setQueryData<ItineraryItem[]>(key, (old) => (old ?? []).filter((i) => i.id !== id))
      return { prev }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}

/** 날짜·순서 일괄 변경 — 드래그 정렬 결과 반영. */
export function useReorderItinerary(tripId: string) {
  const qc = useQueryClient()
  const key = itineraryKey(tripId)
  return useMutation({
    mutationFn: async (updates: { id: string; date: string; sortOrder: number }[]) => {
      await api.post('/itinerary/reorder', { updates })
      return updates
    },
    onMutate: async (updates) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ItineraryItem[]>(key)
      const map = new Map(updates.map((u) => [u.id, u]))
      qc.setQueryData<ItineraryItem[]>(key, (old) =>
        (old ?? []).map((i) => {
          const u = map.get(i.id)
          return u ? { ...i, date: u.date, sortOrder: u.sortOrder } : i
        }),
      )
      return { prev }
    },
    onError: (_err, _updates, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
