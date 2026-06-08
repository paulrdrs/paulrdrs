import { render, screen } from "@testing-library/react"
import { getPublishedPageByKey } from "@/db/content"
import ContactPage from "./page"

vi.mock("@/db/content", () => ({
  getPublishedPageByKey: vi.fn()
}))

const getPublishedPageByKeyMock = vi.mocked(getPublishedPageByKey)

describe("ContactPage", () => {
  it("renders published CMS contact content", async () => {
    getPublishedPageByKeyMock.mockResolvedValue({
      bodyMarkdown: "Email **hello@example.com**.",
      id: "page-id",
      key: "contact",
      publishedAt: new Date("2026-01-01"),
      title: "Reach me"
    })

    render(await ContactPage())

    expect(getPublishedPageByKeyMock).toHaveBeenCalledWith("contact")
    expect(
      screen.getByRole("heading", { name: "Reach me" })
    ).toBeInTheDocument()
    expect(screen.getByText("hello@example.com")).toBeInTheDocument()
  })

  it("renders a fallback when contact content is missing", async () => {
    getPublishedPageByKeyMock.mockImplementationOnce(async () => undefined)

    render(await ContactPage())

    expect(screen.getByRole("heading", { name: "Contact" })).toBeInTheDocument()
    expect(
      screen.getByText("Contact details will live here.")
    ).toBeInTheDocument()
  })
})
