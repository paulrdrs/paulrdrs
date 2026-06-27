import {
  getHeroSelection,
  getHeroSelectionValue,
  parseHeroSelectionValue
} from "./hero"

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

  it("parses and serializes form values", () => {
    const selection = parseHeroSelectionValue("media:asset-id")

    expect(selection).toEqual({ id: "asset-id", kind: "media" })
    expect(getHeroSelectionValue(selection)).toBe("media:asset-id")
    expect(parseHeroSelectionValue("")).toBeNull()
  })

  it("rejects tampered form values", () => {
    expect(() => parseHeroSelectionValue("unknown:id")).toThrow(
      "Invalid hero selection"
    )
  })
})
