import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { transportOptions } from './display'
import { formatDayLabel } from './display'
import type { ItineraryItem, SavedPlace, Transport } from '@/types'

const schema = z
  .object({
    date: z.string().min(1, '날짜를 선택하세요.'),
    startsAt: z.string(),
    endsAt: z.string(),
    placeId: z.string(),
    note: z.string(),
    transport: z.enum(['walk', 'car', 'transit', 'bike', 'flight', 'none']),
  })
  // 장소 또는 메모 중 하나는 있어야 항목을 식별할 수 있다.
  .refine((v) => v.placeId !== '' || v.note.trim() !== '', {
    message: '장소를 선택하거나 메모를 입력하세요.',
    path: ['note'],
  })
  // 종료 시간이 시작 시간보다 빠를 수 없다.
  .refine((v) => !v.startsAt || !v.endsAt || v.endsAt >= v.startsAt, {
    message: '종료 시간은 시작 시간보다 빠를 수 없습니다.',
    path: ['endsAt'],
  })

export type ItineraryFormValues = z.infer<typeof schema>

interface ItineraryItemDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 편집 대상. null 이면 새 항목 생성. */
  item: ItineraryItem | null
  /** 생성 시 기본 날짜 */
  defaultDate: string
  days: string[]
  places: SavedPlace[]
  onSave: (values: ItineraryFormValues) => void
  onDelete?: () => void
}

export function ItineraryItemDrawer({
  open,
  onOpenChange,
  item,
  defaultDate,
  days,
  places,
  onSave,
  onDelete,
}: ItineraryItemDrawerProps) {
  const isEdit = Boolean(item)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItineraryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate,
      startsAt: '',
      endsAt: '',
      placeId: '',
      note: '',
      transport: 'none' as Transport,
    },
  })

  // 드로어가 열릴 때마다 대상 항목 값으로 폼을 초기화한다.
  useEffect(() => {
    if (!open) return
    reset({
      date: item?.date ?? defaultDate,
      startsAt: item?.startsAt ?? '',
      endsAt: item?.endsAt ?? '',
      placeId: item?.placeId ?? '',
      note: item?.note ?? '',
      transport: item?.transport ?? 'none',
    })
  }, [open, item, defaultDate, reset])

  function submit(values: ItineraryFormValues) {
    onSave(values)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullScreenOnMobile>
        <DialogHeader>
          <DialogTitle>{isEdit ? '일정 수정' : '일정 추가'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4" noValidate>
          <Field label="날짜" htmlFor="date" error={errors.date?.message}>
            <Select id="date" invalid={!!errors.date} {...register('date')}>
              {days.map((d) => (
                <option key={d} value={d}>
                  {formatDayLabel(d)}
                </option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="시작 시간" htmlFor="startsAt">
              <Input id="startsAt" type="time" {...register('startsAt')} />
            </Field>
            <Field label="종료 시간" htmlFor="endsAt" error={errors.endsAt?.message}>
              <Input id="endsAt" type="time" invalid={!!errors.endsAt} {...register('endsAt')} />
            </Field>
          </div>

          <Field label="장소" htmlFor="placeId" hint="저장한 장소에서 선택 (선택 사항)">
            <Select id="placeId" {...register('placeId')}>
              <option value="">장소 없음 (메모만)</option>
              {places.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="이동수단" htmlFor="transport">
            <Select id="transport" {...register('transport')}>
              {transportOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="메모" htmlFor="note" error={errors.note?.message}>
            <Input id="note" placeholder="예: 숙소 체크인, 도보 15분" invalid={!!errors.note} {...register('note')} />
          </Field>

          <DialogFooter className="items-center">
            {isEdit && onDelete && (
              <Button
                type="button"
                variant="danger"
                className="mr-auto"
                onClick={() => {
                  onDelete()
                  onOpenChange(false)
                }}
              >
                <Trash2 className="size-4" />
                삭제
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit">{isEdit ? '저장' : '추가'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
