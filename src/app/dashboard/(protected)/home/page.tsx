import { requireDashboardSession } from "@/auth/guards"
import { pageLabels } from "@/cms/pages"
import { getDashboardHeroOptions, getDashboardPage } from "@/db/adminContent"
import { getHeroSelection } from "@/site/hero"
import { updatePageAction } from "../_actions/pages"
import { PageEditor } from "../_components/PageEditor"

export default async function DashboardHomePage() {
  await requireDashboardSession()

  const [page, heroOptions] = await Promise.all([
    getDashboardPage("home"),
    getDashboardHeroOptions()
  ])

  return (
    <>
      <h2 className="font-black text-2xl">Home</h2>
      <PageEditor
        action={updatePageAction.bind(null, "home")}
        heroOptions={heroOptions}
        heroSelection={getHeroSelection(page?.metadata)}
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
                title: pageLabels.home
              }
        }
        submitLabel="Save page"
      />
    </>
  )
}
