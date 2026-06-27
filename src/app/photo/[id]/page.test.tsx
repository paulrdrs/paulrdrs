import { render, screen } from "@testing-library/react"
import { notFound } from "next/navigation"
import { trackPageView } from "@/analytics/server"
import { getPublicMediaAsset } from "@/db/content"
import PhotoPage from "./page"

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND")
  })
}))

vi.mock("@/analytics/server", () => ({ trackPageView: vi.fn() }))
vi.mock("@/db/content", () => ({ getPublicMediaAsset: vi.fn() }))

const getPublicMediaAssetMock = vi.mocked(getPublicMediaAsset)
const trackPageViewMock = vi.mocked(trackPageView)

describe("PhotoPage", () => {
  it("renders an uploaded image with attribution", async () => {
    getPublicMediaAssetMock.mockResolvedValue({
      altText: "Atlantic light",
      attribution: "Paulo Rodrigues",
      filename: "atlantic.webp",
      height: 1200,
      id: "asset-id",
      mimeType: "image/webp",
      width: 1600
    })

    render(await PhotoPage({ params: Promise.resolve({ id: "asset-id" }) }))

    expect(
      screen.getByRole("heading", { name: "Atlantic light" })
    ).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Atlantic light" })).toHaveAttribute(
      "src",
      expect.stringContaining("/media/asset-id")
    )
    expect(screen.getByText("Paulo Rodrigues")).toBeInTheDocument()
    expect(trackPageViewMock).toHaveBeenCalledWith({
      contentType: "page",
      path: "/photo/asset-id"
    })
  })

  it("returns not found for missing media", async () => {
    getPublicMediaAssetMock.mockResolvedValue(undefined)

    await expect(
      PhotoPage({ params: Promise.resolve({ id: "missing" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND")
    expect(notFound).toHaveBeenCalled()
  })
})
