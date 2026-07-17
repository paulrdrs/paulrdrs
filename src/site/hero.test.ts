import { getHeroSelection } from "./hero"

describe("hero selection", () => {
  it("reads a valid selection from page metadata", () => {
    expect(
      getHeroSelection({ hero: { id: "project-id", kind: "project" } })
    ).toEqual({ id: "project-id", kind: "project" })
  })

  it("treats missing and malformed metadata as no selection", () => {
    expect(getHeroSelection(undefined)).toBeNull()
    expect(getHeroSelection({ hero: { id: "", kind: "post" } })).toBeNull()
    expect(getHeroSelection({ hero: { id: "id", kind: "unknown" } })).toBeNull()
  })
})
