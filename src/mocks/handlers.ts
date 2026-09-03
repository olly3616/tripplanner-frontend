import { http, HttpResponse } from 'msw'
import {
  CURRENT_USER_ID,
  activityLogs,
  expenses,
  itineraryItems,
  polls,
  savedPlaces,
  tripMembers,
  trips,
  users,
} from './db'
import type { Trip } from '@/types'

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
]
