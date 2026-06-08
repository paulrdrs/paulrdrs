import { PageContainer } from "@/components/PageContainer"
import { PasskeySetup } from "./PasskeySetup"

export default function DashboardPasskeySetupPage() {
  return (
    <PageContainer>
      <h1 className="font-black text-3xl">Passkey setup</h1>
      <PasskeySetup />
    </PageContainer>
  )
}
