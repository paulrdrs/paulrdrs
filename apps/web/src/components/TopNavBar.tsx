import { getSiteNavigationSettings } from "@/db/siteSettings"
import { siteNavigationSections } from "@/site/navigation"
import { type NavigationItem, NavigationLinks } from "./NavigationLinks"

export const TopNavBar = async () => {
  const settings = await getSiteNavigationSettings()

  const items: NavigationItem[] = [
    { href: "/", label: "Home" },
    ...siteNavigationSections
      .filter((section) => settings[section.field])
      .map(({ href, label }) => ({ href, label })),
    { href: "/contact", label: "Contact" }
  ]

  return (
    <header
      data-component="TopNavBar"
      className="sticky top-0 z-40 h-24 w-full bg-canvas/90 backdrop-blur-md"
    >
      <nav aria-label="Main navigation" className="mx-auto w-full max-w-3xl">
        <span className="flex w-full px-4 pt-2 font-black font-mono text-3xl uppercase tracking-widest">
          {"/paulrdrs"}
        </span>
        <div className="no-scrollbar flex h-12 items-center justify-between gap-4 overflow-x-auto p-2">
          <NavigationLinks items={items} />
        </div>
      </nav>
    </header>
  )
}
