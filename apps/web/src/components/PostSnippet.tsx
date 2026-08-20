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
  tags?: readonly string[]
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
  tags = [],
  title
}: PostSnippetProps) => (
  <Link
    aria-label={title}
    className="group flex flex-col gap-4 rounded-lg p-4 hover:bg-surface sm:flex-row"
    data-feature-position={featuredPosition}
    href={href}
    data-component={"PostSnippet"}
  >
    <div className="flex w-full flex-col justify-between">
      <div className="flex w-full flex-col gap-1 sm:flex-1">
        <h2 className={`line-clamp-3 font-bold text-2xl sm:text-3xl`}>
          {title}
        </h2>
        {excerpt ? (
          <p className="line-clamp-5 max-w-xl text-muted">{excerpt}</p>
        ) : null}
        <Eyebrow label={label} />
      </div>

      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1" data-component="PostSnippetTags">
          {tags.map((tag) => (
            <span
              className="rounded-sm border border-limit bg-canvas px-2 font-medium font-mono text-muted text-xs uppercase tracking-widest"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>

    {coverMediaId ? (
      <figure className="w-full sm:w-1/3 sm:shrink-0">
        <div className={`relative aspect-square overflow-hidden rounded`}>
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
        className="flex aspect-square w-full items-end border border-muted p-4 text-muted sm:w-1/2 sm:shrink-0"
      >
        <Eyebrow label={label} />
      </div>
    )}
  </Link>
)
