export const notionSyncStages = [
  { pauseAfter: true, type: "posts" },
  { pauseAfter: true, type: "projects" },
  { pauseAfter: true, type: "photos" },
  { pauseAfter: false, type: "pages" }
] as const

export type NotionSyncStageType = (typeof notionSyncStages)[number]["type"]
