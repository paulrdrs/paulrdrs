import { isProjectCategory, type ProjectCategory } from "@/db/contentTypes"
import { createSlug } from "@/lib/content"

export type ContentStatus = "draft" | "published"

export type PostFormValues = {
  title: string
  slug: string
  excerpt: string | null
  bodyMarkdown: string
  status: ContentStatus
  coverMediaId: string | null
  publishedAt: Date | null
  seoTitle: string | null
  seoDescription: string | null
}

export type ProjectFormValues = PostFormValues & {
  category: ProjectCategory
}

export type PageFormValues = {
  title: string
  bodyMarkdown: string
  status: ContentStatus
  publishedAt: Date | null
}

const getString = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "").trim()

const getNullableString = (formData: FormData, key: string) => {
  const value = getString(formData, key)
  return value ? value : null
}

const getBodyMarkdown = (formData: FormData) =>
  String(formData.get("bodyMarkdown") ?? "")

const getStatus = (formData: FormData): ContentStatus =>
  formData.get("status") === "published" ? "published" : "draft"

const getPublishedAt = (formData: FormData, status: ContentStatus) => {
  if (status === "draft") {
    return null
  }

  const value = getString(formData, "publishedAt")
  return value ? new Date(value) : new Date()
}

const getSlug = (formData: FormData, title: string) => {
  const explicitSlug = createSlug(getString(formData, "slug"))
  return explicitSlug || createSlug(title)
}

export const parsePostForm = (formData: FormData): PostFormValues => {
  const title = getString(formData, "title")
  const status = getStatus(formData)

  if (!title) {
    throw new Error("Title is required")
  }

  return {
    bodyMarkdown: getBodyMarkdown(formData),
    coverMediaId: getNullableString(formData, "coverMediaId"),
    excerpt: getNullableString(formData, "excerpt"),
    publishedAt: getPublishedAt(formData, status),
    seoDescription: getNullableString(formData, "seoDescription"),
    seoTitle: getNullableString(formData, "seoTitle"),
    slug: getSlug(formData, title),
    status,
    title
  }
}

export const parseProjectForm = (formData: FormData): ProjectFormValues => {
  const postValues = parsePostForm(formData)
  const category = getString(formData, "category")

  if (!isProjectCategory(category)) {
    throw new Error("Project category is required")
  }

  return {
    ...postValues,
    category
  }
}

export const parsePageForm = (formData: FormData): PageFormValues => {
  const title = getString(formData, "title")
  const status = getStatus(formData)

  if (!title) {
    throw new Error("Title is required")
  }

  return {
    bodyMarkdown: getBodyMarkdown(formData),
    publishedAt: getPublishedAt(formData, status),
    status,
    title
  }
}
