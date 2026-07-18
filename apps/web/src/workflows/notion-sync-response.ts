import type { NotionSyncTypeSummary } from "@paulrdrs/notion-sync/sync"
import type { NotionSyncStageType } from "./notion-sync-plan"

const isSyncTypeSummary = (value: unknown): value is NotionSyncTypeSummary => {
  if (!value || typeof value !== "object") {
    return false
  }

  const { errors, synced } = value as Record<string, unknown>

  return (
    Array.isArray(errors) &&
    errors.every((error) => typeof error === "string") &&
    Number.isSafeInteger(synced) &&
    (synced as number) >= 0
  )
}

export const parseNotionSyncStageSummary = <Type extends NotionSyncStageType>(
  value: unknown,
  type: Type
): Record<Type, NotionSyncTypeSummary> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Notion sync (${type}) returned an invalid summary`)
  }

  const summary = value as Record<string, unknown>

  if (
    Object.keys(summary).length !== 1 ||
    !Object.hasOwn(summary, type) ||
    !isSyncTypeSummary(summary[type])
  ) {
    throw new Error(`Notion sync (${type}) returned an invalid summary`)
  }

  return summary as Record<Type, NotionSyncTypeSummary>
}

export const readNotionSyncStageResponse = async <
  Type extends NotionSyncStageType
>(
  response: Response,
  type: Type
): Promise<Record<Type, NotionSyncTypeSummary>> => {
  if (!response.ok) {
    throw new Error(
      `Notion sync (${type}) failed: ${response.status} ${await response.text()}`
    )
  }

  let value: unknown

  try {
    value = await response.json()
  } catch {
    throw new Error(`Notion sync (${type}) returned invalid JSON`)
  }

  return parseNotionSyncStageSummary(value, type)
}
