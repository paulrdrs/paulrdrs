import { PageContainer } from "@/components/PageContainer"
import { PasskeyLogin } from "./PasskeyLogin"

export default function DashboardLoginPage() {
  return (
    <PageContainer>
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-8">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Private area</p>
          <h1 className="page-title">Dashboard login</h1>
        </div>
        <PasskeyLogin />
      </div>
    </PageContainer>
  )
}
