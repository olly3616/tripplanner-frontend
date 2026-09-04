import { describe, it, expect } from 'vitest'
import { toBaseKRW, categoryLabel, splitMethodLabel } from './display'

describe('toBaseKRW', () => {
  it('KRW 는 그대로 반환한다', () => {
    expect(toBaseKRW(240000, 'KRW')).toBe(240000)
  })

  it('JPY 는 환율을 곱해 반올림한다', () => {
    // 4800 * 9.1 = 43680
    expect(toBaseKRW(4800, 'JPY')).toBe(43680)
  })

  it('알 수 없는 통화는 1배로 처리한다', () => {
    expect(toBaseKRW(1000, 'XYZ')).toBe(1000)
  })
})

describe('라벨 매핑', () => {
  it('카테고리 라벨이 모두 정의되어 있다', () => {
    expect(categoryLabel.lodging).toBe('숙소')
    expect(categoryLabel.food).toBe('식사')
    expect(categoryLabel.etc).toBe('기타')
  })

  it('분할 방식 라벨이 정의되어 있다', () => {
    expect(splitMethodLabel.equal).toBe('균등')
    expect(splitMethodLabel.ratio).toBe('비율')
    expect(splitMethodLabel.exact).toBe('직접 금액')
  })
})
