vi.mock("cloudflare:workers", () => ({
  WorkflowEntrypoint: class {}
}))

import worker from "./index"

describe("scheduled Worker", () => {
  it("creates one parameterless full-sync Workflow", async () => {
    const create = vi.fn().mockResolvedValue({ id: "workflow-instance" })
    const environment = {
      SYNC_WORKFLOW: { create }
    } as unknown as CloudflareEnv

    await worker.scheduled?.(
      {} as ScheduledController,
      environment,
      {} as ExecutionContext
    )

    expect(create).toHaveBeenCalledTimes(1)
    expect(create).toHaveBeenCalledWith()
  })

  it("does not expose an HTTP fetch handler", () => {
    expect(worker).not.toHaveProperty("fetch")
  })
})
