import type { MetadataRoute } from "next"
import {
  getPublishedPhotos,
  getPublishedPosts,
  getPublishedProjects
} from "@/db/content"
import { getSiteEnvs } from "@/envs/server"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteEnvs().SITE_URL.replace(/\/$/, "")
  const [posts, projects, photos] = await Promise.all([
    getPublishedPosts(),
    getPublishedProjects(),
    getPublishedPhotos()
  ])

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly" },
    { url: `${base}/photo`, changeFrequency: "weekly" },
    { url: `${base}/photography`, changeFrequency: "weekly" },
    { url: `${base}/software`, changeFrequency: "weekly" },
    { url: `${base}/contact` },
    { url: `${base}/store` }
  ]

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.publishedAt ?? post.createdAt
  }))

  const tagEntries: MetadataRoute.Sitemap = [
    ...new Set(posts.flatMap((post) => post.tags))
  ].map((tag) => ({
    url: `${base}/blog/tag/${encodeURIComponent(tag)}`
  }))

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/${project.category}/${project.slug}`,
    lastModified: project.publishedAt ?? project.createdAt
  }))

  const photoEntries: MetadataRoute.Sitemap = photos.map((photo) => ({
    url: `${base}/photo/${photo.slug}`,
    lastModified: photo.publishedAt ?? photo.createdAt
  }))

  return [
    ...staticEntries,
    ...postEntries,
    ...tagEntries,
    ...projectEntries,
    ...photoEntries
  ]
}
