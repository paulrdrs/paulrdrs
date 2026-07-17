export type SiteNavigationSettings = {
  blogEnabled: boolean
  photographyEnabled: boolean
  softwareEnabled: boolean
  storeEnabled: boolean
}

type NavigationSection = {
  field: keyof SiteNavigationSettings
  href: string
  label: string
}

export const siteNavigationSections = [
  { field: "blogEnabled", href: "/blog", label: "Blog" },
  { field: "softwareEnabled", href: "/software", label: "Software" },
  {
    field: "photographyEnabled",
    href: "/photography",
    label: "Photography"
  },
  { field: "storeEnabled", href: "/store", label: "Store" }
] satisfies NavigationSection[]

export const defaultSiteNavigationSettings: SiteNavigationSettings = {
  blogEnabled: true,
  photographyEnabled: true,
  softwareEnabled: true,
  storeEnabled: true
}
