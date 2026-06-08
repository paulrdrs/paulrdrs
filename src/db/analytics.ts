import { getDb } from "./client"
import { analyticsEvents } from "./schema"

export type AnalyticsEventValues = typeof analyticsEvents.$inferInsert

export const createAnalyticsEvent = async (values: AnalyticsEventValues) => {
  await getDb().insert(analyticsEvents).values(values)
}
