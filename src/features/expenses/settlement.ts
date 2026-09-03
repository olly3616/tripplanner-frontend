import type { Expense, SettlementBalance, SettlementTransfer } from '@/types'

/**
 * 정수 총액을 가중치 비율대로 분배한다(최대 잔여 방식).
 * 반올림 오차 없이 각 몫의 합이 정확히 total 과 같아지도록 보장한다.
 */
export function allocate(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  if (sum <= 0) return weights.map(() => 0)
  const exact = weights.map((w) => (total * w) / sum)
  const floors = exact.map(Math.floor)
  let remainder = total - floors.reduce((a, b) => a + b, 0)
  const order = exact
    .map((e, i) => ({ i, frac: e - Math.floor(e) }))
    .sort((a, b) => b.frac - a.frac)
  const result = [...floors]
  for (let k = 0; k < remainder; k++) result[order[k % order.length].i]++
  return result
}

/**
 * 각 사용자의 순잔액(기준 통화 최소 단위)을 계산한다.
 * 순잔액 = 지급액 - 부담액. 모든 순잔액의 합은 항상 0이다.
 *
 * 각 지출의 기준 통화 환산액(baseAmountMinor)을 참여자 분할 비율대로
 * 최대 잔여 방식으로 나눠 부담액을 배분한다.
 */
export function computeBalances(
  expenses: Expense[],
  memberIds: string[],
): SettlementBalance[] {
  const balance = new Map<string, number>(memberIds.map((id) => [id, 0]))

  for (const exp of expenses) {
    // 결제자는 기준 통화 환산 총액을 지급
    balance.set(exp.payerId, (balance.get(exp.payerId) ?? 0) + exp.baseAmountMinor)

    // 참여자별 부담액을 기준 통화로 배분
    const userIds = exp.splits.map((s) => s.userId)
    const weights = exp.splits.map((s) => s.amountMinor)
    const owedBase = allocate(exp.baseAmountMinor, weights)
    userIds.forEach((uid, idx) => {
      balance.set(uid, (balance.get(uid) ?? 0) - owedBase[idx])
    })
  }

  return memberIds.map((id) => ({ userId: id, balanceMinor: balance.get(id) ?? 0 }))
}

/**
 * 순잔액으로부터 송금 횟수를 줄인 권장 송금 목록을 생성한다.
 * 가장 큰 채무자와 채권자를 매칭해 min(|채무|, 채권)만큼 송금하며 반복한다.
 * 적용 후 모든 잔액은 0이 된다.
 */
export function minimalTransfers(balances: SettlementBalance[]): SettlementTransfer[] {
  const creditors = balances
    .filter((b) => b.balanceMinor > 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.balanceMinor - a.balanceMinor)
  const debtors = balances
    .filter((b) => b.balanceMinor < 0)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.balanceMinor - b.balanceMinor) // 가장 음수부터

  const transfers: SettlementTransfer[] = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci]
    const debt = debtors[di]
    const amount = Math.min(credit.balanceMinor, -debt.balanceMinor)
    if (amount > 0) {
      transfers.push({
        fromUserId: debt.userId,
        toUserId: credit.userId,
        amountMinor: amount,
      })
      credit.balanceMinor -= amount
      debt.balanceMinor += amount
    }
    if (credit.balanceMinor === 0) ci++
    if (debt.balanceMinor === 0) di++
  }

  return transfers
}
