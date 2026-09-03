import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Field } from '@/components/ui/field'

export interface PollInput {
  title: string
  options: string[]
  multiple: boolean
  anonymous: boolean
  closesAt: string // ISO
}

interface CreatePollDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (input: PollInput) => void
}

/** 기본 마감: 3일 후 정오 (datetime-local 형식) */
function defaultCloseLocal(): string {
  const d = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  d.setHours(12, 0, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function CreatePollDialog({ open, onOpenChange, onCreate }: CreatePollDialogProps) {
  const [title, setTitle] = useState('')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [multiple, setMultiple] = useState(false)
  const [anonymous, setAnonymous] = useState(false)
  const [closesAt, setClosesAt] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle('')
    setOptions(['', ''])
    setMultiple(false)
    setAnonymous(false)
    setClosesAt(defaultCloseLocal())
    setTouched(false)
  }, [open])

  const validOptions = options.map((o) => o.trim()).filter(Boolean)
  const closeValid = closesAt !== '' && new Date(closesAt).getTime() > Date.now()
  const canCreate = title.trim() !== '' && validOptions.length >= 2 && closeValid

  function updateOption(i: number, value: string) {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? value : o)))
  }

  function handleCreate() {
    if (!canCreate) {
      setTouched(true)
      return
    }
    onCreate({
      title: title.trim(),
      options: validOptions,
      multiple,
      anonymous,
      closesAt: new Date(closesAt).toISOString(),
    })
    toast.success('투표를 만들었어요.')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullScreenOnMobile>
        <DialogHeader>
          <DialogTitle>투표 만들기</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Field
            label="제목"
            htmlFor="poll-title"
            error={touched && !title.trim() ? '제목을 입력하세요.' : undefined}
          >
            <Input
              id="poll-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 첫날 저녁 식당은 어디로 할까요?"
              invalid={touched && !title.trim()}
            />
          </Field>

          <div className="grid gap-2">
            <p className="text-sm font-semibold text-secondary">선택지</p>
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`선택지 ${i + 1}`}
                  aria-label={`선택지 ${i + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`선택지 ${i + 1} 삭제`}
                    onClick={() => setOptions((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <X className="size-4" />
                  </Button>
                )}
              </div>
            ))}
            {touched && validOptions.length < 2 && (
              <p className="text-xs text-danger">선택지를 2개 이상 입력하세요.</p>
            )}
            <Button
              variant="outline"
              size="sm"
              className="justify-self-start"
              onClick={() => setOptions((prev) => [...prev, ''])}
            >
              <Plus className="size-4" />
              선택지 추가
            </Button>
          </div>

          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">복수 선택 허용</span>
            <Switch checked={multiple} onCheckedChange={setMultiple} aria-label="복수 선택 허용" />
          </label>
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm">익명 투표</span>
            <Switch checked={anonymous} onCheckedChange={setAnonymous} aria-label="익명 투표" />
          </label>

          <Field
            label="마감 시각"
            htmlFor="poll-close"
            error={touched && !closeValid ? '마감 시각은 현재 이후여야 합니다.' : undefined}
          >
            <Input
              id="poll-close"
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              invalid={touched && !closeValid}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button disabled={!canCreate} onClick={handleCreate}>
            만들기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
