import Image from "next/image"
import Link from "next/link"
import { Eyebrow } from "./Eyebrow"

type PostSnippetProps = {
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt?: string | null
  featuredPosition?: number
  href: string
  label: string
  priority?: boolean
  title: string
}

export const PostSnippet = ({
  coverAltText,
  coverAttribution,
  coverMediaId,
  excerpt,
  featuredPosition,
  href,
  label,
  priority = false,
  title
}: PostSnippetProps) => (
  <Link
    aria-label={title}
    className="group mx-4 my-2 flex flex-col gap-4 rounded border border-surface bg-surface p-4 shadow-lift hover:border-frontier sm:flex-row"
    data-feature-position={featuredPosition}
    href={href}
    data-component={"PostSnippet"}
  >
    {coverMediaId ? (
      <figure className="w-full sm:w-1/3 sm:shrink-0">
        <div
          className={`relative aspect-square overflow-hidden rounded bg-surface`}
        >
          <Image
            alt={coverAltText ?? ""}
            className="object-cover"
            fill
            priority={priority}
            sizes="(min-width: 896px) 448px, (min-width: 768px) 50vw, 100vw"
            src={`/media/${coverMediaId}`}
          />
        </div>
        {coverAttribution ? (
          <figcaption className="mt-2 font-mono text-muted text-xs">
            {coverAttribution}
          </figcaption>
        ) : null}
      </figure>
    ) : (
      <div
        aria-hidden="true"
        className="flex aspect-square w-full items-end border border-muted p-4 text-muted group-hover:border-accent sm:w-1/2 sm:shrink-0"
      >
        <Eyebrow label={label} />
      </div>
    )}
    <div className="flex min-w-0 flex-col gap-1 sm:flex-1">
      <Eyebrow label={label} />
      <h2
        className={`line-clamp-3 font-bold text-2xl group-hover:text-accent sm:text-3xl`}
      >
        {title}
      </h2>
      {excerpt ? (
        <p className="line-clamp-3 max-w-xl text-muted">{excerpt}</p>
      ) : null}
    </div>
  </Link>
)
