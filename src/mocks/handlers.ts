import { http, HttpResponse } from 'msw'
import {
  CURRENT_USER_ID,
  activityLogs,
  expenses,
  itineraryItems,
  notifications,
  polls,
  savedPlaces,
  tripMembers,
  trips,
  users,
} from './db'
import type { ItineraryItem, Trip } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL || '/api'
const url = (path: string) => `${BASE}${path}`

const MOCK_TOKEN = 'mock-access-token'

function currentUser() {
  return users.find((u) => u.id === CURRENT_USER_ID)!
}

function unauthorized() {
  return HttpResponse.json({ message: '인증이 필요합니다.' }, { status: 401 })
}

/** Authorization 헤더 확인(목: 토큰 존재 여부만) */
function isAuthed(request: Request) {
  const auth = request.headers.get('Authorization')
  return Boolean(auth && auth.startsWith('Bearer '))
}

export const handlers = [
  // --- 인증 ---
  http.post(url('/auth/login'), async ({ request }) => {
    const body = (await request.json()) as { email?: string; password?: string }
    // 목: 이메일이 존재하면 로그인 성공으로 처리
    const user = users.find((u) => u.email === body.email) ?? currentUser()
    return HttpResponse.json({ user, accessToken: MOCK_TOKEN })
  }),

  http.post(url('/auth/logout'), () => new HttpResponse(null, { status: 204 })),

  http.get(url('/auth/me'), ({ request }) => {
    if (!isAuthed(request)) return unauthorized()
    return HttpResponse.json(currentUser())
  }),

  // --- 여행 목록/생성 ---
  http.get(url('/trips'), ({ request }) => {
    if (!isAuthed(request)) return unauthorized()
    const myTripIds = tripMembers
      .filter((m) => m.userId === CURRENT_USER_ID)
      .map((m) => m.tripId)
    return HttpResponse.json(trips.filter((t) => myTripIds.includes(t.id)))
  }),

  http.post(url('/trips'), async ({ request }) => {
    if (!isAuthed(request)) return unauthorized()
    const body = (await request.json()) as Partial<Trip>
    const id = `t${trips.length + 1}`
    const trip: Trip = {
      id,
      ownerId: CURRENT_USER_ID,
      title: body.title ?? '새 여행',
      destination: body.destination ?? '',
      startsOn: body.startsOn ?? '',
      endsOn: body.endsOn ?? '',
      baseCurrency: body.baseCurrency ?? 'KRW',
      timezone: body.timezone ?? 'Asia/Seoul',
      status: 'upcoming',
      memberCount: 1,
      itineraryCount: 0,
      expenseCount: 0,
    }
    trips.push(trip)
    tripMembers.push({
      tripId: id,
      userId: CURRENT_USER_ID,
      role: 'owner',
      joinedAt: new Date().toISOString(),
      user: currentUser(),
    })
    return HttpResponse.json(trip, { status: 201 })
  }),

  // --- 여행 상세 ---
  http.get(url('/trips/:tripId'), ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    const trip = trips.find((t) => t.id === params.tripId)
    if (!trip) return HttpResponse.json({ message: '여행을 찾을 수 없습니다.' }, { status: 404 })
    return HttpResponse.json(trip)
  }),

  http.patch(url('/trips/:tripId'), async ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    const idx = trips.findIndex((t) => t.id === params.tripId)
    if (idx === -1)
      return HttpResponse.json({ message: '여행을 찾을 수 없습니다.' }, { status: 404 })
    const body = (await request.json()) as Partial<Trip>
    trips[idx] = { ...trips[idx], ...body, id: trips[idx].id, ownerId: trips[idx].ownerId }
    return HttpResponse.json(trips[idx])
  }),

  // --- 멤버 ---
  http.get(url('/trips/:tripId/members'), ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    return HttpResponse.json(tripMembers.filter((m) => m.tripId === params.tripId))
  }),

  // --- 장소 ---
  http.get(url('/trips/:tripId/places'), ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    return HttpResponse.json(savedPlaces.filter((p) => p.tripId === params.tripId))
  }),

  // --- 일정 ---
  http.get(url('/trips/:tripId/itinerary'), ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    return HttpResponse.json(itineraryItems.filter((i) => i.tripId === params.tripId))
  }),

  http.post(url('/trips/:tripId/itinerary'), async ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    const body = (await request.json()) as {
      date: string
      startsAt?: string
      endsAt?: string
      placeId?: string
      note?: string
      transport?: ItineraryItem['transport']
    }
    const place = body.placeId
      ? savedPlaces.find((p) => p.id === body.placeId)
      : undefined
    const sameDay = itineraryItems.filter(
      (i) => i.tripId === params.tripId && i.date === body.date,
    )
    const item: ItineraryItem = {
      id: crypto.randomUUID(),
      tripId: String(params.tripId),
      placeId: body.placeId || undefined,
      place: place ? { id: place.id, name: place.name, category: place.category } : undefined,
      date: body.date,
      startsAt: body.startsAt || undefined,
      endsAt: body.endsAt || undefined,
      sortOrder: sameDay.length
        ? Math.max(...sameDay.map((i) => i.sortOrder)) + 1
        : 1,
      transport: body.transport ?? 'none',
      note: body.note || undefined,
      version: 1,
    }
    itineraryItems.push(item)
    return HttpResponse.json(item, { status: 201 })
  }),

  http.patch(url('/itinerary/:itemId'), async ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    const idx = itineraryItems.findIndex((i) => i.id === params.itemId)
    if (idx === -1)
      return HttpResponse.json({ message: '일정을 찾을 수 없습니다.' }, { status: 404 })
    const current = itineraryItems[idx]
    const body = (await request.json()) as Partial<ItineraryItem> & { version?: number }

    // 낙관적 잠금: 클라이언트 version 이 최신과 다르면 409 + 최신 데이터
    if (typeof body.version === 'number' && body.version !== current.version) {
      return HttpResponse.json(
        { message: '다른 사람이 먼저 수정했습니다.', latest: current },
        { status: 409 },
      )
    }

    const place = body.placeId
      ? savedPlaces.find((p) => p.id === body.placeId)
      : body.placeId === ''
        ? undefined
        : current.place
    const updated: ItineraryItem = {
      ...current,
      ...body,
      placeId: body.placeId === '' ? undefined : (body.placeId ?? current.placeId),
      place: body.placeId !== undefined
        ? place
          ? { id: place.id, name: place.name, category: place.category }
          : undefined
        : current.place,
      version: current.version + 1,
    }
    itineraryItems[idx] = updated
    return HttpResponse.json(updated)
  }),

  http.delete(url('/itinerary/:itemId'), ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    const idx = itineraryItems.findIndex((i) => i.id === params.itemId)
    if (idx !== -1) itineraryItems.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post(url('/itinerary/reorder'), async ({ request }) => {
    if (!isAuthed(request)) return unauthorized()
    const body = (await request.json()) as {
      updates: { id: string; date: string; sortOrder: number }[]
    }
    for (const u of body.updates) {
      const target = itineraryItems.find((i) => i.id === u.id)
      if (target) {
        target.date = u.date
        target.sortOrder = u.sortOrder
      }
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // --- 투표 ---
  http.get(url('/trips/:tripId/polls'), ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    return HttpResponse.json(polls.filter((p) => p.tripId === params.tripId))
  }),

  // --- 경비 ---
  http.get(url('/trips/:tripId/expenses'), ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    return HttpResponse.json(expenses.filter((e) => e.tripId === params.tripId))
  }),

  // --- 활동 피드 ---
  http.get(url('/trips/:tripId/activity'), ({ request, params }) => {
    if (!isAuthed(request)) return unauthorized()
    return HttpResponse.json(activityLogs.filter((a) => a.tripId === params.tripId))
  }),

  // --- 알림 ---
  http.get(url('/notifications'), ({ request }) => {
    if (!isAuthed(request)) return unauthorized()
    return HttpResponse.json(
      notifications.filter((n) => n.userId === CURRENT_USER_ID),
    )
  }),

  http.patch(url('/notifications'), async ({ request }) => {
    if (!isAuthed(request)) return unauthorized()
    const body = (await request.json().catch(() => ({}))) as { ids?: string[] }
    const now = new Date().toISOString()
    for (const n of notifications) {
      if (n.userId !== CURRENT_USER_ID) continue
      if (!body.ids || body.ids.includes(n.id)) n.readAt = n.readAt ?? now
    }
    return HttpResponse.json(notifications.filter((n) => n.userId === CURRENT_USER_ID))
  }),

  // --- 공개 공유 페이지 (인증 불필요) ---
  http.get(url('/share/:token'), ({ params }) => {
    // 데모 토큰만 유효. 실제로는 token_hash 조회 + 만료/폐기 검사.
    if (params.token !== 'demo-share-token') {
      return HttpResponse.json({ message: '유효하지 않은 공유 링크입니다.' }, { status: 404 })
    }
    const trip = trips.find((t) => t.id === 't1')!
    const tripExpenses = expenses.filter((e) => e.tripId === 't1')
    const totalBase = tripExpenses.reduce((s, e) => s + e.baseAmountMinor, 0)
    const byCat = new Map<string, number>()
    for (const e of tripExpenses) byCat.set(e.category, (byCat.get(e.category) ?? 0) + e.baseAmountMinor)

    return HttpResponse.json({
      trip: {
        title: trip.title,
        destination: trip.destination,
        startsOn: trip.startsOn,
        endsOn: trip.endsOn,
        timezone: trip.timezone,
        baseCurrency: trip.baseCurrency,
        memberCount: trip.memberCount,
      },
      itinerary: itineraryItems.filter((i) => i.tripId === 't1'),
      places: savedPlaces.filter((p) => p.tripId === 't1'),
      includeExpenses: true,
      expenseSummary: {
        baseCurrency: trip.baseCurrency,
        totalBase,
        byCategory: [...byCat.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([category, amount]) => ({ category, amount })),
      },
    })
  }),
]
