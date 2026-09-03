import { useMemo } from 'react'
import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SavedPlace } from '@/types'

interface PlaceMapProps {
  places: SavedPlace[]
  selectedId: string | null
  onSelect: (id: string) => void
}

/**
 * 지도 패널 — 마크업 단계의 플레이스홀더.
 * 좌표를 후보들의 경계 상자 안 상대 위치로 환산해 마커를 배치하고,
 * 목록과 선택 상태를 양방향 동기화한다.
 * API/지도 단계에서 이 컴포넌트 내부를 MapLibre + Geoapify 로 교체한다.
 * (외부 props 계약은 그대로 유지)
 */
export function PlaceMap({ places, selectedId, onSelect }: PlaceMapProps) {
  const positions = useMemo(() => {
    if (places.length === 0) return []
    const lats = places.map((p) => p.latitude)
    const lngs = places.map((p) => p.longitude)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs)
    const maxLng = Math.max(...lngs)
    const spanLat = maxLat - minLat || 1
    const spanLng = maxLng - minLng || 1
    // 8%~92% 범위로 매핑(가장자리 여백)
    const scale = (v: number) => 8 + v * 84
    return places.map((p, i) => ({
      place: p,
      index: i + 1,
      left: scale((p.longitude - minLng) / spanLng),
      top: scale((maxLat - p.latitude) / spanLat), // 위도는 위가 북쪽
    }))
  }, [places])

  return (
    <div
      className="relative min-h-[280px] overflow-hidden rounded-lg border border-border bg-subtle lg:min-h-full"
      aria-label="장소 지도"
    >
      {/* 격자 배경 (플레이스홀더 표현) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(oklch(0.9 0.02 220 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.02 220 / 0.5) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <span className="absolute right-2 top-2 z-10 rounded-full bg-surface/90 px-2 py-1 text-[10px] text-muted shadow-sm">
        지도 미리보기 · 실제 지도는 장소 검색 단계에서 연결
      </span>

      {positions.length === 0 ? (
        <div className="absolute inset-0 grid place-items-center text-sm text-muted">
          저장된 장소가 없어요
        </div>
      ) : (
        positions.map(({ place, index, left, top }) => {
          const selected = place.id === selectedId
          return (
            <button
              key={place.id}
              type="button"
              onClick={() => onSelect(place.id)}
              style={{ left: `${left}%`, top: `${top}%` }}
              className={cn(
                'absolute z-[1] -translate-x-1/2 -translate-y-full transition-transform focus-visible:outline-none',
                selected && 'z-[2] scale-110',
              )}
              aria-label={`${place.name} 선택`}
              aria-pressed={selected}
            >
              <span
                className={cn(
                  'relative grid size-7 place-items-center rounded-full rounded-bl-none border-2 border-surface shadow-md',
                  selected ? 'bg-accent-active text-surface' : 'bg-accent text-surface',
                )}
                style={{ transform: 'rotate(-45deg)' }}
              >
                <span className="mono text-[11px] font-bold" style={{ transform: 'rotate(45deg)' }}>
                  {index}
                </span>
              </span>
              {selected && (
                <span className="mt-1 block whitespace-nowrap rounded bg-surface px-1.5 py-0.5 text-[11px] font-semibold shadow-sm">
                  <MapPin className="mr-0.5 inline size-3 text-accent" />
                  {place.name}
                </span>
              )}
            </button>
          )
        })
      )}
    </div>
  )
}
