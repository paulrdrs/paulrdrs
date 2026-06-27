import { PageContainer } from "@/components/PageContainer"
import { PasskeySetup } from "./PasskeySetup"

export default function DashboardPasskeySetupPage() {
  return (
    <PageContainer>
      <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col justify-center gap-8">
        <div className="flex flex-col gap-4">
          <p className="eyebrow">Administration</p>
          <h1 className="page-title">Passkey setup</h1>
        </div>
        <PasskeySetup />
      </div>
    </PageContainer>
  )
}
