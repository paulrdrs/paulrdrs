import { render, screen } from "@testing-library/react"
import { getPublishedPageByKey } from "@/db/content"
import Home from "./page"

vi.mock("@/db/content", () => ({
  getPublishedPageByKey: vi.fn()
}))

const getPublishedPageByKeyMock = vi.mocked(getPublishedPageByKey)

describe("Home", () => {
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
