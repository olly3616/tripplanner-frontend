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
import { Field } from '@/components/ui/field'
import { useCreateTrip } from './api'

const CURRENCIES = ['KRW', 'JPY', 'USD', 'EUR'] as const

const schema = z
  .object({
    title: z.string().min(1, '여행 이름을 입력하세요.'),
    destination: z.string().min(1, '목적지를 입력하세요.'),
    startsOn: z.string().min(1, '시작일을 선택하세요.'),
    endsOn: z.string().min(1, '종료일을 선택하세요.'),
    baseCurrency: z.enum(CURRENCIES),
    timezone: z.string().min(1),
  })
  // 종료일이 시작일보다 빠르면 저장 불가 (F-02 수용 기준)
  .refine((v) => v.endsOn >= v.startsOn, {
    message: '종료일은 시작일과 같거나 이후여야 합니다.',
    path: ['endsOn'],
  })

type FormValues = z.infer<typeof schema>

interface CreateTripDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (tripId: string) => void
}

export function CreateTripDialog({ open, onOpenChange, onCreated }: CreateTripDialogProps) {
  const createTrip = useCreateTrip()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      destination: '',
      startsOn: '',
      endsOn: '',
      baseCurrency: 'KRW',
      timezone: 'Asia/Seoul',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      const trip = await createTrip.mutateAsync(values)
      toast.success('여행을 만들었어요.')
      reset()
      onOpenChange(false)
      onCreated?.(trip.id)
    } catch {
      toast.error('여행 생성에 실패했습니다.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullScreenOnMobile>
        <DialogHeader>
          <DialogTitle>새 여행</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <Field label="여행 이름" htmlFor="title" error={errors.title?.message}>
            <Input id="title" placeholder="예: 제주 여름 여행" invalid={!!errors.title} {...register('title')} />
          </Field>
          <Field label="목적지" htmlFor="destination" error={errors.destination?.message}>
            <Input id="destination" placeholder="예: 제주특별자치도" invalid={!!errors.destination} {...register('destination')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="시작일" htmlFor="startsOn" error={errors.startsOn?.message}>
              <Input id="startsOn" type="date" invalid={!!errors.startsOn} {...register('startsOn')} />
            </Field>
            <Field label="종료일" htmlFor="endsOn" error={errors.endsOn?.message}>
              <Input id="endsOn" type="date" invalid={!!errors.endsOn} {...register('endsOn')} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="기준 통화" htmlFor="baseCurrency">
              <select
                id="baseCurrency"
                className="h-11 w-full rounded-md border border-border bg-surface px-3 text-fg hover:border-border-strong focus-visible:outline-none"
                {...register('baseCurrency')}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="시간대" htmlFor="timezone">
              <select
                id="timezone"
                className="h-11 w-full rounded-md border border-border bg-surface px-3 text-fg hover:border-border-strong focus-visible:outline-none"
                {...register('timezone')}
              >
                <option value="Asia/Seoul">Asia/Seoul</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/Paris">Europe/Paris</option>
              </select>
            </Field>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={createTrip.isPending}>
              {createTrip.isPending ? '저장 중…' : '여행 만들기'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
