import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { getCurrentSession } from "@/auth/session"
import { NavigationLinks } from "@/components/NavigationLinks"

type DashboardLayoutProps = {
  children: ReactNode
}

export const dynamic = "force-dynamic"

const dashboardLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/home", label: "Home" },
  { href: "/dashboard/contact", label: "Contact" },
  { href: "/dashboard/blog", label: "Blog" },
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
    <main className="dashboard-shell min-h-screen">
      <header className="sticky top-0 z-40 border-line border-b bg-canvas/95 backdrop-blur-md">
        <div className="site-shell flex min-h-20 flex-wrap items-center justify-between gap-4 py-4">
          <div className="flex flex-col gap-1">
            <h1 className="font-black text-xl">Dashboard</h1>
            <p className="font-mono text-muted text-xs">{session.email}</p>
          </div>

          <form action="/dashboard/logout" method="post">
            <button className="button-quiet" type="submit">
              Log out
            </button>
          </form>
        </div>

        <nav
          aria-label="Dashboard navigation"
          className="site-shell no-scrollbar flex gap-8 overflow-x-auto border-line border-t py-2"
        >
          <NavigationLinks items={dashboardLinks} />
        </nav>
      </header>

      <section className="site-shell flex flex-col gap-8 py-12 sm:py-16">
        {children}
      </section>
    </main>
  )
}
