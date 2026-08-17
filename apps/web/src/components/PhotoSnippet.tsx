import Image from "next/image"
import Link from "next/link"
import { Eyebrow } from "./Eyebrow"

type PhotoSnippetProps = {
  coverAltText?: string | null
  coverMediaId?: string | null
  excerpt?: string | null
  href: string
  label: string
  title: string
}

export const PhotoSnippet = ({
  coverAltText,
  coverMediaId,
  excerpt,
  href,
  label,
  title
}: PhotoSnippetProps) => (
  <Link
    aria-label={title}
    className="group flex flex-col gap-4 rounded-lg p-4 hover:bg-surface"
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
      </figure>
    ) : (
      <div
        aria-hidden="true"
        className="flex aspect-2/1 items-end border border-muted p-4 text-muted"
      >
        <Eyebrow label={label} />
      </div>
    )}
    <div className="flex flex-col gap-1">
      <Eyebrow label={label} />
      <h2 className="line-clamp-2 font-bold text-2xl sm:text-3xl">{title}</h2>
      {excerpt ? (
        <p className="line-clamp-3 max-w-xl text-muted">{excerpt}</p>
      ) : null}
    </div>
  </Link>
)
