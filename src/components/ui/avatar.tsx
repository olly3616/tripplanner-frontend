import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  src?: string
  className?: string
}

/** 이름 이니셜 폴백을 가진 아바타. */
export function Avatar({ name, src, className }: AvatarProps) {
  const initial = name?.trim().charAt(0) ?? '?'
  return (
    <AvatarPrimitive.Root
      className={cn(
        'inline-flex size-8 select-none items-center justify-center overflow-hidden rounded-full bg-selected text-sm font-bold text-accent-active',
        className,
      )}
    >
      {src && (
        <AvatarPrimitive.Image
          src={src}
          alt={name}
          className="size-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback delayMs={src ? 300 : 0}>
        {initial}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
