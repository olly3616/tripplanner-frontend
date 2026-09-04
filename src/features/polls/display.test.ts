import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { isPollClosed, totalVotes, pollMeta } from './display'
import type { Poll } from '@/types'

function poll(partial: Partial<Poll>): Poll {
  return {
    id: 'poll',
    tripId: 't1',
    title: '투표',
    options: [
      { id: 'o1', label: 'A', voteCount: 2 },
      { id: 'o2', label: 'B', voteCount: 1 },
    ],
    multiple: false,
    anonymous: false,
    closesAt: '2026-09-20T09:00:00Z',
    closed: false,
    myVotes: [],
    ...partial,
  }
}

describe('totalVotes', () => {
  it('선택지 표 수를 합산한다', () => {
    expect(totalVotes(poll({}))).toBe(3)
  })
})

describe('isPollClosed', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-04T00:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('마감 시각이 미래면 열려 있다', () => {
    expect(isPollClosed(poll({ closesAt: '2026-09-20T09:00:00Z' }))).toBe(false)
  })

  it('마감 시각이 지났으면 닫혀 있다', () => {
    expect(isPollClosed(poll({ closesAt: '2026-08-11T09:00:00Z' }))).toBe(true)
  })

  it('closed 플래그가 true 면 시각과 무관하게 닫혀 있다', () => {
    expect(isPollClosed(poll({ closed: true, closesAt: '2026-12-01T00:00:00Z' }))).toBe(true)
  })
})

describe('pollMeta', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-04T00:00:00Z'))
  })
  afterEach(() => vi.useRealTimers())

  it('복수 선택·익명·총 표수를 문자열에 포함한다', () => {
    const meta = pollMeta(poll({ multiple: true, anonymous: true }))
    expect(meta).toContain('복수 선택')
    expect(meta).toContain('익명')
    expect(meta).toContain('총 3표')
  })

  it('마감된 투표는 마감됨을 표시한다', () => {
    expect(pollMeta(poll({ closed: true }))).toContain('마감됨')
  })
})
