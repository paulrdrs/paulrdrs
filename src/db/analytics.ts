import { sql } from "drizzle-orm"
import { getDb } from "./client"
import { analyticsEvents } from "./schema"

export type AnalyticsEventValues = typeof analyticsEvents.$inferInsert

export type DashboardAnalyticsSummary = {
  dailyViews: Array<{
    date: string
    views: number
  }>
  recentViews: number
  recentVisitors: number
  topPaths: Array<{
    path: string
    views: number
  }>
  topPosts: Array<{
    contentId: string
    slug: string | null
    title: string
    views: number
  }>
  topProjects: Array<{
    category: string | null
    contentId: string
    slug: string | null
    title: string
    views: number
  }>
}

type RecentAnalyticsRow = {
  recentViews: number
  recentVisitors: number
}

type TopPathRow = {
  path: string
  views: number
}

type TopPostRow = {
  contentId: string
  slug: string | null
  title: string | null
  views: number
}

type TopProjectRow = {
  category: string | null
  contentId: string
  slug: string | null
  title: string | null
  views: number
}

type DailyViewsRow = {
  date: string
  views: number
}

export const createAnalyticsEvent = async (values: AnalyticsEventValues) => {
  await getDb().insert(analyticsEvents).values(values)
}

const executeRows = async <T>(query: ReturnType<typeof sql<T>>) => {
  return (await getDb().execute(query)) as unknown as T[]
}

export const getDashboardAnalyticsSummary =
  async (): Promise<DashboardAnalyticsSummary> => {
    const [recentRows, topPathRows, topPostRows, topProjectRows, dailyRows] =
      await Promise.all([
        executeRows<RecentAnalyticsRow>(sql`
          select
            count(*)::int as "recentViews",
            count(distinct ${analyticsEvents.visitorHash})::int as "recentVisitors"
          from ${analyticsEvents}
          where ${analyticsEvents.occurredAt} >= current_timestamp - interval '30 days'
        `),
        executeRows<TopPathRow>(sql`
          select
            ${analyticsEvents.path} as "path",
            count(*)::int as "views"
          from ${analyticsEvents}
          where ${analyticsEvents.occurredAt} >= current_timestamp - interval '30 days'
          group by ${analyticsEvents.path}
          order by "views" desc, ${analyticsEvents.path} asc
          limit 5
        `),
        executeRows<TopPostRow>(sql`
          select
            ${analyticsEvents.contentId}::text as "contentId",
            posts.title as "title",
            posts.slug as "slug",
            count(*)::int as "views"
          from ${analyticsEvents}
          left join posts on posts.id = ${analyticsEvents.contentId}
          where ${analyticsEvents.contentType} = 'post'
            and ${analyticsEvents.contentId} is not null
            and ${analyticsEvents.occurredAt} >= current_timestamp - interval '30 days'
          group by ${analyticsEvents.contentId}, posts.title, posts.slug
          order by "views" desc, "title" asc
          limit 5
        `),
        executeRows<TopProjectRow>(sql`
          select
            ${analyticsEvents.contentId}::text as "contentId",
            projects.title as "title",
            projects.category::text as "category",
            projects.slug as "slug",
            count(*)::int as "views"
          from ${analyticsEvents}
          left join projects on projects.id = ${analyticsEvents.contentId}
          where ${analyticsEvents.contentType} = 'project'
            and ${analyticsEvents.contentId} is not null
            and ${analyticsEvents.occurredAt} >= current_timestamp - interval '30 days'
          group by
            ${analyticsEvents.contentId},
            projects.title,
            projects.category,
            projects.slug
          order by "views" desc, "title" asc
          limit 5
        `),
        executeRows<DailyViewsRow>(sql`
          select
            to_char(date_trunc('day', ${analyticsEvents.occurredAt}), 'YYYY-MM-DD') as "date",
            count(*)::int as "views"
          from ${analyticsEvents}
          where ${analyticsEvents.occurredAt} >= current_timestamp - interval '14 days'
          group by date_trunc('day', ${analyticsEvents.occurredAt})
          order by date_trunc('day', ${analyticsEvents.occurredAt}) asc
        `)
      ])

    const recent = recentRows[0]

    return {
      dailyViews: dailyRows,
      recentViews: recent?.recentViews ?? 0,
      recentVisitors: recent?.recentVisitors ?? 0,
      topPaths: topPathRows,
      topPosts: topPostRows.map((post) => ({
        contentId: post.contentId,
        slug: post.slug,
        title: post.title ?? "Deleted post",
        views: post.views
      })),
      topProjects: topProjectRows.map((project) => ({
        category: project.category,
        contentId: project.contentId,
        slug: project.slug,
        title: project.title ?? "Deleted project",
        views: project.views
      }))
    }
  }
