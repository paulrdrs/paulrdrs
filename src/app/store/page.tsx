import { trackPageView } from "@/analytics/server"
import { PageContainer } from "@/components/PageContainer"

export const dynamic = "force-dynamic"

export default async function StorePage() {
  await trackPageView({ contentType: "page", path: "/store" })

  return (
    <PageContainer>
      <header className="pb-2">
        <h1 className="page-title">Store</h1>
      </header>
      <div className="empty-state">
        <p className="eyebrow">In development</p>
        <p className="mt-4 max-w-md text-ink text-lg">
          A small collection will live here when it is ready.
        </p>
      </div>
    </PageContainer>
  )
}
