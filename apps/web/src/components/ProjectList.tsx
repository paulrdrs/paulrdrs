import type { ProjectCategory } from "@paulrdrs/content/content"
import { ProjectSnippet } from "./ProjectSnippet"

type ProjectListItem = {
  category: ProjectCategory
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt: string | null
  id: string
  slug: string
  title: string
}

type ProjectListProps = {
  projects: ProjectListItem[]
}

export const ProjectList = ({ projects }: ProjectListProps) => (
  <ul className="flex flex-col">
    {projects.map((project) => {
      const href = `/${project.category}/${project.slug}`

      return (
        <ProjectSnippet
          coverAltText={project.coverAltText}
          coverAttribution={project.coverAttribution}
          coverMediaId={project.coverMediaId}
          excerpt={project.excerpt}
          href={href}
          label={`${project.category} project`}
          title={project.title}
          key={project.id}
        />
      )
    })}
  </ul>
)
