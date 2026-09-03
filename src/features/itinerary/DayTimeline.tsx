import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { CalendarDays } from 'lucide-react'
import { SortableItineraryRow } from './SortableItineraryRow'
import type { ItineraryItem } from '@/types'

interface DayTimelineProps {
  items: ItineraryItem[] // 이미 정렬된 해당 날짜 항목
  onReorder: (orderedIds: string[]) => void
  onEdit: (item: ItineraryItem) => void
  onDelete: (item: ItineraryItem) => void
  onAdd: () => void
}

export function DayTimeline({ items, onReorder, onEdit, onDelete, onAdd }: DayTimelineProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const next = [...items]
    const [moved] = next.splice(oldIndex, 1)
    next.splice(newIndex, 0, moved)
    onReorder(next.map((i) => i.id))
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays />}
        title="이 날의 일정이 비어 있어요"
        description="장소나 메모를 추가해 하루를 채워 보세요."
        action={
          <Button onClick={onAdd}>
            <Plus className="size-4" />일정 추가
          </Button>
        }
      />
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="grid gap-2">
          {items.map((item) => (
            <SortableItineraryRow
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={onAdd}
        className="mt-2 flex w-full items-center gap-3 rounded-md border border-dashed border-border px-3 py-3 text-sm text-muted hover:border-border-strong hover:text-fg"
      >
        <span className="mono w-12 shrink-0 text-right text-xs">＋</span>
        장소 또는 메모 추가
      </button>
    </DndContext>
  )
}
