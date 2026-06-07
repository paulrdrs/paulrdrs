import { projectCategory } from "./schema"

export type ProjectCategory = (typeof projectCategory.enumValues)[number]

export const projectCategories = projectCategory.enumValues

export const isProjectCategory = (value: string): value is ProjectCategory => {
  return projectCategories.includes(value as ProjectCategory)
}
