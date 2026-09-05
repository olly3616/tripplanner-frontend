import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field } from '@/components/ui/field'
import { useLogin, useSignup } from '@/features/auth/api'
import { isApiError } from '@/lib/api/client'

const schema = z.object({
  email: z.string().min(1, '이메일을 입력하세요.').email('올바른 이메일 형식이 아닙니다.'),
  password: z.string().min(1, '비밀번호를 입력하세요.'),
})

type FormValues = z.infer<typeof schema>

type Mode = 'login' | 'signup'

export function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')
  const login = useLogin()
  const signup = useSignup()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/trips'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'olly3616@pilsa.co.kr', password: '' },
  })

  const isSignup = mode === 'signup'
  const pending = login.isPending || signup.isPending

  async function onSubmit(values: FormValues) {
    try {
      if (isSignup) {
        await signup.mutateAsync(values)
        // 가입 직후 프로필 입력(온보딩)으로 이동
        navigate('/onboarding', { replace: true })
      } else {
        await login.mutateAsync(values)
        navigate(from, { replace: true })
      }
    } catch (err) {
      const fallback = isSignup ? '가입에 실패했습니다.' : '로그인에 실패했습니다.'
      const message = isApiError(err) ? (err.response?.data?.message ?? fallback) : fallback
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
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                invalid={!!errors.password}
                {...register('password')}
              />
            </Field>
            <Button type="submit" className="mt-1 w-full" disabled={pending}>
              {pending ? '처리 중…' : isSignup ? '가입하기' : '로그인'}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-secondary">
            {isSignup ? '이미 계정이 있으신가요?' : '아직 계정이 없으신가요?'}{' '}
            <button
              type="button"
              onClick={() => setMode(isSignup ? 'login' : 'signup')}
              className="font-semibold text-accent-active hover:underline"
            >
              {isSignup ? '로그인' : '가입하기'}
            </button>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-muted">
          목(Mock) 모드: 아무 이메일·비밀번호로 진행할 수 있어요.
        </p>
      </div>
    </div>
  )
}
