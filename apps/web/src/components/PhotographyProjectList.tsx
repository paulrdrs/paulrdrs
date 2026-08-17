import { PhotographyProjectSnippet } from "./PhotographyProjectSnippet"

type PhotographyProjectListItem = {
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt: string | null
  id: string
  slug: string
  title: string
}

type PhotographyProjectListProps = {
  projects: PhotographyProjectListItem[]
}

export const PhotographyProjectList = ({
  projects
}: PhotographyProjectListProps) => (
  <div className="flex flex-col gap-4">
    {projects.map((project) => (
      <PhotographyProjectSnippet
        coverAltText={project.coverAltText}
        coverAttribution={project.coverAttribution}
        coverMediaId={project.coverMediaId}
        excerpt={project.excerpt}
        href={`/photography/${project.slug}`}
        key={project.id}
        label="photography project"
        title={project.title}
      />
    ))}
  </div>
)
