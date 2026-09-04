import { describe, it, expect } from 'vitest'
import { fractionDigits, formatMoney } from './utils'

describe('fractionDigits', () => {
  it('통화별 소수 자릿수를 반환한다', () => {
    expect(fractionDigits('KRW')).toBe(0)
    expect(fractionDigits('JPY')).toBe(0)
    expect(fractionDigits('USD')).toBe(2)
    expect(fractionDigits('EUR')).toBe(2)
  })

  it('알 수 없는 통화는 2자리를 기본값으로 한다', () => {
    expect(fractionDigits('XYZ')).toBe(2)
  })
})

describe('formatMoney', () => {
  it('KRW 는 최소 단위 정수를 소수 없이 표시한다', () => {
    const out = formatMoney(1000, 'KRW')
    expect(out).toContain('1,000')
    expect(out).not.toContain('.')
  })

  it('USD 는 최소 단위(센트)를 소수 2자리로 표시한다', () => {
    // 123456 센트 = 1,234.56
    expect(formatMoney(123456, 'USD')).toContain('1,234.56')
  })

  it('JPY 는 소수 없이 표시한다', () => {
    const out = formatMoney(4800, 'JPY')
    expect(out).toContain('4,800')
    expect(out).not.toContain('.')
  })
})
