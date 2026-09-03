import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import { ChevronRight, Plus, Receipt } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatMoney } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useTrip, useTripMembers } from '@/features/trips/api'
import { useExpenses } from '@/features/expenses/api'
import {
  ExpenseFormDrawer,
  type ExpenseInput,
} from '@/features/expenses/ExpenseFormDrawer'
import { SettlementPanel } from '@/features/expenses/SettlementPanel'
import { categoryLabel, categoryOptions } from '@/features/expenses/display'
import { computeBalances, minimalTransfers } from '@/features/expenses/settlement'
import type { Expense, ExpenseCategory } from '@/types'

/**
 * 경비·정산 (S-07) — 마크업 + 기능 단계.
 * 지출 추가/수정/삭제, 균등·비율·직접 분할, 순잔액·권장 송금 계산을
 * 로컬 상태 + 클라이언트 정산 알고리즘으로 처리한다.
 * 저장 mutation·영수증 업로드·환율 스냅샷은 다음 API 단계에서 연결한다.
 */
export function ExpensesPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const currentUserId = useAuthStore((s) => s.user?.id ?? '')
  const { data: trip } = useTrip(tripId)
  const { data: members = [] } = useTripMembers(tripId)
  const { data: fetched, isLoading } = useExpenses(tripId)

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [category, setCategory] = useState<ExpenseCategory | 'all'>('all')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)

  useEffect(() => {
    if (fetched) setExpenses(fetched)
  }, [fetched])

  const baseCurrency = trip?.baseCurrency ?? 'KRW'
  const memberIds = useMemo(() => members.map((m) => m.userId), [members])

  const filtered = useMemo(
    () => expenses.filter((e) => category === 'all' || e.category === category),
    [expenses, category],
  )

  // 정산은 전체 지출 기준으로 계산한다.
  const balances = useMemo(
    () => computeBalances(expenses, memberIds),
    [expenses, memberIds],
  )
  const transfers = useMemo(() => minimalTransfers(balances), [balances])

  const totalBase = expenses.reduce((sum, e) => sum + e.baseAmountMinor, 0)
  const myBalance = balances.find((b) => b.userId === currentUserId)?.balanceMinor ?? 0

  function payerName(id: string) {
    return members.find((m) => m.userId === id)?.user.name ?? '알 수 없음'
  }

  function handleAdd() {
    setEditing(null)
    setDrawerOpen(true)
  }

  function handleEdit(expense: Expense) {
    setEditing(expense)
    setDrawerOpen(true)
  }

  function handleSave(input: ExpenseInput) {
    if (editing) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === editing.id ? { ...editing, ...input } : e)),
      )
      toast.success('경비를 수정했어요.')
    } else {
      const created: Expense = { id: crypto.randomUUID(), tripId: tripId!, ...input }
      setExpenses((prev) => [created, ...prev])
      toast.success('경비를 추가했어요.')
    }
  }

  function handleDelete(expense: Expense) {
    setExpenses((prev) => prev.filter((e) => e.id !== expense.id))
    toast.success('경비를 삭제했어요.')
  }

  return (
    <>
      <PageHeader
        title="경비·정산"
        action={
          <Button onClick={handleAdd}>
            <Plus className="size-4" />경비 추가
          </Button>
        }
      />

      {/* 요약 */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted">총 지출 (기준 통화)</p>
          <p className="mono mt-1 text-xl font-semibold tracking-tight">
            {formatMoney(totalBase, baseCurrency)}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted">내 순잔액</p>
          <p
            className={cn(
              'mono mt-1 text-xl font-semibold tracking-tight',
              myBalance === 0 ? 'text-fg' : myBalance > 0 ? 'text-success' : 'text-danger',
            )}
          >
            {myBalance > 0 ? '+' : ''}
            {formatMoney(myBalance, baseCurrency)}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 지출 목록 */}
        <div>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold tracking-tight">지출 내역</h2>
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory | 'all')}
              className="h-9 w-auto text-sm"
              aria-label="카테고리 필터"
            >
              <option value="all">카테고리 전체</option>
              {categoryOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {isLoading ? (
            <div className="grid gap-2">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Receipt />}
              title="아직 기록된 지출이 없어요"
              description="첫 지출을 추가하면 자동으로 정산이 계산됩니다."
              action={
                <Button onClick={handleAdd}>
                  <Plus className="size-4" />경비 추가
                </Button>
              }
            />
          ) : (
            <ul className="grid gap-2">
              {filtered.map((exp) => (
                <li key={exp.id}>
                  <button
                    type="button"
                    onClick={() => handleEdit(exp)}
                    className="flex w-full items-center gap-3 rounded-md border border-border bg-surface p-3 text-left shadow-sm transition-colors hover:border-border-strong focus-visible:outline-none"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <strong className="truncate text-sm">{exp.title}</strong>
                        <Badge variant="neutral" className="shrink-0">
                          {categoryLabel[exp.category]}
                        </Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {payerName(exp.payerId)} 결제 · {format(parseISO(exp.spentAt), 'M/d')}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="mono block text-sm font-semibold">
                        {formatMoney(exp.amountMinor, exp.currency)}
                      </span>
                      {exp.currency !== baseCurrency && (
                        <span className="mono block text-[11px] text-muted">
                          ≈ {formatMoney(exp.baseAmountMinor, baseCurrency)}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="size-4 shrink-0 text-muted" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 정산 */}
        <SettlementPanel
          balances={balances}
          transfers={transfers}
          members={members}
          baseCurrency={baseCurrency}
          currentUserId={currentUserId}
        />
      </div>

      <ExpenseFormDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        expense={editing}
        members={members}
        currentUserId={currentUserId}
        onSave={handleSave}
        onDelete={editing ? () => handleDelete(editing) : undefined}
      />
    </>
  )
}
