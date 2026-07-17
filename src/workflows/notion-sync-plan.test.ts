import { notionSyncStages } from "./notion-sync-plan"

describe("Notion sync workflow plan", () => {
  it("pauses between databases but not after the final stage", () => {
    expect(notionSyncStages).toEqual([
      { pauseAfter: true, type: "posts" },
      { pauseAfter: true, type: "projects" },
      { pauseAfter: true, type: "photos" },
      { pauseAfter: false, type: "pages" }
    ])
  })
})
