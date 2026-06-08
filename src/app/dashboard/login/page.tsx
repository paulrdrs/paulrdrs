import { PageContainer } from "@/components/PageContainer"
import { PasskeyLogin } from "./PasskeyLogin"

export default function DashboardLoginPage() {
  return (
    <PageContainer>
      <h1 className="font-black text-3xl">Dashboard login</h1>

      <PasskeyLogin />
    </PageContainer>
  )
}
