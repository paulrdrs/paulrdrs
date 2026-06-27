import type { MetadataRoute } from "next"
import { getPublishedPosts, getPublishedProjects } from "@/db/content"
import { getSiteEnvs } from "@/envs/server"

export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteEnvs().SITE_URL.replace(/\/$/, "")
  const [posts, projects] = await Promise.all([
    getPublishedPosts(),
    getPublishedProjects()
  ])

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/blog`, changeFrequency: "weekly" },
    { url: `${base}/projects`, changeFrequency: "weekly" },
    { url: `${base}/projects/photography`, changeFrequency: "weekly" },
    { url: `${base}/projects/software`, changeFrequency: "weekly" },
    { url: `${base}/contact` },
    { url: `${base}/store` }
  ]

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: post.publishedAt ?? post.createdAt
  }))

  const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${base}/projects/${project.category}/${project.slug}`,
    lastModified: project.publishedAt ?? project.createdAt
  }))

  return [...staticEntries, ...postEntries, ...projectEntries]
}
