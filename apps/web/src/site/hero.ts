export const heroKinds = ["post", "project", "photo"] as const

export type HeroKind = (typeof heroKinds)[number]

export type HeroSelection = {
  id: string
  kind: HeroKind
}

export type HeroMetadata = {
  hero?: HeroSelection | null
}

export const getHeroSelection = (
  metadata: Record<string, unknown> | null | undefined
): HeroSelection | null => {
  const hero = metadata?.hero

  if (!hero || typeof hero !== "object") {
    return null
  }

  const { id, kind } = hero as Record<string, unknown>

  if (
    typeof id !== "string" ||
    !id ||
    typeof kind !== "string" ||
    !heroKinds.includes(kind as HeroKind)
  ) {
    return null
  }

  return { id, kind: kind as HeroKind }
}
