import { redirect } from "next/navigation"
import { getCurrentSession } from "./session"

export const requireDashboardSession = async () => {
  const session = await getCurrentSession()

  if (!session) {
    redirect("/dashboard/login")
  }

  return session
}
