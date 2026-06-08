import Link from "next/link"
import { requireDashboardSession } from "@/auth/guards"
import { pageKeys, pageLabels } from "@/cms/pages"
import { getDashboardPages } from "@/db/adminContent"

const formatDate = (date: Date | null) => {
  return date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
    : "-"
}

export default async function DashboardPagesPage() {
  await requireDashboardSession()

  const existingPages = await getDashboardPages()
  const pagesByKey = new Map(existingPages.map((page) => [page.key, page]))

  return (
    <>
      <h2 className="font-black text-2xl">Pages</h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-current border-b font-mono text-sm">
            <tr>
              <th className="py-2 pr-4">Page</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Published</th>
              <th className="py-2 pr-4">Updated</th>
            </tr>
          </thead>
          <tbody>
            {pageKeys.map((key) => {
              const page = pagesByKey.get(key)

              return (
                <tr className="border-current border-b" key={key}>
                  <td className="py-3 pr-4">
                    <Link
                      className="font-black hover:underline"
                      href={`/dashboard/pages/${key}`}
                    >
                      {page?.title ?? pageLabels[key]}
                    </Link>
                    <div className="font-mono text-sm">{key}</div>
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {page?.status ?? "missing"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {formatDate(page?.publishedAt ?? null)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {formatDate(page?.updatedAt ?? null)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
