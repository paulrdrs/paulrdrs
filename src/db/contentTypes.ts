import { type contentStatusValues, projectCategoryValues } from "./schema"

export type ContentStatus = (typeof contentStatusValues)[number]

export type ProjectCategory = (typeof projectCategoryValues)[number]

export const projectCategories = projectCategoryValues

export const isProjectCategory = (value: string): value is ProjectCategory => {
  return projectCategories.includes(value as ProjectCategory)
}
