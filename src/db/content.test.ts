import { isProjectCategory, projectCategories } from "./contentTypes"

describe("public content queries", () => {
  it("defines the public project categories", () => {
    expect(projectCategories).toEqual(["photography", "software"])
  })

  it("recognizes valid project categories", () => {
    expect(isProjectCategory("photography")).toBe(true)
    expect(isProjectCategory("software")).toBe(true)
  })

  it("rejects unknown project categories", () => {
    expect(isProjectCategory("writing")).toBe(false)
  })
})
