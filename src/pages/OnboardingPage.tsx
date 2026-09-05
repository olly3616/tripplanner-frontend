import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { useAuthStore } from '@/stores/auth'
import { useUpdateProfile } from '@/features/auth/api'

const CURRENCIES = ['KRW', 'JPY', 'USD', 'EUR'] as const
const TIMEZONES = ['Asia/Seoul', 'Asia/Tokyo', 'America/Los_Angeles', 'Europe/Paris']

const schema = z.object({
  name: z.string().min(1, '표시 이름을 입력하세요.'),
  defaultCurrency: z.enum(CURRENCIES),
  timezone: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

/**
 * 온보딩 (S-01) — 가입 직후 표시 이름·기본 통화·시간대를 입력한다.
 */
export function OnboardingPage() {
  const user = useAuthStore((s) => s.user)
  const updateProfile = useUpdateProfile()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? '',
      defaultCurrency: (CURRENCIES as readonly string[]).includes(user?.defaultCurrency ?? '')
        ? (user!.defaultCurrency as (typeof CURRENCIES)[number])
        : 'KRW',
      timezone: user?.timezone ?? 'Asia/Seoul',
    },
  })

  async function onSubmit(values: FormValues) {
    try {
      await updateProfile.mutateAsync(values)
      toast.success('환영해요! 첫 여행을 만들어 보세요.')
      navigate('/trips', { replace: true })
    } catch {
      toast.error('저장에 실패했어요. 다시 시도해 주세요.')
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-accent-active">
            환영합니다
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-[-0.035em]">
            프로필을 완성해 주세요
          </h1>
          <p className="mt-1.5 text-sm text-secondary">
            멤버에게 표시될 이름과 기본 설정을 정해요. 나중에 언제든 바꿀 수 있어요.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <Field label="표시 이름" htmlFor="ob-name" error={errors.name?.message}>
              <Input
                id="ob-name"
                placeholder="예: 김지민"
                invalid={!!errors.name}
                {...register('name')}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="기본 통화" htmlFor="ob-currency">
                <Select id="ob-currency" {...register('defaultCurrency')}>
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="시간대" htmlFor="ob-timezone">
                <Select id="ob-timezone" {...register('timezone')}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button type="submit" className="mt-1 w-full" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? '저장 중…' : '시작하기'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
