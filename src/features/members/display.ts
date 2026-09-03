import type { Role } from '@/types'
import type { BadgeProps } from '@/components/ui/badge'

export const roleLabel: Record<Role, string> = {
  owner: '소유자',
  editor: '편집자',
  viewer: '보기 전용',
}

export const roleVariant: Record<Role, BadgeProps['variant']> = {
  owner: 'confirmed',
  editor: 'offline',
  viewer: 'closed',
}

export const roleDescription: Record<Role, string> = {
  owner: '여행 수정·삭제, 멤버·권한 관리, 공유 설정',
  editor: '일정·장소·투표·경비 생성 및 수정',
  viewer: '조회, 허용된 투표 참여 및 댓글',
}

/** 소유자를 제외한 변경 가능한 역할(소유자 이전은 별도 흐름) */
export const assignableRoleOptions = (['editor', 'viewer'] as Role[]).map((value) => ({
  value,
  label: roleLabel[value],
}))
