import type { PlaceStatus } from '@/types'
import type { BadgeProps } from '@/components/ui/badge'

export const placeStatusLabel: Record<PlaceStatus, string> = {
  want: '가고 싶음',
  considering: '고려 중',
  confirmed: '확정',
}

export const placeStatusVariant: Record<PlaceStatus, BadgeProps['variant']> = {
  want: 'offline',
  considering: 'considering',
  confirmed: 'confirmed',
}

export const placeStatusOptions = (
  Object.keys(placeStatusLabel) as PlaceStatus[]
).map((value) => ({ value, label: placeStatusLabel[value] }))
