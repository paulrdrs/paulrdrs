import {
  parseNotionSyncStageSummary,
  readNotionSyncStageResponse
} from "./notion-sync-response"

describe("Notion sync workflow responses", () => {
  it("accepts a successful summary", () => {
    expect(
      parseNotionSyncStageSummary({ posts: { errors: [], synced: 2 } }, "posts")
    ).toEqual({ posts: { errors: [], synced: 2 } })
  })

  it("accepts and preserves entry errors", () => {
    expect(
      parseNotionSyncStageSummary(
        { photos: { errors: ["Missing image"], synced: 1 } },
        "photos"
      )
    ).toEqual({ photos: { errors: ["Missing image"], synced: 1 } })
  })

  it.each([
    null,
    {},
    { posts: { errors: [], synced: -1 } },
    { posts: { errors: [1], synced: 1 } },
    { photos: { errors: [], synced: 1 } },
    {
      pages: { errors: [], synced: 1 },
      posts: { errors: [], synced: 1 }
    }
  ])("rejects a malformed posts summary", (summary) => {
    expect(() => parseNotionSyncStageSummary(summary, "posts")).toThrow(
      "returned an invalid summary"
    )
  })

  it("rejects invalid JSON from a successful response", async () => {
    const response = new Response("not JSON", { status: 200 })

    await expect(
      readNotionSyncStageResponse(response, "pages")
    ).rejects.toThrow("returned invalid JSON")
  })

  it("includes a non-success response body in the failure", async () => {
    const response = new Response(
      JSON.stringify({ posts: { errors: ["Malformed page"], synced: 1 } }),
      { status: 500 }
    )

    await expect(
      readNotionSyncStageResponse(response, "posts")
    ).rejects.toThrow(/500.*Malformed page/)
  })
})
