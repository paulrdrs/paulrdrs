import { requireDashboardSession } from "@/auth/guards"
import { getDashboardAnalyticsSummary } from "@/db/analytics"

const formatCount = (value: number) => new Intl.NumberFormat("en").format(value)

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "UTC"
  }).format(new Date(`${value}T00:00:00.000Z`))

export default async function DashboardPage() {
  await requireDashboardSession()

  const analytics = await getDashboardAnalyticsSummary()

  return (
    <>
      <h2 className="font-black text-2xl">Overview</h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="panel">
          <p className="font-mono text-sm uppercase">Views, 30 days</p>
          <p className="font-black text-4xl">
            {formatCount(analytics.recentViews)}
          </p>
        </div>
        <div className="panel">
          <p className="font-mono text-sm uppercase">Visitors, 30 days</p>
          <p className="font-black text-4xl">
            {formatCount(analytics.recentVisitors)}
          </p>
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="font-black text-xl">Daily views</h3>
        {analytics.dailyViews.length > 0 ? (
          <div className="overflow-x-auto">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {analytics.dailyViews.map((day) => (
                  <tr key={day.date}>
                    <td className="font-mono text-sm">
                      {formatDate(day.date)}
                    </td>
                    <td className="font-black">{formatCount(day.views)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="font-medium">No daily views yet.</p>
        )}
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4">
          <h3 className="font-black text-xl">Top posts</h3>
          {analytics.topPosts.length > 0 ? (
            <ol className="flex flex-col gap-2">
              {analytics.topPosts.map((post) => (
                <li className="border-line border-b pb-2" key={post.contentId}>
                  <div className="font-black">{post.title}</div>
                  <div className="font-mono text-sm">
                    {formatCount(post.views)} views
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="font-medium">No post views yet.</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-black text-xl">Top projects</h3>
          {analytics.topProjects.length > 0 ? (
            <ol className="flex flex-col gap-2">
              {analytics.topProjects.map((project) => (
                <li
                  className="border-line border-b pb-2"
                  key={project.contentId}
                >
                  <div className="font-black">{project.title}</div>
                  <div className="font-mono text-sm">
                    {project.category ?? "project"} /{" "}
                    {formatCount(project.views)} views
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="font-medium">No project views yet.</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-black text-xl">Top paths</h3>
          {analytics.topPaths.length > 0 ? (
            <ol className="flex flex-col gap-2">
              {analytics.topPaths.map((path) => (
                <li className="border-line border-b pb-2" key={path.path}>
                  <div className="break-all font-black">{path.path}</div>
                  <div className="font-mono text-sm">
                    {formatCount(path.views)} views
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="font-medium">No path views yet.</p>
          )}
        </div>
      </section>
    </>
  )
}
