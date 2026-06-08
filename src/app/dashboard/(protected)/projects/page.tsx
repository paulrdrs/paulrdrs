import Link from "next/link"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardProjects } from "@/db/adminContent"

const formatDate = (date: Date | null) => {
  return date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
    : "-"
}

export default async function DashboardProjectsPage() {
  await requireDashboardSession()

  const projects = await getDashboardProjects()

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-black text-2xl">Projects</h2>
        <Link
          className="border border-current px-3 py-2 font-mono text-sm hover:bg-black hover:text-white"
          href="/dashboard/projects/new"
        >
          New project
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-current border-b font-mono text-sm">
              <tr>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Published</th>
                <th className="py-2 pr-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr className="border-current border-b" key={project.id}>
                  <td className="py-3 pr-4">
                    <Link
                      className="font-black hover:underline"
                      href={`/dashboard/projects/${project.id}`}
                    >
                      {project.title}
                    </Link>
                    <div className="font-mono text-sm">{project.slug}</div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {project.category}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {project.status}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {formatDate(project.publishedAt)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {formatDate(project.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-medium">No projects yet.</p>
      )}
    </>
  )
}
