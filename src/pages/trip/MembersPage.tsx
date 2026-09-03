import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShieldAlert, UserPlus, X } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useAuthStore } from '@/stores/auth'
import { useTrip, useTripMembers } from '@/features/trips/api'
import { InviteDialog } from '@/features/members/InviteDialog'
import { ShareLinkCard } from '@/features/members/ShareLinkCard'
import { assignableRoleOptions, roleLabel, roleVariant } from '@/features/members/display'
import type { Role, TripMember } from '@/types'

interface PendingInvite {
  email: string
  role: Role
}

/**
 * 멤버·초대·설정 (S-08) — 마크업 + 기능 단계.
 * 역할별(권한) UI, 역할 변경/멤버 제거, 초대, 공유 링크, 위험 구역을 로컬 상태로 처리한다.
 * 초대 발송·역할 변경·멤버 제거·여행 삭제 mutation 은 다음 API 단계에서 연결한다.
 */
export function MembersPage() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const currentUserId = useAuthStore((s) => s.user?.id ?? '')
  const { data: trip } = useTrip(tripId)
  const { data: fetched, isLoading } = useTripMembers(tripId)

  const [members, setMembers] = useState<TripMember[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<TripMember | null>(null)
  const [deleteTripOpen, setDeleteTripOpen] = useState(false)

  useEffect(() => {
    if (fetched) setMembers(fetched)
  }, [fetched])

  const myRole = members.find((m) => m.userId === currentUserId)?.role
  const isOwner = myRole === 'owner'

  function handleInvite(email: string, role: Role) {
    setInvites((prev) => [...prev, { email, role }])
  }

  function handleRoleChange(userId: string, role: Role) {
    setMembers((prev) => prev.map((m) => (m.userId === userId ? { ...m, role } : m)))
    toast.success('역할을 변경했어요.')
  }

  function handleRemove(member: TripMember) {
    setMembers((prev) => prev.filter((m) => m.userId !== member.userId))
    toast.success(`${member.user.name} 님을 여행에서 제외했어요.`)
  }

  return (
    <>
      <PageHeader
        title="멤버·설정"
        action={
          isOwner ? (
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="size-4" />초대
            </Button>
          ) : undefined
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-6">
          {/* 멤버 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>멤버 {members.length}명</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-14" />
                  <Skeleton className="h-14" />
                </>
              ) : (
                members.map((m) => {
                  const isSelf = m.userId === currentUserId
                  const canManage = isOwner && !isSelf && m.role !== 'owner'
                  return (
                    <div
                      key={m.userId}
                      className="flex items-center gap-3 rounded-md border border-border p-3"
                    >
                      <Avatar name={m.user.name} src={m.user.avatarUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">
                          {m.user.name}
                          {isSelf && <span className="ml-1 text-xs text-muted">(나)</span>}
                        </p>
                        <p className="truncate text-xs text-muted">{m.user.email}</p>
                      </div>

                      {canManage ? (
                        <Select
                          value={m.role}
                          onChange={(e) => handleRoleChange(m.userId, e.target.value as Role)}
                          className="h-9 w-28 text-sm"
                          aria-label={`${m.user.name} 역할`}
                        >
                          {assignableRoleOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Badge variant={roleVariant[m.role]}>{roleLabel[m.role]}</Badge>
                      )}

                      {canManage && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`${m.user.name} 제외`}
                          onClick={() => setRemoveTarget(m)}
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  )
                })
              )}

              {/* 대기 중 초대 */}
              {invites.map((inv, i) => (
                <div
                  key={`${inv.email}-${i}`}
                  className="flex items-center gap-3 rounded-md border border-dashed border-border p-3"
                >
                  <Avatar name={inv.email} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{inv.email}</p>
                    <p className="text-xs text-muted">{roleLabel[inv.role]} · 초대 수락 대기</p>
                  </div>
                  <Badge variant="considering">대기 중</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="초대 취소"
                    onClick={() => setInvites((prev) => prev.filter((_, idx) => idx !== i))}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 위험 구역 (소유자) */}
          {isOwner && (
            <Card className="border-danger/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-danger">
                  <ShieldAlert className="size-4" />
                  위험 구역
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">여행 삭제</p>
                  <p className="text-xs text-muted">
                    이 여행과 모든 일정·장소·경비가 영구 삭제됩니다.
                  </p>
                </div>
                <Button variant="danger" onClick={() => setDeleteTripOpen(true)}>
                  여행 삭제
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 공유 링크 (소유자) */}
        <div className="grid gap-6">{isOwner && <ShareLinkCard />}</div>
      </div>

      <InviteDialog open={inviteOpen} onOpenChange={setInviteOpen} onInvite={handleInvite} />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="멤버를 제외할까요?"
        description={
          removeTarget
            ? `${removeTarget.user.name} 님을 여행에서 제외합니다. 과거 지출 기록은 보존됩니다.`
            : undefined
        }
        confirmLabel="제외"
        danger
        onConfirm={() => removeTarget && handleRemove(removeTarget)}
      />

      <ConfirmDialog
        open={deleteTripOpen}
        onOpenChange={setDeleteTripOpen}
        title="여행을 삭제할까요?"
        description={`'${trip?.title ?? ''}' 여행과 모든 데이터가 영구 삭제됩니다. 되돌릴 수 없습니다.`}
        confirmLabel="영구 삭제"
        danger
        onConfirm={() => {
          toast.info('여행 삭제는 API 연결 단계에서 실제로 처리됩니다.')
          navigate('/trips')
        }}
      />
    </>
  )
}
