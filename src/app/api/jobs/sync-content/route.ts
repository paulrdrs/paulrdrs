import { timingSafeEqual } from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"
import { getNotionEnvs } from "@/envs/server"
import {
  runNotionSync,
  syncPages,
  syncPhotos,
  syncPosts,
  syncProjects
} from "@/notion/sync"

export const dynamic = "force-dynamic"

const getProvidedSecret = (request: NextRequest) =>
  request.headers.get("x-jobs-secret") ??
  request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
  ""

const isAuthorized = (provided: string, secret: string) => {
  const providedBuffer = Buffer.from(provided)
  const secretBuffer = Buffer.from(secret)

  return (
    providedBuffer.length === secretBuffer.length &&
    timingSafeEqual(providedBuffer, secretBuffer)
  )
}

// `type` lets the sync Workflow drive one Notion database per durable step;
// omitting it runs the full sync (manual/webhook trigger).
const runSync = async (type: string | null) => {
  const envs = getNotionEnvs()

  switch (type) {
    case "posts":
      return { posts: await syncPosts(envs.NOTION_POSTS_DB_ID) }
    case "projects":
      return { projects: await syncProjects(envs.NOTION_PROJECTS_DB_ID) }
    case "photos":
      return { photos: await syncPhotos(envs.NOTION_PHOTOS_DB_ID) }
    case "pages":
      return { pages: await syncPages(envs.NOTION_PAGES_DB_ID) }
    default:
      return runNotionSync()
  }
}

export const POST = async (request: NextRequest) => {
  const { JOBS_SECRET } = getNotionEnvs()

  if (!isAuthorized(getProvidedSecret(request), JOBS_SECRET)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const type = request.nextUrl.searchParams.get("type")
  const summary = await runSync(type)

  return NextResponse.json(summary)
}
