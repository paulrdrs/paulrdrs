import { requireDashboardSession } from "@/auth/guards"
import { pageLabels } from "@/cms/pages"
import { getDashboardPage } from "@/db/adminContent"
import { updatePageAction } from "../_actions/pages"
import { PageEditor } from "../_components/PageEditor"

export default async function DashboardContactPage() {
  await requireDashboardSession()

  const page = await getDashboardPage("contact")

  return (
    <>
      <h2 className="font-black text-2xl">Contact</h2>
      <PageEditor
        action={updatePageAction.bind(null, "contact")}
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
                title: pageLabels.contact
              }
        }
        submitLabel="Save page"
      />
    </>
  )
}
