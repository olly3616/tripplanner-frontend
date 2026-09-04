import { describe, it, expect } from 'vitest'
import { formatTripRange, tripStatusLabel, tripStatusVariant } from './display'

describe('formatTripRange', () => {
  it('같은 달이면 종료일은 일자만 표시한다', () => {
    expect(formatTripRange('2026-08-14', '2026-08-17')).toBe('2026. 08. 14–17')
  })

  it('달이 다르면 종료일도 전체 표시한다', () => {
    expect(formatTripRange('2026-08-30', '2026-09-02')).toBe('2026. 08. 30–2026. 09. 02')
  })

  it('빈 값이면 빈 문자열을 반환한다', () => {
    expect(formatTripRange('', '')).toBe('')
  })
})

describe('여행 상태 매핑', () => {
  it('상태 라벨이 정의되어 있다', () => {
    expect(tripStatusLabel.upcoming).toBe('예정')
    expect(tripStatusLabel.ongoing).toBe('진행 중')
    expect(tripStatusLabel.completed).toBe('완료')
  })

  it('상태별 뱃지 변형이 정의되어 있다', () => {
    expect(tripStatusVariant.ongoing).toBe('confirmed')
    expect(tripStatusVariant.upcoming).toBe('considering')
    expect(tripStatusVariant.completed).toBe('closed')
  })
})
