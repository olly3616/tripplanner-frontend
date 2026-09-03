/**
 * 도메인 모델 — 04-데이터모델-API.md 기준.
 * 금액 필드는 모두 통화 최소 단위 정수(amount_minor)로 다룬다.
 */

export type Role = 'owner' | 'editor' | 'viewer'

export type TripStatus = 'upcoming' | 'ongoing' | 'completed'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  defaultCurrency: string
  timezone: string
}

export interface Trip {
  id: string
  ownerId: string
  title: string
  destination: string
  startsOn: string // ISO date (YYYY-MM-DD)
  endsOn: string
  baseCurrency: string
  timezone: string
  status: TripStatus
  coverImageUrl?: string
  // 목록 카드용 요약 (서버 집계값)
  memberCount?: number
  itineraryCount?: number
  expenseCount?: number
}

export interface TripMember {
  tripId: string
  userId: string
  role: Role
  joinedAt: string
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>
}

export type PlaceStatus = 'want' | 'considering' | 'confirmed'

export interface SavedPlace {
  id: string
  tripId: string
  providerPlaceId?: string
  name: string
  address: string
  latitude: number
  longitude: number
  category?: string
  status: PlaceStatus
  tags: string[]
  note?: string
}

export type Transport = 'walk' | 'car' | 'transit' | 'bike' | 'flight' | 'none'

export interface ItineraryItem {
  id: string
  tripId: string
  placeId?: string
  place?: Pick<SavedPlace, 'id' | 'name' | 'category'>
  date: string // YYYY-MM-DD (여행 시간대 기준)
  startsAt?: string // HH:mm
  endsAt?: string
  sortOrder: number
  transport: Transport
  note?: string
  version: number
}

export interface PollOption {
  id: string
  label: string
  voteCount: number
}

export interface Poll {
  id: string
  tripId: string
  title: string
  options: PollOption[]
  multiple: boolean
  anonymous: boolean
  closesAt: string
  closed: boolean
  myVotes: string[] // 선택한 option id
}

export type ExpenseCategory =
  | 'lodging'
  | 'food'
  | 'transport'
  | 'activity'
  | 'shopping'
  | 'etc'

export type SplitMethod = 'equal' | 'ratio' | 'exact'

export interface ExpenseSplit {
  userId: string
  amountMinor: number
}

export interface Expense {
  id: string
  tripId: string
  payerId: string
  title: string
  amountMinor: number
  currency: string
  exchangeRate: number
  baseAmountMinor: number
  category: ExpenseCategory
  splitMethod: SplitMethod
  splits: ExpenseSplit[]
  spentAt: string // ISO datetime
  receiptUrl?: string
  note?: string
}

export interface SettlementBalance {
  userId: string
  balanceMinor: number // 양수 = 받을 돈, 음수 = 보낼 돈 (기준 통화)
}

export interface SettlementTransfer {
  fromUserId: string
  toUserId: string
  amountMinor: number
}

export interface Settlement {
  baseCurrency: string
  balances: SettlementBalance[]
  transfers: SettlementTransfer[]
}

export type NotificationType =
  | 'invite'
  | 'itinerary_changed'
  | 'expense_added'
  | 'poll_created'
  | 'poll_closed'
  | 'mention'

export interface AppNotification {
  id: string
  userId: string
  type: NotificationType
  payload: Record<string, unknown>
  readAt?: string
  createdAt: string
}

export interface ActivityLog {
  id: string
  tripId: string
  actorId: string
  actor: Pick<User, 'id' | 'name' | 'avatarUrl'>
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown>
  createdAt: string
}
