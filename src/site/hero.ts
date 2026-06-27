export const heroKinds = ["post", "project", "media"] as const

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

export const parseHeroSelectionValue = (
  value: string
): HeroSelection | null => {
  if (!value) {
    return null
  }

  const separator = value.indexOf(":")
  const kind = value.slice(0, separator)
  const id = value.slice(separator + 1)

  if (separator < 1 || !heroKinds.includes(kind as HeroKind) || !id) {
    throw new Error("Invalid hero selection")
  }

  return { id, kind: kind as HeroKind }
}

export const getHeroSelectionValue = (selection: HeroSelection | null) =>
  selection ? `${selection.kind}:${selection.id}` : ""
