import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api/client'
import type { AppNotification } from '@/types'

const key = ['notifications'] as const

/** 알림 목록 조회 */
export function useNotifications() {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data } = await api.get<AppNotification[]>('/notifications')
      return data
    },
  })
}

/** 읽음 처리 — ids 미지정 시 전체 읽음. 낙관적 업데이트. */
export function useMarkNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (ids?: string[]) => {
      const { data } = await api.patch<AppNotification[]>('/notifications', { ids })
      return data
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<AppNotification[]>(key)
      const now = new Date().toISOString()
      qc.setQueryData<AppNotification[]>(key, (old) =>
        (old ?? []).map((n) =>
          !ids || ids.includes(n.id) ? { ...n, readAt: n.readAt ?? now } : n,
        ),
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  })
}
