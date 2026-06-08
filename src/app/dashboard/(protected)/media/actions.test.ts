import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { createDashboardMediaAsset } from "@/db/adminContent"
import { uploadMediaObject } from "@/media/storage"
import { uploadMediaAction } from "./actions"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn()
}))

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`)
  })
}))

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/adminContent", () => ({
  createDashboardMediaAsset: vi.fn()
}))

vi.mock("@/media/storage", () => ({
  uploadMediaObject: vi.fn()
}))

const createDashboardMediaAssetMock = vi.mocked(createDashboardMediaAsset)
const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const uploadMediaObjectMock = vi.mocked(uploadMediaObject)
const revalidatePathMock = vi.mocked(revalidatePath)

describe("uploadMediaAction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      id: "session-id"
    })
    createDashboardMediaAssetMock.mockResolvedValue({ id: "asset-id" })
  })

  it("uploads validated files and stores metadata", async () => {
    const formData = new FormData()
    formData.set(
      "file",
      new File(["hello"], "photo.png", { type: "image/png" })
    )
    formData.set("altText", "A photo")
    formData.set("attribution", "Paul")

    await expect(uploadMediaAction(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/dashboard/media"
    )

    expect(uploadMediaObjectMock).toHaveBeenCalledWith(
      expect.objectContaining({
        contentType: "image/png"
      })
    )
    expect(createDashboardMediaAssetMock).toHaveBeenCalledWith(
      expect.objectContaining({
        altText: "A photo",
        attribution: "Paul",
        filename: "photo.png",
        mimeType: "image/png",
        sizeBytes: 5
      })
    )
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/media")
    expect(redirect).toHaveBeenCalledWith("/dashboard/media")
  })
})
