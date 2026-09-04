import { describe, it, expect } from 'vitest'
import { getTripDays, sortByOrder, itemTitle } from './display'
import type { ItineraryItem } from '@/types'

function item(partial: Partial<ItineraryItem>): ItineraryItem {
  return {
    id: 'i',
    tripId: 't1',
    date: '2026-08-14',
    sortOrder: 1,
    transport: 'none',
    version: 1,
    ...partial,
  }
}

describe('getTripDays', () => {
  it('시작~종료일을 포함한 날짜 배열을 만든다', () => {
    expect(getTripDays('2026-08-14', '2026-08-17')).toEqual([
      '2026-08-14',
      '2026-08-15',
      '2026-08-16',
      '2026-08-17',
    ])
  })

  it('하루짜리 여행은 한 날짜만 반환한다', () => {
    expect(getTripDays('2026-08-14', '2026-08-14')).toEqual(['2026-08-14'])
  })

  it('빈 값이면 빈 배열을 반환한다', () => {
    expect(getTripDays('', '')).toEqual([])
  })
})

describe('sortByOrder', () => {
  it('sortOrder 오름차순으로 정렬하며 원본을 변경하지 않는다', () => {
    const input = [item({ id: 'b', sortOrder: 3 }), item({ id: 'a', sortOrder: 1 })]
    const sorted = sortByOrder(input)
    expect(sorted.map((i) => i.id)).toEqual(['a', 'b'])
    expect(input[0].id).toBe('b') // 원본 불변
  })
})

describe('itemTitle', () => {
  it('장소명을 우선 사용한다', () => {
    expect(itemTitle(item({ place: { id: 'p1', name: '성산일출봉' }, note: '메모' }))).toBe('성산일출봉')
  })

  it('장소가 없으면 메모를 사용한다', () => {
    expect(itemTitle(item({ note: '숙소 체크인' }))).toBe('숙소 체크인')
  })

  it('장소·메모가 모두 없으면 기본값을 사용한다', () => {
    expect(itemTitle(item({}))).toBe('새 일정')
  })
})
