"use server"

import { revalidatePath } from "next/cache"
import { requireDashboardSession } from "@/auth/guards"
import { deletePasskey } from "@/auth/passkeys"

export const deletePasskeyAction = async (formData: FormData) => {
  const session = await requireDashboardSession()
  const id = String(formData.get("id") ?? "")

  await deletePasskey({ email: session.email, id })
  revalidatePath("/dashboard/passkeys")
}
