import { trackPageView } from "@/analytics/server"
import { PageContainer } from "@/components/PageContainer"

export const dynamic = "force-dynamic"

export default async function StorePage() {
  await trackPageView({ contentType: "page", path: "/store" })

  return <PageContainer />
}
