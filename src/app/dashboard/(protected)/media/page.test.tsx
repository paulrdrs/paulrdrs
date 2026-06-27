import { render, screen } from "@testing-library/react"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardMediaAssets } from "@/db/adminContent"
import DashboardMediaPage from "./page"

vi.mock("@/auth/guards", () => ({
  requireDashboardSession: vi.fn()
}))

vi.mock("@/db/adminContent", () => ({
  getDashboardMediaAssets: vi.fn()
}))

vi.mock("./actions", () => ({
  uploadMediaAction: vi.fn()
}))

const requireDashboardSessionMock = vi.mocked(requireDashboardSession)
const getDashboardMediaAssetsMock = vi.mocked(getDashboardMediaAssets)

describe("DashboardMediaPage", () => {
  beforeEach(() => {
    requireDashboardSessionMock.mockResolvedValue({
      email: "admin@example.com",
      expiresAt: new Date("2026-01-01"),
      lastSeenAt: new Date("2026-01-01"),
      id: "session-id"
    })
  })

  it("renders media upload and listing", async () => {
    getDashboardMediaAssetsMock.mockResolvedValue([
      {
        altText: "A photo",
        attribution: "Paul",
        createdAt: new Date("2026-01-01"),
        filename: "photo.png",
        height: null,
        id: "asset-id",
        mimeType: "image/png",
        objectKey: "media/photo.png",
        sizeBytes: 2048,
        width: null
      }
    ])

    render(await DashboardMediaPage())

    expect(screen.getByRole("heading", { name: "Media" })).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: "Upload media" })
    ).toBeInTheDocument()
    expect(screen.getByText("photo.png")).toBeInTheDocument()
    expect(screen.getByText("A photo")).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "A photo" })).toHaveAttribute(
      "src",
      "/media/asset-id"
    )
  })

  it("renders an empty state", async () => {
    getDashboardMediaAssetsMock.mockResolvedValue([])

    render(await DashboardMediaPage())

    expect(screen.getByText("No media uploaded yet.")).toBeInTheDocument()
  })
})
