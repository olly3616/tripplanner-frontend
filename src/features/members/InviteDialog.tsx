import { useState } from 'react'
import { Copy, Link2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Field } from '@/components/ui/field'
import { assignableRoleOptions } from './display'
import type { Role } from '@/types'

interface InviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (email: string, role: Role) => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EXPIRY_OPTIONS = [
  { value: '1', label: '1일 후' },
  { value: '7', label: '7일 후' },
  { value: '30', label: '30일 후' },
  { value: '0', label: '만료 없음' },
]

export function InviteDialog({ open, onOpenChange, onInvite }: InviteDialogProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('editor')
  const [touched, setTouched] = useState(false)
  const [expiry, setExpiry] = useState('7')

  const emailValid = EMAIL_RE.test(email.trim())

  function handleInvite() {
    if (!emailValid) {
      setTouched(true)
      return
    }
    onInvite(email.trim(), role)
    toast.success(`${email.trim()} 님에게 초대를 보냈어요.`)
    setEmail('')
    setTouched(false)
  }

  // 마크업 단계: 실제 토큰 대신 예시 링크를 생성한다. (API 단계에서 서버 발급 토큰으로 대체)
  const inviteLink = `https://voyage.app/invite/${expiry === '0' ? 'perm' : `d${expiry}`}-demo-token`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      toast.success('초대 링크를 복사했어요.')
    } catch {
      toast.error('복사에 실패했어요.')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullScreenOnMobile>
        <DialogHeader>
          <DialogTitle>동행자 초대</DialogTitle>
        </DialogHeader>

        <div className="grid gap-5">
          {/* 이메일 초대 */}
          <div className="grid gap-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
              <Mail className="size-4" />
              이메일로 초대
            </p>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Field
                label="이메일"
                htmlFor="invite-email"
                error={touched && !emailValid ? '올바른 이메일을 입력하세요.' : undefined}
              >
                <Input
                  id="invite-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  invalid={touched && !emailValid}
                  placeholder="friend@example.com"
                />
              </Field>
              <Field label="역할" htmlFor="invite-role">
                <Select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-28"
                >
                  {assignableRoleOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Button onClick={handleInvite} className="justify-self-start">
              초대 보내기
            </Button>
          </div>

          <div className="h-px bg-border" />

          {/* 초대 링크 */}
          <div className="grid gap-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-secondary">
              <Link2 className="size-4" />
              초대 링크
            </p>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Field label="만료" htmlFor="invite-expiry">
                <Select
                  id="invite-expiry"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                >
                  {EXPIRY_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <div className="flex items-end">
                <Button variant="outline" onClick={copyLink}>
                  <Copy className="size-4" />
                  링크 복사
                </Button>
              </div>
            </div>
            <p className="truncate rounded-md bg-subtle px-3 py-2 text-xs text-muted">
              {inviteLink}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
