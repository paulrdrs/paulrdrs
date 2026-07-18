import Link from "next/link"
import { ContentImage } from "./ContentImage"

type ContentSnippetProps = {
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

export const ContentSnippet = ({
  coverAltText,
  coverAttribution,
  coverMediaId,
  excerpt,
  featuredPosition,
  href,
  label,
  priority = false,
  title
}: ContentSnippetProps) => (
  <Link
    aria-label={title}
    className="group flex flex-col gap-4 px-4"
    data-feature-position={featuredPosition}
    href={href}
  >
    {coverMediaId ? (
      <ContentImage
        alt={coverAltText}
        attribution={coverAttribution}
        id={coverMediaId}
        presentation="contentCard"
        priority={priority}
      />
    ) : (
      <div
        aria-hidden="true"
        className="flex aspect-4/3 items-end border border-line p-4 text-muted group-hover:border-ink"
      >
        <span className="eyebrow">{label}</span>
      </div>
    )}
    <div className="flex flex-col gap-2 pt-1">
      <p className="eyebrow">{label}</p>
      <h2 className="font-black text-2xl group-hover:text-muted">{title}</h2>
      {excerpt ? <p className="max-w-xl text-muted">{excerpt}</p> : null}
    </div>
  </Link>
)
