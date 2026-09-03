import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/ui/empty-state'
import { Hammer } from 'lucide-react'

interface ComingSoonProps {
  title: string
  phase: string
}

/** 아직 마크업 착수 전인 화면의 임시 자리표시자. 단계별로 실제 화면으로 대체된다. */
export function ComingSoon({ title, phase }: ComingSoonProps) {
  return (
    <>
      <PageHeader title={title} />
      <EmptyState
        icon={<Hammer />}
        title="곧 만들어질 화면이에요"
        description={`${phase} 단계에서 마크업과 기능을 구현할 예정입니다.`}
      />
    </>
  )
}
