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
  <ul className="flex flex-wrap" data-component="SoftwareProjectList">
    {projects.map((project, index) => (
      <li
        className={index === 0 ? "w-full" : "w-full sm:w-1/2"}
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
      </li>
    ))}
  </ul>
)
