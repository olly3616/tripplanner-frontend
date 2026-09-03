import { NavLink } from 'react-router-dom'
import { tripNavItems } from './navConfig'
import { cn } from '@/lib/utils'

interface SidebarProps {
  tripId: string
}

/** 데스크톱 좌측 240px 사이드바 (768px 이상). */
export function Sidebar({ tripId }: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface p-3 md:block">
      <nav className="grid gap-0.5" aria-label="여행 메뉴">
        <span className="mb-2 mt-2.5 block px-3 text-xs font-semibold text-muted">
          여행
        </span>
        {tripNavItems.map((item) => (
          <NavLink
            key={item.segment || 'home'}
            to={`/trips/${tripId}/${item.segment}`.replace(/\/$/, '')}
            end={item.segment === ''}
            className={({ isActive }) =>
              cn(
                'flex min-h-[44px] items-center gap-3 rounded-md px-3 text-secondary transition-colors',
                'hover:bg-subtle hover:text-fg',
                isActive && 'bg-selected font-semibold text-accent-active',
              )
            }
          >
            <item.icon className="size-[18px] shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
