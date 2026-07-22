import Image from "next/image"

interface UserAvatarProps {
  src?: string
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

const textSizeMap = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-lg",
  xl: "text-xl",
}

function InitialsFallback({ alt, size }: { alt: string; size: keyof typeof sizeMap }) {
  return (
    <div className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#000000] to-[#404040] ${textSizeMap[size]}`}>
      <span className="font-bold text-white">{alt.charAt(0).toUpperCase() || "?"}</span>
    </div>
  )
}

export function UserAvatar({ src, alt, size = "md", ring = false, gradientRing = false, indicator = false }: UserAvatarProps) {
  if (gradientRing) {
    return (
      <div className={`relative ${sizeMap[size]} rounded-full overflow-hidden p-[2px] bg-gradient-to-br from-[#000000] to-[#404040]`}>
        <div className="relative h-full w-full rounded-full overflow-hidden">
          {src ? <Image src={src} alt={alt} fill className="object-cover" /> : <InitialsFallback alt={alt} size={size} />}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${sizeMap[size]} shrink-0 rounded-full overflow-hidden ${ring ? "ring-2 ring-border ring-offset-2 ring-offset-background" : ""}`}>
      {src ? <Image src={src} alt={alt} fill className="object-cover" /> : <InitialsFallback alt={alt} size={size} />}
      {indicator && (
        <div className="absolute top-0 right-0 h-3 w-3 rounded-full bg-[#34C759] border-2 border-white" />
      )}
    </div>
  )
}
