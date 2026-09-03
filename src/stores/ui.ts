import { create } from 'zustand'

interface UiState {
  /** 현재 선택된 여행 id (앱 셸의 여행 전환) */
  currentTripId: string | null
  setCurrentTripId: (id: string | null) => void

  /** 알림 드로어 */
  notificationsOpen: boolean
  setNotificationsOpen: (open: boolean) => void

  /** 모바일 사이드바(더보기) */
  mobileNavOpen: boolean
  setMobileNavOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  currentTripId: null,
  setCurrentTripId: (id) => set({ currentTripId: id }),
  notificationsOpen: false,
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
}))
