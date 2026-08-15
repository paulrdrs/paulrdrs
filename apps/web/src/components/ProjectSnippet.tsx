import Image from "next/image"
import Link from "next/link"
import { Eyebrow } from "./Eyebrow"

type ProjectSnippetProps = {
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt?: string | null
  href: string
  label: string
  title: string
}

export const ProjectSnippet = ({
  coverAltText,
  coverAttribution,
  coverMediaId,
  excerpt,
  href,
  label,
  title
}: ProjectSnippetProps) => (
  <Link
    aria-label={title}
    className="group mx-4 my-2 flex flex-col gap-4 rounded border border-surface bg-surface p-4 pb-6 shadow-lift hover:border-frontier"
    href={href}
  >
    {coverMediaId ? (
      <figure>
        <div className="relative aspect-square overflow-hidden bg-surface sm:aspect-2/1">
          <Image
            alt={coverAltText ?? ""}
            className="object-cover"
            fill
            sizes="(min-width: 896px) 896px, 100vw"
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
        className="flex aspect-2/1 items-end border border-muted p-4 text-muted group-hover:border-accent"
      >
        <Eyebrow label={label} />
      </div>
    )}
    <div className="flex flex-col gap-1">
      <Eyebrow label={label} />
      <h2 className="line-clamp-2 font-bold text-2xl group-hover:text-accent sm:text-3xl">
        {title}
      </h2>
      {excerpt ? (
        <p className="line-clamp-3 max-w-xl text-muted">{excerpt}</p>
      ) : null}
    </div>
  </Link>
)
