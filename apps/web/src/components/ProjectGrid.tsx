import Link from "next/link"
import type { ProjectCategory } from "@/db/contentTypes"
import { ContentImage } from "./ContentImage"

type ProjectGridItem = {
  category: ProjectCategory
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt: string | null
  id: string
  slug: string
  title: string
}

type ProjectGridProps = {
  projects: ProjectGridItem[]
}

export const ProjectGrid = ({ projects }: ProjectGridProps) => (
  <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2">
    {projects.map((project) => {
      const href = `/projects/${project.category}/${project.slug}`

      return (
        <li className="group flex flex-col gap-4" key={project.id}>
          {project.coverMediaId ? (
            <Link href={href}>
              <ContentImage
                alt={project.coverAltText}
                className="aspect-4/3"
                id={project.coverMediaId}
              />
            </Link>
          ) : (
            <Link
              aria-label={`View ${project.title}`}
              className="flex aspect-4/3 items-end border border-line p-4 text-muted hover:border-ink"
              href={href}
            >
              <span className="eyebrow">{project.category}</span>
            </Link>
          )}
          <div className="flex flex-col gap-2 pt-1">
            <p className="eyebrow">{project.category}</p>
            <h2 className="font-black text-2xl">
              <Link className="hover:text-muted" href={href}>
                {project.title}
              </Link>
            </h2>
            {project.excerpt ? (
              <p className="max-w-xl text-muted">{project.excerpt}</p>
            ) : null}
          </div>
        </li>
      )
    })}
  </ul>
)
