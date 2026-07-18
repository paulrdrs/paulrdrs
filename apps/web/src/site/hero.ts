const featuredKinds = ["post", "project"] as const

type FeaturedKind = (typeof featuredKinds)[number]

export type HomeFeaturedSelection = {
  id: string
  kind: FeaturedKind
}

const isHomeFeaturedSelection = (
  value: unknown
): value is HomeFeaturedSelection => {
  if (!value || typeof value !== "object") {
    return false
  }

  const { id, kind } = value as Record<string, unknown>

  return (
    typeof id === "string" &&
    id.length > 0 &&
    typeof kind === "string" &&
    featuredKinds.includes(kind as FeaturedKind)
  )
}

export const getHomeFeaturedSelections = (
  metadata: Record<string, unknown> | null | undefined
): HomeFeaturedSelection[] => {
  const featuredContent = metadata?.featuredContent

  if (!Array.isArray(featuredContent) || featuredContent.length > 3) {
    return []
  }

  if (!featuredContent.every(isHomeFeaturedSelection)) {
    return []
  }

  const selections = featuredContent as HomeFeaturedSelection[]
  const selectionKeys = selections.map(({ id, kind }) => `${kind}:${id}`)

  return new Set(selectionKeys).size === selectionKeys.length ? selections : []
}
