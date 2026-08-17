import { SoftwareProjectSnippet } from "./SoftwareProjectSnippet"

type SoftwareProjectListItem = {
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt: string | null
  id: string
  slug: string
  title: string
}

type SoftwareProjectListProps = {
  projects: SoftwareProjectListItem[]
}

export const SoftwareProjectList = ({ projects }: SoftwareProjectListProps) => (
  <div className="flex flex-wrap" data-component="SoftwareProjectList">
    {projects.map((project) => (
      <div
        className={projects.length === 1 ? "w-full" : "w-full sm:w-1/2"}
        key={project.id}
      >
        <SoftwareProjectSnippet
          coverAltText={project.coverAltText}
          coverAttribution={project.coverAttribution}
          coverMediaId={project.coverMediaId}
          excerpt={project.excerpt}
          href={`/software/${project.slug}`}
          label="software project"
          title={project.title}
        />
      </div>
    ))}
  </div>
)
