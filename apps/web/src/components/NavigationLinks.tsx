"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export type NavigationItem = {
  href: string
  label: string
}

type NavigationLinksProps = {
  items: NavigationItem[]
}

export const getCurrentNavigationHref = (
  items: NavigationItem[],
  pathname: string
) =>
  items
    .filter(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href

export const NavigationLinks = ({ items }: NavigationLinksProps) => {
  const pathname = usePathname() ?? ""
  const currentHref = getCurrentNavigationHref(items, pathname)

  const centerNavigationItem = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center"
    })
  }

  return items.map((item) => {
    const isActive = currentHref === item.href

    return (
      <Link
        aria-current={isActive ? "page" : undefined}
        className={`relative shrink-0 py-2 font-mono uppercase tracking-widest ${
          isActive
            ? "font-black text-accent"
            : "font-bold text-muted hover:text-accent"
        }`}
        href={item.href}
        key={item.href}
        onClick={centerNavigationItem}
      >
        {item.label}
      </Link>
    )
  })
}
