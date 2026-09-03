import { NavLink } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { mobileTabItems } from './navConfig'
import { useUiStore } from '@/stores/ui'
import { cn } from '@/lib/utils'

interface MobileTabsProps {
  tripId: string
}

/** 모바일 하단 고정 탭 (767px 이하). 터치 영역 44px 이상. */
export function MobileTabs({ tripId }: MobileTabsProps) {
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen)

  return (
    <nav
      aria-label="하단 탭"
      className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {mobileTabItems.map((item) => (
        <NavLink
          key={item.segment || 'home'}
          to={`/trips/${tripId}/${item.segment}`.replace(/\/$/, '')}
          end={item.segment === ''}
          className={({ isActive }) =>
            cn(
              'flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] text-muted',
              isActive && 'font-bold text-accent-active',
            )
          }
        >
          <item.icon className="size-5" />
          {item.label}
        </NavLink>
      ))}
      <button
        type="button"
        onClick={() => setMobileNavOpen(true)}
        className="flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-[11px] text-muted"
      >
        <MoreHorizontal className="size-5" />
        더보기
      </button>
    </nav>
  )
}
