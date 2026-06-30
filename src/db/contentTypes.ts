import { type contentStatus, projectCategory } from "./schema"

export type ContentStatus = (typeof contentStatus.enumValues)[number]

export type ProjectCategory = (typeof projectCategory.enumValues)[number]

export const projectCategories = projectCategory.enumValues

export const isProjectCategory = (value: string): value is ProjectCategory => {
  return projectCategories.includes(value as ProjectCategory)
}
