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

  return items.map((item) => {
    return (
      <Link
        aria-current={currentHref === item.href ? "page" : undefined}
        className="nav-link"
        href={item.href}
        key={item.href}
      >
        {item.label}
      </Link>
    )
  })
}
