import { useEffect, useMemo, useState } from 'react'
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
import { cn, fractionDigits, formatMoney } from '@/lib/utils'
import { allocate } from './settlement'
import {
  CURRENCIES,
  categoryOptions,
  splitMethodLabel,
  toBaseKRW,
  MOCK_RATES_TO_KRW,
} from './display'
import type {
  Expense,
  ExpenseCategory,
  SplitMethod,
  TripMember,
} from '@/types'

export interface ExpenseInput {
  title: string
  amountMinor: number
  currency: string
  payerId: string
  category: ExpenseCategory
  spentAt: string
  splitMethod: SplitMethod
  splits: { userId: string; amountMinor: number }[]
  exchangeRate: number
  baseAmountMinor: number
  note?: string
}

interface ExpenseFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense: Expense | null
  members: TripMember[]
  currentUserId: string
  onSave: (input: ExpenseInput) => void
  onDelete?: () => void
}

function parseAmountMinor(value: string, currency: string): number {
  const num = parseFloat(value)
  if (!Number.isFinite(num) || num < 0) return 0
  return Math.round(num * 10 ** fractionDigits(currency))
}

function minorToDisplay(amountMinor: number, currency: string): string {
  const digits = fractionDigits(currency)
  return (amountMinor / 10 ** digits).toString()
}

