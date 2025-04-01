import Link from "next/link"
import type { ReactNode } from "react"

export const SocialLink = ({
  icon,
  label,
  href
}: { icon: ReactNode; label: string; href: string }) => {
  return (
    <Link
      href={href}
      target="_blank"
      className="flex w-fit items-center gap-2 rounded-xl hover:cursor-pointer hover:underline"
    >
      {icon}
      <span className="text-lg">{label}</span>
    </Link>
  )
}
