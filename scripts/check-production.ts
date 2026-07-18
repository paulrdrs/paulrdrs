import { execFileSync } from "node:child_process"

const productionOrigin = "https://web.paulrdrs.workers.dev"
const productionQuery = `
  SELECT id, title, slug, cover_media_id AS coverMediaId
  FROM posts
  WHERE status = 'published';
  SELECT id, title, slug, category, cover_media_id AS coverMediaId
  FROM projects
  WHERE status = 'published';
  SELECT metadata
  FROM pages
  WHERE key = 'home' AND status = 'published'
  LIMIT 1;
`

type ContentRow = {
  coverMediaId: string | null
  id: string
  title: string
}

type FeaturedSelection = {
  id: string
  kind: "post" | "project"
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value)

const readResultSets = (value: unknown): Record<string, unknown>[][] => {
  if (!Array.isArray(value)) {
    throw new Error("Wrangler returned an invalid D1 result")
  }

  return value.map((statementResult) => {
    if (!isRecord(statementResult) || !Array.isArray(statementResult.results)) {
      throw new Error("Wrangler returned an invalid D1 statement result")
    }

    if (!statementResult.results.every(isRecord)) {
      throw new Error("Wrangler returned an invalid D1 row")
    }

    return statementResult.results
  })
}

const readContentRows = (rows: Record<string, unknown>[]): ContentRow[] =>
  rows.map((row) => {
    const { coverMediaId, id, title } = row

    if (
      typeof id !== "string" ||
      typeof title !== "string" ||
      (coverMediaId !== null && typeof coverMediaId !== "string")
    ) {
      throw new Error("Production D1 returned an invalid content row")
    }

    return { coverMediaId, id, title }
  })

const readFeaturedSelections = (
  rows: Record<string, unknown>[]
): FeaturedSelection[] => {
  const metadataValue = rows.at(0)?.metadata
  const metadata: unknown =
    typeof metadataValue === "string"
      ? JSON.parse(metadataValue)
      : metadataValue

  if (!isRecord(metadata) || !Array.isArray(metadata.featuredContent)) {
    return []
  }

  return metadata.featuredContent.map((selection) => {
    if (!isRecord(selection)) {
      throw new Error("Home metadata contains an invalid feature")
    }

    const { id, kind } = selection
    if (typeof id !== "string" || (kind !== "post" && kind !== "project")) {
      throw new Error("Home metadata contains an invalid feature")
    }

    return { id, kind }
  })
}

const countMatches = (value: string, pattern: RegExp) =>
  value.match(pattern)?.length ?? 0

const queryProductionDatabase = () => {
  const output = execFileSync(
    "pnpm",
    [
      "exec",
      "wrangler",
      "d1",
      "execute",
      "DB",
      "--config",
      "apps/web/wrangler.jsonc",
      "--remote",
      "--json",
      "--command",
      productionQuery
    ],
    { encoding: "utf8" }
  )

  const [postRows = [], projectRows = [], pageRows = []] = readResultSets(
    JSON.parse(output) as unknown
  )

  return {
    featuredSelections: readFeaturedSelections(pageRows),
    posts: readContentRows(postRows),
    projects: readContentRows(projectRows)
  }
}

const fetchHtml = async (path: string) => {
  const response = await fetch(new URL(path, productionOrigin))
  if (!response.ok) {
    throw new Error(`${path} returned HTTP ${response.status}`)
  }

  return response.text()
}

const validateDatabase = (
  featuredSelections: FeaturedSelection[],
  posts: ContentRow[],
  projects: ContentRow[]
) => {
  const failures: string[] = []

  if (featuredSelections.length === 0) {
    failures.push("the published Home row has no featuredContent metadata")
  }

  const postsById = new Map(posts.map((post) => [post.id, post]))
  const projectsById = new Map(projects.map((project) => [project.id, project]))
  const featuredRows = featuredSelections.map(({ id, kind }) =>
    kind === "post" ? postsById.get(id) : projectsById.get(id)
  )

  if (featuredRows.some((row) => row === undefined)) {
    failures.push("Home metadata references missing or unpublished content")
  }

  return { failures, featuredRows }
}

const validateHtml = (
  homeHtml: string,
  blogHtml: string,
  featuredSelections: FeaturedSelection[],
  featuredRows: Array<ContentRow | undefined>,
  posts: ContentRow[]
) => {
  const failures: string[] = []
  const expectedHomeImages = featuredRows.filter(
    (row) => row?.coverMediaId
  ).length
  const expectedBlogImages = posts.filter((post) => post.coverMediaId).length

  if (!homeHtml.includes('data-content-list="home-features"')) {
    failures.push("the homepage is not serving the current feature-list build")
  }
  if (!blogHtml.includes('data-content-list="blog-posts"')) {
    failures.push("the blog is not serving the current preview-list build")
  }

  const renderedHomeFeatures = countMatches(homeHtml, /data-feature-position=/g)
  if (renderedHomeFeatures !== featuredSelections.length) {
    failures.push(
      `the homepage renders ${renderedHomeFeatures} of ${featuredSelections.length} configured features`
    )
  }

  const renderedHomeImages = countMatches(homeHtml, /<img\b/g)
  if (renderedHomeImages < expectedHomeImages) {
    failures.push(
      `the homepage renders ${renderedHomeImages} of ${expectedHomeImages} expected preview images`
    )
  }

  const renderedBlogImages = countMatches(blogHtml, /<img\b/g)
  if (renderedBlogImages < expectedBlogImages) {
    failures.push(
      `the blog renders ${renderedBlogImages} of ${expectedBlogImages} expected preview images`
    )
  }

  return { failures, renderedBlogImages, renderedHomeImages }
}

const validateSampleMedia = async (
  featuredRows: Array<ContentRow | undefined>,
  posts: ContentRow[]
) => {
  const failures: string[] = []
  const sampleMediaId =
    featuredRows.find((row) => row?.coverMediaId)?.coverMediaId ??
    posts.find((post) => post.coverMediaId)?.coverMediaId

  if (!sampleMediaId) {
    return failures
  }

  const mediaResponse = await fetch(
    new URL(`/media/${sampleMediaId}`, productionOrigin)
  )
  const contentType = mediaResponse.headers.get("content-type") ?? ""
  if (!mediaResponse.ok || !contentType.startsWith("image/")) {
    failures.push(
      `sample media returned HTTP ${mediaResponse.status} (${contentType || "no content type"})`
    )
  }

  return failures
}

const main = async () => {
  const { featuredSelections, posts, projects } = queryProductionDatabase()
  const databaseValidation = validateDatabase(
    featuredSelections,
    posts,
    projects
  )
  const [homeHtml, blogHtml, mediaFailures] = await Promise.all([
    fetchHtml("/"),
    fetchHtml("/blog"),
    validateSampleMedia(databaseValidation.featuredRows, posts)
  ])
  const htmlValidation = validateHtml(
    homeHtml,
    blogHtml,
    featuredSelections,
    databaseValidation.featuredRows,
    posts
  )
  const failures = [
    ...databaseValidation.failures,
    ...htmlValidation.failures,
    ...mediaFailures
  ]

  if (failures.length > 0) {
    console.error("Production verification failed:")
    for (const failure of failures) {
      console.error(`  ✗ ${failure}`)
    }
    process.exitCode = 1
    return
  }

  console.log(
    `Production verified: ${featuredSelections.length} Home features, ${htmlValidation.renderedHomeImages} Home images, ${htmlValidation.renderedBlogImages} Blog images ✓`
  )
}

await main()
