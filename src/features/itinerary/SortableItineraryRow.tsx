import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { GripVertical, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { itemTitle, transportMeta } from './display'
import type { ItineraryItem } from '@/types'

interface SortableItineraryRowProps {
  item: ItineraryItem
  onEdit: (item: ItineraryItem) => void
  onDelete: (item: ItineraryItem) => void
}

export function SortableItineraryRow({ item, onEdit, onDelete }: SortableItineraryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const transport = transportMeta[item.transport]
  const TransportIcon = transport.icon

  return (
    <div ref={setNodeRef} style={style} className="flex gap-3">
      {/* 시간 열 */}
      <span className="mono w-12 shrink-0 pt-3 text-right text-xs text-muted">
        {item.startsAt || '—'}
      </span>

      {/* 항목 카드 */}
      <div
        className={cn(
          'flex flex-1 items-center gap-2 rounded-md border border-border bg-surface p-3 shadow-sm transition-shadow',
          isDragging && 'opacity-70 shadow-md',
        )}
      >
        {/* 드래그 핸들 — 키보드로도 조작 가능(dnd-kit KeyboardSensor) */}
        <button
          type="button"
          className="shrink-0 cursor-grab touch-none rounded p-1 text-muted hover:bg-subtle hover:text-fg active:cursor-grabbing"
          aria-label={`${itemTitle(item)} 순서 변경`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => onEdit(item)}
          className="min-w-0 flex-1 text-left focus-visible:outline-none"
        >
          <strong className="block truncate text-sm">{itemTitle(item)}</strong>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
            <TransportIcon className="size-3.5" />
            {transport.label}
            {item.endsAt && (
              <span className="mono">
                · {item.startsAt}–{item.endsAt}
              </span>
            )}
            {item.place?.category && <span>· {item.place.category}</span>}
          </span>
        </button>

        {item.place && (
          <Badge variant="confirmed" className="shrink-0">
            장소
          </Badge>
        )}

        <DropdownMenu.Root>
          <DropdownMenu.Trigger
            aria-label="일정 메뉴"
            className="shrink-0 rounded p-1 text-muted hover:bg-subtle hover:text-fg focus-visible:outline-none"
          >
            <MoreVertical className="size-4" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={4}
              className="z-50 min-w-[140px] rounded-md border border-border bg-surface p-1 shadow-md animate-fade-in"
            >
              <DropdownMenu.Item
                onSelect={() => onEdit(item)}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-secondary outline-none data-[highlighted]:bg-subtle data-[highlighted]:text-fg"
              >
                <Pencil className="size-4" />
                수정
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => onDelete(item)}
                className="flex cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm text-danger outline-none data-[highlighted]:bg-[oklch(0.95_0.04_28)]"
              >
                <Trash2 className="size-4" />
                삭제
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </div>
  )
}
