import { notFound } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { isPageKey, pageLabels } from "@/cms/pages"
import { getDashboardPage } from "@/db/adminContent"
import { updatePageAction } from "../actions"
import { PageEditor } from "../PageEditor"

type EditPageProps = {
  params: Promise<{
    key: string
  }>
}

export default async function EditPage({ params }: EditPageProps) {
  await requireDashboardSession()

  const { key } = await params

  if (!isPageKey(key)) {
    notFound()
  }

  const page = await getDashboardPage(key)

  return (
    <>
      <h2 className="font-black text-2xl">Edit {pageLabels[key]}</h2>
      <PageEditor
        action={updatePageAction.bind(null, key)}
        page={
          page
            ? {
                bodyMarkdown: page.bodyMarkdown,
                publishedAt: page.publishedAt,
                status: page.status,
                title: page.title
              }
            : {
                bodyMarkdown: "",
                publishedAt: null,
                status: "draft",
                title: pageLabels[key]
              }
        }
        submitLabel="Save page"
      />
    </>
  )
}
