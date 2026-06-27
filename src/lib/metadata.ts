import type { Metadata } from "next"

type ContentMetadataInput = {
  coverMediaId?: string | null
  description?: string | null
  path: string
  title: string
  type?: "article" | "website"
}

/**
 * Builds page-level metadata from CMS content. URLs are kept relative; Next
 * resolves them against `metadataBase` (set in the root layout).
 */
export const buildContentMetadata = ({
  coverMediaId,
  description,
  path,
  title,
  type = "article"
}: ContentMetadataInput): Metadata => {
  const trimmedDescription = description?.trim() || undefined
  const images = coverMediaId ? [{ url: `/media/${coverMediaId}` }] : undefined

  return {
    title,
    description: trimmedDescription,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: trimmedDescription,
      images,
      type,
      url: path
    }
  }
}
