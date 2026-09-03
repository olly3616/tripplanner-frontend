import type { ExpenseCategory, SplitMethod } from '@/types'

export const categoryLabel: Record<ExpenseCategory, string> = {
  lodging: '숙소',
  food: '식사',
  transport: '교통',
  activity: '액티비티',
  shopping: '쇼핑',
  etc: '기타',
}

export const categoryOptions = (
  Object.keys(categoryLabel) as ExpenseCategory[]
).map((value) => ({ value, label: categoryLabel[value] }))

export const splitMethodLabel: Record<SplitMethod, string> = {
  equal: '균등',
  ratio: '비율',
  exact: '직접 금액',
}

export const CURRENCIES = ['KRW', 'JPY', 'USD', 'EUR'] as const

/**
 * 기준 통화(KRW) 환산용 임시 환율.
 * 실제로는 지출일 환율을 FX API 로 조회해 스냅샷 저장한다(F-07).
 * 여기서는 마크업 단계라 고정값을 사용한다.
 */
export const MOCK_RATES_TO_KRW: Record<string, number> = {
  KRW: 1,
  JPY: 9.1,
  USD: 1350,
  EUR: 1450,
}

/** 지출 통화 최소 단위 금액 → 기준 통화(KRW) 최소 단위로 환산 */
export function toBaseKRW(amountMinor: number, currency: string): number {
  const rate = MOCK_RATES_TO_KRW[currency] ?? 1
  return Math.round(amountMinor * rate)
}
