import { getHomeFeaturedSelections } from "./hero"

describe("Home featured selections", () => {
  it("reads valid ordered selections from page metadata", () => {
    expect(
      getHomeFeaturedSelections({
        featuredContent: [
          { id: "post-id", kind: "post" },
          { id: "project-id", kind: "project" }
        ]
      })
    ).toEqual([
      { id: "post-id", kind: "post" },
      { id: "project-id", kind: "project" }
    ])
  })

  it("treats absent, malformed, and duplicate metadata as no selection", () => {
    expect(getHomeFeaturedSelections(undefined)).toEqual([])
    expect(
      getHomeFeaturedSelections({
        featuredContent: [{ id: "", kind: "post" }]
      })
    ).toEqual([])
    expect(
      getHomeFeaturedSelections({
        featuredContent: [{ id: "id", kind: "unknown" }]
      })
    ).toEqual([])
    expect(
      getHomeFeaturedSelections({
        featuredContent: [
          { id: "id", kind: "post" },
          { id: "id", kind: "post" }
        ]
      })
    ).toEqual([])
  })
})
