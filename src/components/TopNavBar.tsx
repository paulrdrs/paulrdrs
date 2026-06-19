import Link from "next/link"
import { getCurrentSession } from "@/auth/session"
import { getSiteNavigationSettings } from "@/db/siteSettings"
import { siteNavigationSections } from "@/site/navigation"

export const TopNavBar = async () => {
  const [settings, session] = await Promise.all([
    getSiteNavigationSettings(),
    getCurrentSession()
  ])

  return (
    <nav className="no-scrollbar fixed flex h-12 w-full max-w-5xl items-center justify-between gap-4 overflow-x-scroll bg-inherit px-4 font-mono">
      <Link className="nav-text-link font-black" href="/">
        {"paulrdrs"}
      </Link>

      {siteNavigationSections.map((section) =>
        settings[section.field] ? (
          <Link
            className="nav-text-link font-medium"
            href={section.href}
            key={section.href}
          >
            {section.label}
          </Link>
        ) : null
      )}

      <Link className="nav-text-link font-medium" href="/contact">
        {"Contact"}
      </Link>

      {session ? (
        <Link className="nav-text-link font-medium" href="/dashboard">
          {"Dashboard"}
        </Link>
      ) : null}
    </nav>
  )
}
