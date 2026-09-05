import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Bell, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/stores/ui'
import { useMarkNotificationsRead, useNotifications } from './api'
import {
  notificationHref,
  notificationMeta,
  notificationText,
  notificationTime,
} from './display'
import type { AppNotification } from '@/types'

export function NotificationBell() {
  const open = useUiStore((s) => s.notificationsOpen)
  const setOpen = useUiStore((s) => s.setNotificationsOpen)
  const navigate = useNavigate()
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationsRead()

  const unreadCount = notifications.filter((n) => !n.readAt).length

  const sorted = useMemo(
    () =>
      [...notifications].sort((a, b) => {
        // 읽지 않은 항목 우선, 그다음 최신순
        const unreadDiff = Number(!!a.readAt) - Number(!!b.readAt)
        if (unreadDiff !== 0) return unreadDiff
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }),
    [notifications],
  )

  function handleClick(n: AppNotification) {
    if (!n.readAt) markRead.mutate([n.id])
    const href = notificationHref(n)
    setOpen(false)
    if (href) navigate(href)
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger
        aria-label={`알림${unreadCount > 0 ? ` ${unreadCount}건` : ''}`}
        className="relative grid size-10 place-items-center rounded-md text-secondary hover:bg-subtle hover:text-fg focus-visible:outline-none"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 grid min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold leading-4 text-surface">
            {unreadCount}
          </span>
        )}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[oklch(0.18_0.032_265/0.38)] animate-fade-in" />
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] flex-col bg-surface shadow-md animate-slide-in-right',
          )}
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <DialogPrimitive.Title className="text-base font-bold">알림</DialogPrimitive.Title>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={() => markRead.mutate(undefined)}>
                  <Check className="size-4" />
                  모두 읽음
                </Button>
              )}
              <DialogPrimitive.Close
                aria-label="닫기"
                className="grid size-8 place-items-center rounded-md text-secondary hover:bg-subtle hover:text-fg focus-visible:outline-none"
              >
                <X className="size-5" />
              </DialogPrimitive.Close>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sorted.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-muted">새 알림이 없어요.</p>
            ) : (
              <ul>
                {sorted.map((n) => {
                  const Icon = notificationMeta[n.type].icon
                  const unread = !n.readAt
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleClick(n)}
                        className={cn(
                          'flex w-full items-start gap-3 border-b border-border px-5 py-3.5 text-left hover:bg-subtle focus-visible:outline-none',
                          unread && 'bg-selected/40',
                        )}
                      >
                        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-subtle text-accent-active">
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm">{notificationText(n)}</span>
                          <span className="mt-0.5 block text-xs text-muted">
                            {notificationTime(n.createdAt)}
                          </span>
                        </span>
                        {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-accent" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
