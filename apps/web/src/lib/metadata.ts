import type { Metadata } from "next"

type ContentMetadataInput = {
  coverMediaId?: string | null
  description?: string | null
  path: string
  title: string
  type?: "article" | "website"
}

// Keep URLs relative so Next resolves them against the root metadataBase.
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
