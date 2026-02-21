import Image from "next/image"

interface UserAvatarProps {
  src: string
  alt: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  ring?: boolean
  gradientRing?: boolean
  indicator?: boolean
}

const sizeMap = {
  xs: "h-7 w-7",
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-14 w-14",
  xl: "h-16 w-16",
}

export function UserAvatar({ src, alt, size = "md", ring = false, gradientRing = false, indicator = false }: UserAvatarProps) {
  if (gradientRing) {
    return (
      <div className={`relative ${sizeMap[size]} rounded-full overflow-hidden p-[2px] bg-gradient-to-br from-[#C62828] to-[#1565C0]`}>
        <div className="relative h-full w-full rounded-full overflow-hidden">
          <Image src={src} alt={alt} fill className="object-cover" />
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${sizeMap[size]} shrink-0 rounded-full overflow-hidden ${ring ? "ring-2 ring-border ring-offset-2 ring-offset-background" : ""}`}>
      <Image src={src} alt={alt} fill className="object-cover" />
      {indicator && (
        <div className="absolute top-0 right-0 h-3.5 w-3.5 rounded-full bg-gradient-to-r from-[#C62828] to-[#1565C0] border-2 border-card" />
      )}
    </div>
  )
}
