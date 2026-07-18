import Link from "next/link"
import { ContentImage } from "./ContentImage"

type PhotoGridItem = {
  coverAltText?: string | null
  coverMediaId?: string | null
  excerpt: string | null
  id: string
  slug: string
  title: string
}

type PhotoGridProps = {
  photos: PhotoGridItem[]
}

export const PhotoGrid = ({ photos }: PhotoGridProps) => (
  <ul className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
    {photos.map((photo) => {
      const href = `/photo/${photo.slug}`

      return (
        <li className="group flex flex-col gap-4" key={photo.id}>
          {photo.coverMediaId ? (
            <Link href={href}>
              <ContentImage
                alt={photo.coverAltText ?? photo.title}
                id={photo.coverMediaId}
                presentation="photoCard"
              />
            </Link>
          ) : (
            <Link
              aria-label={`View ${photo.title}`}
              className="flex aspect-4/3 items-end border border-line p-4 text-muted hover:border-ink"
              href={href}
            >
              <span className="eyebrow">Photograph</span>
            </Link>
          )}
          <div className="flex flex-col gap-2 pt-1">
            <h2 className="font-black text-2xl">
              <Link className="hover:text-muted" href={href}>
                {photo.title}
              </Link>
            </h2>
            {photo.excerpt ? (
              <p className="max-w-xl text-muted">{photo.excerpt}</p>
            ) : null}
          </div>
        </li>
      )
    })}
  </ul>
)
