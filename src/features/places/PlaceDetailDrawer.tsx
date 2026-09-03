import { useEffect, useState } from 'react'
import { CalendarPlus, MapPin, Vote } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { Badge } from '@/components/ui/badge'
import { placeStatusOptions, placeStatusLabel, placeStatusVariant } from './display'
import type { PlaceStatus, SavedPlace } from '@/types'

export interface PlaceDetailValues {
  status: PlaceStatus
  tags: string[]
  note: string
}

interface PlaceDetailDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  place: SavedPlace | null
  onSave: (values: PlaceDetailValues) => void
  onAddToItinerary: (place: SavedPlace) => void
  onCreatePoll: (place: SavedPlace) => void
}

export function PlaceDetailDrawer({
  open,
  onOpenChange,
  place,
  onSave,
  onAddToItinerary,
  onCreatePoll,
}: PlaceDetailDrawerProps) {
  const [status, setStatus] = useState<PlaceStatus>('want')
  const [tagsInput, setTagsInput] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!open || !place) return
    setStatus(place.status)
    setTagsInput(place.tags.join(', '))
    setNote(place.note ?? '')
  }, [open, place])

  if (!place) return null

  function handleSave() {
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onSave({ status, tags, note: note.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullScreenOnMobile>
        <DialogHeader>
          <DialogTitle>{place.name}</DialogTitle>
          <p className="flex items-center gap-1 text-sm text-muted">
            <MapPin className="size-3.5" />
            {place.address}
          </p>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            {place.category && <Badge variant="neutral">{place.category}</Badge>}
            <Badge variant={placeStatusVariant[place.status]}>
              {placeStatusLabel[place.status]}
            </Badge>
          </div>

          <Field label="상태" htmlFor="place-status">
            <Select
              id="place-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PlaceStatus)}
            >
              {placeStatusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="태그" htmlFor="place-tags" hint="쉼표로 구분 (예: 해변, 노을)">
            <Input
              id="place-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="태그를 입력하세요"
            />
          </Field>

          <Field label="공동 메모" htmlFor="place-note">
            <Textarea
              id="place-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="멤버들과 공유할 메모"
            />
          </Field>

          {/* 연계 행동 — 일정/투표 단계에서 실제 연결 */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => onAddToItinerary(place)}>
              <CalendarPlus className="size-4" />
              일정에 추가
            </Button>
            <Button variant="outline" onClick={() => onCreatePoll(place)}>
              <Vote className="size-4" />
              투표 만들기
            </Button>
          </div>

          <div className="mt-1 flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
