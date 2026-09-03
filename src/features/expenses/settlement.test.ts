import { describe, it, expect } from 'vitest'
import { allocate, computeBalances, minimalTransfers } from './settlement'
import type { Expense } from '@/types'

function expense(partial: Partial<Expense> & Pick<Expense, 'payerId' | 'baseAmountMinor' | 'splits'>): Expense {
  return {
    id: partial.id ?? 'e',
    tripId: 't1',
    title: partial.title ?? '지출',
    amountMinor: partial.amountMinor ?? partial.baseAmountMinor,
    currency: partial.currency ?? 'KRW',
    exchangeRate: partial.exchangeRate ?? 1,
    category: partial.category ?? 'etc',
    splitMethod: partial.splitMethod ?? 'equal',
    spentAt: partial.spentAt ?? '2026-08-14T00:00:00Z',
    ...partial,
  }
}

describe('allocate', () => {
  it('몫의 합이 항상 총액과 정확히 일치한다(반올림 오차 없음)', () => {
    const parts = allocate(100, [1, 1, 1]) // 100/3
    expect(parts.reduce((a, b) => a + b, 0)).toBe(100)
    expect(parts).toEqual([34, 33, 33]) // 최대 잔여가 앞쪽에 배분
  })

  it('가중치 0 합계는 0 배열을 반환한다', () => {
    expect(allocate(100, [0, 0])).toEqual([0, 0])
  })
})

describe('computeBalances', () => {
  it('모든 순잔액의 합은 0이다', () => {
    const expenses = [
      expense({ id: 'e1', payerId: 'a', baseAmountMinor: 30000, splits: [
        { userId: 'a', amountMinor: 10000 },
        { userId: 'b', amountMinor: 10000 },
        { userId: 'c', amountMinor: 10000 },
      ] }),
      expense({ id: 'e2', payerId: 'b', baseAmountMinor: 9000, splits: [
        { userId: 'a', amountMinor: 3000 },
        { userId: 'b', amountMinor: 3000 },
        { userId: 'c', amountMinor: 3000 },
      ] }),
    ]
    const balances = computeBalances(expenses, ['a', 'b', 'c'])
    expect(balances.reduce((s, b) => s + b.balanceMinor, 0)).toBe(0)
  })

  it('결제자 지급액 - 개인 부담액을 정확히 계산한다', () => {
    const expenses = [
      expense({ id: 'e1', payerId: 'a', baseAmountMinor: 30000, splits: [
        { userId: 'a', amountMinor: 10000 },
        { userId: 'b', amountMinor: 10000 },
        { userId: 'c', amountMinor: 10000 },
      ] }),
    ]
    const balances = computeBalances(expenses, ['a', 'b', 'c'])
    const map = Object.fromEntries(balances.map((b) => [b.userId, b.balanceMinor]))
    expect(map.a).toBe(20000) // 30000 지급 - 10000 부담
    expect(map.b).toBe(-10000)
    expect(map.c).toBe(-10000)
  })
})

describe('minimalTransfers', () => {
  it('권장 송금 적용 후 모든 잔액이 0이 된다', () => {
    const balances = [
      { userId: 'a', balanceMinor: 20000 },
      { userId: 'b', balanceMinor: -12000 },
      { userId: 'c', balanceMinor: -8000 },
    ]
    const transfers = minimalTransfers(balances)
    const net = Object.fromEntries(balances.map((b) => [b.userId, b.balanceMinor]))
    for (const t of transfers) {
      net[t.fromUserId] += t.amountMinor
      net[t.toUserId] -= t.amountMinor
    }
    expect(Object.values(net).every((v) => v === 0)).toBe(true)
  })

  it('채권자가 여러 명이어도 송금 총액이 채무 총액과 같다', () => {
    const balances = [
      { userId: 'a', balanceMinor: -15000 },
      { userId: 'b', balanceMinor: 10000 },
      { userId: 'c', balanceMinor: 5000 },
    ]
    const transfers = minimalTransfers(balances)
    const total = transfers.reduce((s, t) => s + t.amountMinor, 0)
    expect(total).toBe(15000)
  })
})
