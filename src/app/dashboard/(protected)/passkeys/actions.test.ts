import { revalidatePath } from "next/cache"
import { requireDashboardSession } from "@/auth/guards"
import { deletePasskey } from "@/auth/passkeys"
import { deletePasskeyAction } from "./actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}))

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/auth/passkeys", () => ({
  deletePasskey: vi.fn()
}))

const deletePasskeyMock = vi.mocked(deletePasskey)
const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const revalidatePathMock = vi.mocked(revalidatePath)

describe("passkey dashboard actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("deletes a passkey for the current admin", async () => {
    const formData = new FormData()
    formData.set("id", "passkey-id")

    await deletePasskeyAction(formData)

    expect(deletePasskeyMock).toHaveBeenCalledWith({
      email: "admin@example.com",
      id: "passkey-id"
    })
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/passkeys")
  })
})
