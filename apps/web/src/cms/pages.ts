export const pageKeys = ["home", "contact"] as const

export type PageKey = (typeof pageKeys)[number]

export const isPageKey = (value: string): value is PageKey => {
  return pageKeys.includes(value as PageKey)
}
