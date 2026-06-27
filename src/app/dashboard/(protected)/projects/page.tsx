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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-black text-2xl">Projects</h2>
        <Link className="button" href="/dashboard/projects/new">
          New project
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <Link
                      className="font-black hover:underline"
                      href={`/dashboard/projects/${project.id}`}
                    >
                      {project.title}
                    </Link>
                    <div className="font-mono text-sm">{project.slug}</div>
                  </td>
                  <td className="font-mono text-sm">{project.category}</td>
                  <td className="font-mono text-sm">{project.status}</td>
                  <td className="font-mono text-sm">
                    {formatDate(project.publishedAt)}
                  </td>
                  <td className="font-mono text-sm">
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
