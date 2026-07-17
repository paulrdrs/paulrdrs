export type SiteNavigationSettings = {
  blogEnabled: boolean
  photographyEnabled: boolean
  projectsEnabled: boolean
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
  { field: "projectsEnabled", href: "/projects", label: "Projects" },
  { field: "softwareEnabled", href: "/projects/software", label: "Software" },
  {
    field: "photographyEnabled",
    href: "/photo",
    label: "Photos"
  },
  { field: "storeEnabled", href: "/store", label: "Store" }
] satisfies NavigationSection[]

export const defaultSiteNavigationSettings: SiteNavigationSettings = {
  blogEnabled: true,
  photographyEnabled: true,
  projectsEnabled: true,
  softwareEnabled: true,
  storeEnabled: true
}

export const parseSiteNavigationSettingsForm = (
  formData: FormData
): SiteNavigationSettings => ({
  blogEnabled: formData.has("blogEnabled"),
  photographyEnabled: formData.has("photographyEnabled"),
  projectsEnabled: formData.has("projectsEnabled"),
  softwareEnabled: formData.has("softwareEnabled"),
  storeEnabled: formData.has("storeEnabled")
})