export function ExpenseFormDrawer({
  open,
  onOpenChange,
  expense,
  members,
  currentUserId,
  onSave,
  onDelete,
}: ExpenseFormDrawerProps) {
  const isEdit = Boolean(expense)

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<string>('KRW')
  const [payerId, setPayerId] = useState(currentUserId)
  const [spentAt, setSpentAt] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('food')
  const [note, setNote] = useState('')
  const [splitMethod, setSplitMethod] = useState<SplitMethod>('equal')
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [weights, setWeights] = useState<Record<string, string>>({})
  const [exacts, setExacts] = useState<Record<string, string>>({})

  // 열릴 때 대상 값(또는 기본값)으로 초기화
  useEffect(() => {
    if (!open) return
    if (expense) {
      setTitle(expense.title)
      setAmount(minorToDisplay(expense.amountMinor, expense.currency))
      setCurrency(expense.currency)
      setPayerId(expense.payerId)
      setSpentAt(expense.spentAt.slice(0, 10))
      setCategory(expense.category)
      setNote(expense.note ?? '')
      setSplitMethod(expense.splitMethod)
      const sel: Record<string, boolean> = {}
      const w: Record<string, string> = {}
      const ex: Record<string, string> = {}
      for (const s of expense.splits) {
        sel[s.userId] = true
        w[s.userId] = String(s.amountMinor)
        ex[s.userId] = minorToDisplay(s.amountMinor, expense.currency)
      }
      setSelected(sel)
      setWeights(w)
      setExacts(ex)
    } else {
      setTitle('')
      setAmount('')
      setCurrency('KRW')
      setPayerId(currentUserId)
      setSpentAt(new Date().toISOString().slice(0, 10))
      setCategory('food')
      setNote('')
      setSplitMethod('equal')
      setSelected(Object.fromEntries(members.map((m) => [m.userId, true])))
      setWeights({})
      setExacts({})
    }
  }, [open, expense, members, currentUserId])

  const amountMinor = parseAmountMinor(amount, currency)
  const participantIds = members.map((m) => m.userId).filter((id) => selected[id])

  // 분할 방식별 참여자 몫(최소 단위) 계산
  const shares = useMemo(() => {
    const map = new Map<string, number>()
    if (participantIds.length === 0) return map
    if (splitMethod === 'equal') {
      const parts = allocate(amountMinor, participantIds.map(() => 1))
      participantIds.forEach((id, i) => map.set(id, parts[i]))
    } else if (splitMethod === 'ratio') {
      const w = participantIds.map((id) => {
        const n = parseFloat(weights[id] ?? '')
        return Number.isFinite(n) && n > 0 ? n : 0
      })
      const parts = allocate(amountMinor, w)
      participantIds.forEach((id, i) => map.set(id, parts[i]))
    } else {
      participantIds.forEach((id) =>
        map.set(id, parseAmountMinor(exacts[id] ?? '', currency)),
      )
    }
    return map
  }, [participantIds, splitMethod, amountMinor, weights, exacts, currency])

  const sumSplits = Array.from(shares.values()).reduce((a, b) => a + b, 0)
  const remaining = amountMinor - sumSplits

  const canSave =
    title.trim() !== '' &&
    amountMinor > 0 &&
    participantIds.length > 0 &&
    // 직접 금액은 합계가 정확히 일치해야 함. 균등/비율은 자동 배분되어 항상 일치.
    (splitMethod !== 'exact' || remaining === 0)

  function toggleParticipant(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleSave() {
    const splits = participantIds.map((id) => ({
      userId: id,
      amountMinor: shares.get(id) ?? 0,
    }))
    onSave({
      title: title.trim(),
      amountMinor,
      currency,
      payerId,
      category,
      spentAt: new Date(spentAt).toISOString(),
      splitMethod,
      splits,
      exchangeRate: MOCK_RATES_TO_KRW[currency] ?? 1,
      baseAmountMinor: toBaseKRW(amountMinor, currency),
      note: note.trim() || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fullScreenOnMobile className="max-w-[520px] max-sm:overflow-y-auto sm:max-h-[90vh] sm:overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? '경비 수정' : '경비 추가'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Field label="제목" htmlFor="exp-title">
            <Input id="exp-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 숙소비" />
          </Field>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="금액" htmlFor="exp-amount">
              <Input
                id="exp-amount"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
              />
            </Field>
            <Field label="통화" htmlFor="exp-currency">
              <Select
                id="exp-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-24"
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {currency !== 'KRW' && amountMinor > 0 && (
            <p className="-mt-2 text-xs text-muted">
              기준 통화 환산 약 {formatMoney(toBaseKRW(amountMinor, currency), 'KRW')} (임시 환율)
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="결제자" htmlFor="exp-payer">
              <Select id="exp-payer" value={payerId} onChange={(e) => setPayerId(e.target.value)}>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="날짜" htmlFor="exp-date">
              <Input id="exp-date" type="date" value={spentAt} onChange={(e) => setSpentAt(e.target.value)} />
            </Field>
          </div>

          <Field label="카테고리" htmlFor="exp-category">
            <Select
              id="exp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            >
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </Field>

          {/* 분할 방식 */}
          <div>
            <p className="mb-2 text-sm font-semibold text-secondary">분할 방식</p>
            <div className="mb-3 grid grid-cols-3 gap-1 rounded-md bg-subtle p-1">
              {(['equal', 'ratio', 'exact'] as SplitMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSplitMethod(m)}
                  className={cn(
                    'rounded-sm py-1.5 text-sm font-medium transition-colors',
                    splitMethod === m
                      ? 'bg-surface text-fg shadow-sm'
                      : 'text-muted hover:text-fg',
                  )}
                >
                  {splitMethodLabel[m]}
                </button>
              ))}
            </div>

            <ul className="grid gap-1.5">
              {members.map((m) => {
                const on = !!selected[m.userId]
                const share = shares.get(m.userId) ?? 0
                return (
                  <li
                    key={m.userId}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2',
                      on ? 'border-border' : 'border-border/60 opacity-55',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleParticipant(m.userId)}
                      className="size-4 accent-[var(--accent)]"
                      aria-label={`${m.user.name} 참여`}
                    />
                    <span className="min-w-0 flex-1 truncate text-sm">{m.user.name}</span>

                    {on && splitMethod === 'ratio' && (
                      <Input
                        aria-label={`${m.user.name} 비율`}
                        inputMode="decimal"
                        value={weights[m.userId] ?? ''}
                        onChange={(e) =>
                          setWeights((prev) => ({ ...prev, [m.userId]: e.target.value }))
                        }
                        placeholder="1"
                        className="h-9 w-16 text-right"
                      />
                    )}
                    {on && splitMethod === 'exact' && (
                      <Input
                        aria-label={`${m.user.name} 금액`}
                        inputMode="decimal"
                        value={exacts[m.userId] ?? ''}
                        onChange={(e) =>
                          setExacts((prev) => ({ ...prev, [m.userId]: e.target.value }))
                        }
                        placeholder="0"
                        className="h-9 w-24 text-right"
                      />
                    )}
                    {on && (
                      <span className="mono w-24 shrink-0 text-right text-sm text-secondary">
                        {formatMoney(share, currency)}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>

            {/* 합계 · 남은 금액 즉시 검증 */}
            <div
              className={cn(
                'mt-2 flex items-center justify-between rounded-md px-3 py-2 text-sm',
                remaining === 0 ? 'bg-subtle text-secondary' : 'bg-[oklch(0.95_0.04_28)] text-danger',
              )}
            >
              <span>합계 {formatMoney(sumSplits, currency)}</span>
              <span className="mono font-semibold">
                {remaining === 0 ? '남은 금액 0' : `남은 금액 ${formatMoney(remaining, currency)}`}
              </span>
            </div>
          </div>

          <Field label="메모" htmlFor="exp-note">
            <Input id="exp-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="선택 사항" />
          </Field>
        </div>

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
          <Button type="button" disabled={!canSave} onClick={handleSave}>
            {isEdit ? '저장' : '추가'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
