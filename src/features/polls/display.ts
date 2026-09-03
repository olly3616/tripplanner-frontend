import { format, parseISO } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { Poll } from '@/types'

/** 마감 여부: 명시적 closed 또는 마감 시각 경과 */
export function isPollClosed(poll: Poll): boolean {
  return poll.closed || parseISO(poll.closesAt).getTime() < Date.now()
}

export function totalVotes(poll: Poll): number {
  return poll.options.reduce((sum, o) => sum + o.voteCount, 0)
}

/** "8월 12일 18:00 마감" */
export function formatCloseAt(closesAt: string): string {
  return format(parseISO(closesAt), 'M월 d일 HH:mm', { locale: ko }) + ' 마감'
}

export function pollMeta(poll: Poll): string {
  const parts = [poll.multiple ? '복수 선택' : '단일 선택']
  if (poll.anonymous) parts.push('익명')
  parts.push(isPollClosed(poll) ? '마감됨' : formatCloseAt(poll.closesAt))
  parts.push(`총 ${totalVotes(poll)}표`)
  return parts.join(' · ')
}
