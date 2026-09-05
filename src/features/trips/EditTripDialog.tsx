import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
import { useUpdateTrip } from './api'
import type { Trip } from '@/types'

const CURRENCIES = ['KRW', 'JPY', 'USD', 'EUR'] as const
const TIMEZONES = ['Asia/Seoul', 'Asia/Tokyo', 'America/Los_Angeles', 'Europe/Paris']

const schema = z
  .object({
    title: z.string().min(1, '여행 이름을 입력하세요.'),
    destination: z.string().min(1, '목적지를 입력하세요.'),
    startsOn: z.string().min(1, '시작일을 선택하세요.'),
    endsOn: z.string().min(1, '종료일을 선택하세요.'),
    baseCurrency: z.enum(CURRENCIES),
    timezone: z.string().min(1),
  })
  .refine((v) => v.endsOn >= v.startsOn, {
    message: '종료일은 시작일과 같거나 이후여야 합니다.',
    path: ['endsOn'],
  })

type FormValues = z.infer<typeof schema>

interface EditTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  trip: Trip
}

export function EditTripDialog({ open, onOpenChange, trip }: EditTripDialogProps) {
  const updateTrip = useUpdateTrip(trip.id)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: trip.title,
      destination: trip.destination,
      startsOn: trip.startsOn,
      endsOn: trip.endsOn,
      baseCurrency: (CURRENCIES as readonly string[]).includes(trip.baseCurrency)
        ? (trip.baseCurrency as (typeof CURRENCIES)[number])
        : 'KRW',
      timezone: trip.timezone,
    },
  })

  // 열릴 때 현재 여행 값으로 재설정
  useEffect(() => {
    if (!open) return
    reset({
      title: trip.title,
      destination: trip.destination,
      startsOn: trip.startsOn,
      endsOn: trip.endsOn,
      baseCurrency: (CURRENCIES as readonly string[]).includes(trip.baseCurrency)
        ? (trip.baseCurrency as (typeof CURRENCIES)[number])
        : 'KRW',
      timezone: trip.timezone,
    })
  }, [open, trip, reset])

  async function onSubmit(values: FormValues) {
    try {
      await updateTrip.mutateAsync(values)
      toast.success('여행 정보를 수정했어요.')
      onOpenChange(false)
    } catch {
      toast.error('수정에 실패했어요. 다시 시도해 주세요.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullScreenOnMobile>
        <DialogHeader>
          <DialogTitle>여행 정보 수정</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="여행 이름" htmlFor="edit-title" error={errors.title?.message}>
            <Input id="edit-title" invalid={!!errors.title} {...register('title')} />
          </Field>
          <Field label="목적지" htmlFor="edit-destination" error={errors.destination?.message}>
            <Input id="edit-destination" invalid={!!errors.destination} {...register('destination')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="시작일" htmlFor="edit-startsOn" error={errors.startsOn?.message}>
              <Input id="edit-startsOn" type="date" invalid={!!errors.startsOn} {...register('startsOn')} />
            </Field>
            <Field label="종료일" htmlFor="edit-endsOn" error={errors.endsOn?.message}>
              <Input id="edit-endsOn" type="date" invalid={!!errors.endsOn} {...register('endsOn')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="기준 통화" htmlFor="edit-currency">
              <Select id="edit-currency" {...register('baseCurrency')}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="시간대" htmlFor="edit-timezone">
              <Select id="edit-timezone" {...register('timezone')}>
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={updateTrip.isPending}>
              {updateTrip.isPending ? '저장 중…' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
