import { render, screen } from "@testing-library/react"
import { trackPageView } from "@/analytics/server"
import { getPublishedPageByKey } from "@/db/content"
import Home from "./page"

vi.mock("@/analytics/server", () => ({
  trackPageView: vi.fn()
}))

vi.mock("@/db/content", () => ({
  getPublishedPageByKey: vi.fn()
}))

const trackPageViewMock = vi.mocked(trackPageView)
const getPublishedPageByKeyMock = vi.mocked(getPublishedPageByKey)

describe("Home", () => {
  beforeEach(() => {
    trackPageViewMock.mockReset()
  })

  it("renders published CMS homepage content", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      bodyMarkdown: "Intro **copy**.",
      id: "page-id",
      key: "home",
      publishedAt: new Date("2026-01-01"),
      title: "Home intro"
    })

    render(await Home())

    expect(getPublishedPageByKeyMock).toHaveBeenCalledWith("home")
    expect(trackPageViewMock).toHaveBeenCalledWith({
      contentId: "page-id",
      contentType: "page",
      path: "/"
    })
    expect(
      screen.getByRole("heading", { name: "Home intro" })
    ).toBeInTheDocument()
    expect(screen.getByText("copy")).toBeInTheDocument()
  })

  it("renders a fallback when homepage content is missing", async () => {
    getPublishedPageByKeyMock.mockImplementationOnce(async () => undefined)

    render(await Home())

    expect(screen.getByText("paulrdrs")).toBeInTheDocument()
  })
})
