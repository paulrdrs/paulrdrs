import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { getCurrentSession } from "@/auth/session"

type DashboardLayoutProps = {
  children: ReactNode
}

export const dynamic = "force-dynamic"

const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/home", label: "Home" },
  { href: "/dashboard/contact", label: "Contact" },
  { href: "/dashboard/blog", label: "blog" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/media", label: "Media" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/passkeys", label: "Passkeys" }
]

export default async function DashboardLayout({
  children
}: DashboardLayoutProps) {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/dashboard/login")
  }

  return (
    <main className="flex h-full w-full flex-col gap-6 py-8">
      <header className="flex flex-col gap-4 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-black text-3xl">Dashboard</h1>
            <p className="font-mono text-sm">{session.email}</p>
          </div>

          <form action="/dashboard/logout" method="post">
            <button
              className="border border-current px-3 py-2 font-mono text-sm hover:bg-black hover:text-white"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>

        <nav className="no-scrollbar flex w-full max-w-5xl items-center gap-3 overflow-x-scroll bg-inherit px-4 font-mono text-sm">
          {dashboardLinks.map((link) => (
            <Link
              className="nav-text-link font-medium"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      <section className="flex flex-col gap-4 px-4">{children}</section>
    </main>
  )
}
