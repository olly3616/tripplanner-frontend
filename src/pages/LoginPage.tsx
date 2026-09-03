import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { useLogin } from '@/features/auth/api'
import { isApiError } from '@/lib/api/client'

const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력하세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력하세요.'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/trips'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'olly3616@pilsa.co.kr', password: '' },
  })

  async function onSubmit(values: LoginForm) {
    try {
      await login.mutateAsync(values)
      navigate(from, { replace: true })
    } catch (err) {
      const message = isApiError(err)
        ? (err.response?.data?.message ?? '로그인에 실패했습니다.')
        : '로그인에 실패했습니다.'
      toast.error(message)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-5 py-10">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <p className="text-[28px] font-bold tracking-[-0.05em]">Voyage</p>
          <p className="mt-1 text-sm text-secondary">함께 계획하고, 가볍게 정산하세요</p>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => toast.info('소셜 로그인은 백엔드 연동 후 활성화됩니다.')}
          >
            Google로 계속하기
          </Button>

          <div className="my-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" />
            또는
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
            <Field label="이메일" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                invalid={!!errors.email}
                {...register('email')}
              />
            </Field>
            <Field label="비밀번호" htmlFor="password" error={errors.password?.message}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                invalid={!!errors.password}
                {...register('password')}
              />
            </Field>
            <Button type="submit" className="mt-1 w-full" disabled={login.isPending}>
              {login.isPending ? '로그인 중…' : '로그인'}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          목(Mock) 모드: 아무 비밀번호로 로그인할 수 있어요.
        </p>
      </div>
    </div>
  )
}
