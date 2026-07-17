import { describe, expect, it } from "vitest"
import {
  contentStatusValues,
  isProjectCategory,
  projectCategoryValues
} from "./content"

describe("content contracts", () => {
  it("defines content statuses", () => {
    expect(contentStatusValues).toEqual(["draft", "published"])
  })

  it("defines project categories", () => {
    expect(projectCategoryValues).toEqual(["photography", "software"])
  })

  it("recognizes known project categories", () => {
    expect(isProjectCategory("photography")).toBe(true)
    expect(isProjectCategory("software")).toBe(true)
  })

  it("rejects unknown project categories", () => {
    expect(isProjectCategory("writing")).toBe(false)
  })
})
