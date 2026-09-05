import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Avatar } from '@/components/ui/avatar'
import { NotificationBell } from '@/features/notifications/NotificationBell'
import { useAuthStore } from '@/stores/auth'
import type { Trip } from '@/types'
import { cn } from '@/lib/utils'

interface TopbarProps {
  /** 현재 여행(있으면 여행 전환 버튼 노출) */
  trip?: Trip
  trips?: Trip[]
  onSwitchTrip?: (tripId: string) => void
}

export function Topbar({ trip, trips = [], onSwitchTrip }: TopbarProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface px-5 md:px-8">
      <Link to="/trips" className="text-[21px] font-bold tracking-[-0.05em]">
        Voyage
      </Link>

      {trip && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            className={cn(
              'flex max-w-[200px] items-center gap-1.5 truncate rounded-md border border-border bg-surface px-3 py-2 text-secondary',
              'hover:border-border-strong hover:text-fg focus-visible:outline-none',
            )}
          >
            <span className="truncate">
              {trip.title} · {trip.memberCount ?? '-'}명
            </span>
            <ChevronDown className="size-4 shrink-0" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="start"
              sideOffset={6}
              className="z-50 min-w-[220px] rounded-md border border-border bg-surface p-1 shadow-md animate-fade-in"
            >
              {trips.map((t) => (
                <DropdownMenu.Item
                  key={t.id}
                  onSelect={() => onSwitchTrip?.(t.id)}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm text-secondary',
                    'outline-none data-[highlighted]:bg-subtle data-[highlighted]:text-fg',
                    t.id === trip.id && 'font-semibold text-accent-active',
                  )}
                >
                  <span className="truncate">{t.title}</span>
                  <span className="text-xs text-muted">{t.memberCount}명</span>
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item
                onSelect={() => navigate('/trips')}
                className="cursor-pointer rounded-sm px-3 py-2 text-sm text-secondary outline-none data-[highlighted]:bg-subtle data-[highlighted]:text-fg"
              >
                모든 여행 보기
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}

      <div className="ml-auto flex items-center gap-2 md:gap-3">
        <NotificationBell />

        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            aria-label="계정 메뉴"
            className="rounded-full focus-visible:outline-none"
          >
            <Avatar name={user?.name ?? '?'} src={user?.avatarUrl} />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={6}
              className="z-50 min-w-[200px] rounded-md border border-border bg-surface p-1 shadow-md animate-fade-in"
            >
              <div className="px-3 py-2">
                <p className="truncate text-sm font-semibold text-fg">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-border" />
              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-secondary outline-none data-[highlighted]:bg-subtle data-[highlighted]:text-fg"
              >
                <LogOut className="size-4" />
                로그아웃
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  )
}
