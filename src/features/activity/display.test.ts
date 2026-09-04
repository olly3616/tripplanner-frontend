import { describe, it, expect } from 'vitest'
import { activityText, activityType } from './display'
import type { ActivityLog } from '@/types'

function log(partial: Partial<ActivityLog>): ActivityLog {
  return {
    id: 'a',
    tripId: 't1',
    actorId: 'u1',
    actor: { id: 'u1', name: '김지민' },
    action: 'expense.created',
    entityType: 'expense',
    entityId: 'e1',
    metadata: {},
    createdAt: '2026-08-14T09:00:00Z',
    ...partial,
  }
}

describe('activityType', () => {
  it('entityType 을 활동 유형으로 매핑한다', () => {
    expect(activityType(log({ entityType: 'expense' }))).toBe('expense')
    expect(activityType(log({ entityType: 'itinerary' }))).toBe('itinerary')
  })

  it('알 수 없는 유형은 member 로 처리한다', () => {
    expect(activityType(log({ entityType: 'unknown' }))).toBe('member')
  })
})

describe('activityText', () => {
  it('지출 생성 문장에 제목과 금액을 포함한다', () => {
    const text = activityText(
      log({ action: 'expense.created', metadata: { title: '숙소비', amount: '₩240,000' } }),
    )
    expect(text).toContain('숙소비')
    expect(text).toContain('₩240,000')
  })

  it('일정 순서 변경 문장을 만든다', () => {
    expect(activityText(log({ action: 'itinerary.reordered', metadata: { date: '8월 14일' } }))).toContain(
      '순서를 변경',
    )
  })

  it('멤버 합류 문장을 만든다', () => {
    expect(activityText(log({ action: 'member.joined', metadata: {} }))).toContain('합류')
  })

  it('정의되지 않은 action 은 action 문자열을 그대로 반환한다', () => {
    expect(activityText(log({ action: 'custom.action' }))).toBe('custom.action')
  })
})
