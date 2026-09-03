import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Tailwind 클래스 병합 유틸 (shadcn 규약) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 통화 최소 단위(정수)를 표시 문자열로 변환한다.
 * 금액은 항상 최소 단위 정수로 저장하고, 표시할 때만 변환한다.
 * KRW/JPY는 소수 없음(0), USD/EUR 등은 2자리.
 */
const CURRENCY_FRACTION: Record<string, number> = {
  KRW: 0,
  JPY: 0,
  USD: 2,
  EUR: 2,
  GBP: 2,
}

export function fractionDigits(currency: string): number {
  return CURRENCY_FRACTION[currency] ?? 2
}

export function formatMoney(amountMinor: number, currency: string): string {
  const digits = fractionDigits(currency)
  const value = amountMinor / 10 ** digits
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value)
}
