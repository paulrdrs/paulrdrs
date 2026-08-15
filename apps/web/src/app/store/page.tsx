import { Eyebrow } from "@/components/Eyebrow"
import { PageContainer } from "@/components/PageContainer"

export const dynamic = "force-dynamic"

export default async function StorePage() {
  return (
    <PageContainer>
      <header className="p-4">
        <h1 className="text-balance font-bold text-4xl">Store</h1>
      </header>
      <div className="empty-state px-4">
        <Eyebrow label={"In development"} />
        <p className="mt-4 max-w-md text-accent text-lg">
          A small collection will live here when it is ready.
        </p>
      </div>
    </PageContainer>
  )
}
