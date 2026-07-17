import { getSiteNavigationSettings } from "@/db/siteSettings"
import { siteNavigationSections } from "@/site/navigation"
import { type NavigationItem, NavigationLinks } from "./NavigationLinks"

export const TopNavBar = async () => {
  const settings = await getSiteNavigationSettings()

  const items: NavigationItem[] = [
    { href: "/", label: "paulrdrs" },
    ...siteNavigationSections
      .filter((section) => settings[section.field])
      .map(({ href, label }) => ({ href, label })),
    { href: "/contact", label: "Contact" }
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-canvas/90 backdrop-blur-md">
      <nav aria-label="Main navigation" className="mx-auto w-full max-w-5xl">
        <div className="no-scrollbar flex h-12 items-center justify-between gap-8 overflow-x-auto px-4">
          <NavigationLinks items={items} />
        </div>
      </nav>
    </header>
  )
}
