import Link from "next/link"
import type { FeaturedHomeContentItem } from "@/db/content"
import { ContentImage } from "./ContentImage"

type HomeFeaturesProps = {
  items: FeaturedHomeContentItem[]
}

export const HomeFeatures = ({ items }: HomeFeaturesProps) => {
  if (items.length === 0) {
    return null
  }

  return (
    <ol className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <li
          className="group flex flex-col gap-4"
          data-feature-position={index + 1}
          key={`${item.kind}:${item.id}`}
        >
          {item.coverMediaId ? (
            <Link href={item.href}>
              <ContentImage
                alt={item.coverAltText}
                id={item.coverMediaId}
                presentation="homeCard"
                priority={index === 0}
              />
            </Link>
          ) : (
            <Link
              aria-label={`View ${item.title}`}
              className="flex aspect-4/3 items-end border border-line p-4 text-muted hover:border-ink"
              href={item.href}
            >
              <span className="eyebrow">{item.label}</span>
            </Link>
          )}
          <div className="flex flex-col gap-2 pt-1">
            <p className="eyebrow">{item.label}</p>
            <h2 className="font-black text-2xl">
              <Link className="hover:text-muted" href={item.href}>
                {item.title}
              </Link>
            </h2>
            {item.excerpt ? (
              <p className="max-w-xl text-muted">{item.excerpt}</p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  )
}
