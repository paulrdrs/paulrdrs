import { ContentSnippet } from "./ContentSnippet"

type PhotoListItem = {
  coverAltText?: string | null
  coverMediaId?: string | null
  excerpt: string | null
  id: string
  slug: string
  title: string
}

type PhotoListProps = {
  photos: PhotoListItem[]
}

export const PhotoList = ({ photos }: PhotoListProps) => (
  <ul className="flex flex-col gap-12 sm:flex-row sm:flex-wrap sm:gap-x-8">
    {photos.map((photo) => (
      <ContentSnippet
        coverAltText={photo.coverAltText ?? photo.title}
        coverMediaId={photo.coverMediaId}
        excerpt={photo.excerpt}
        href={`/photo/${photo.slug}`}
        label="Photograph"
        title={photo.title}
        key={photo.id}
      />
    ))}
  </ul>
)
