export const contentStatusValues = ["draft", "published"] as const
export type ContentStatus = (typeof contentStatusValues)[number]

export const projectCategoryValues = ["photography", "software"] as const
export type ProjectCategory = (typeof projectCategoryValues)[number]

export const isProjectCategory = (value: string): value is ProjectCategory =>
  projectCategoryValues.includes(value as ProjectCategory)
