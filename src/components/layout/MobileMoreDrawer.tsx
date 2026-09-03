import { useNavigate } from 'react-router-dom'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { tripNavItems } from './navConfig'
import { useUiStore } from '@/stores/ui'

interface MobileMoreDrawerProps {
  tripId: string
}

/** 하단 탭 '더보기' — 전체 여행 메뉴를 전체 화면 드로어로 노출. */
export function MobileMoreDrawer({ tripId }: MobileMoreDrawerProps) {
  const open = useUiStore((s) => s.mobileNavOpen)
  const setOpen = useUiStore((s) => s.setMobileNavOpen)
  const navigate = useNavigate()

  function go(segment: string) {
    setOpen(false)
    navigate(`/trips/${tripId}/${segment}`.replace(/\/$/, ''))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent fullScreenOnMobile className="md:hidden">
        <DialogHeader>
          <DialogTitle>메뉴</DialogTitle>
        </DialogHeader>
        <nav className="grid gap-1">
          {tripNavItems.map((item) => (
            <button
              key={item.segment || 'home'}
              type="button"
              onClick={() => go(item.segment)}
              className="flex min-h-[52px] items-center gap-3 rounded-md px-3 text-left text-secondary hover:bg-subtle hover:text-fg"
            >
              <item.icon className="size-5 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  )
}
