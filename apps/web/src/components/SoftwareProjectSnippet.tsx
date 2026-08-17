import Image from "next/image"
import Link from "next/link"
import { Eyebrow } from "./Eyebrow"

type SoftwareProjectSnippetProps = {
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt?: string | null
  href: string
  label: string
  title: string
}

export const SoftwareProjectSnippet = ({
  coverAltText,
  coverAttribution,
  coverMediaId,
  excerpt,
  href,
  label,
  title
}: SoftwareProjectSnippetProps) => (
  <Link
    aria-label={title}
    className="group mx-4 my-2 flex flex-col gap-4 rounded bg-surface shadow-lift"
    href={href}
    data-component="SoftwareProjectSnippet"
  >
    <div
      className="relative flex aspect-square overflow-hidden rounded bg-surface p-4"
      data-testid="content"
    >
      {coverMediaId ? (
        <>
          <Image
            alt={coverAltText ?? ""}
            className="object-cover"
            fill
            sizes="(min-width: 896px) 896px, 100vw"
            src={`/media/${coverMediaId}`}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/50 transition-colors duration-300 ease-out group-hover:bg-ink/0"
          />
        </>
      ) : null}
      <div className="relative z-10 mt-auto flex flex-col gap-1">
        <Eyebrow label={label} />

        <div className="flex flex-col gap-1 rounded bg-canvas p-2">
          <h2 className="line-clamp-2 font-bold font-mono text-2xl text-ink sm:text-3xl">
            {title}
          </h2>
          {excerpt ? (
            <p className="line-clamp-3 max-w-xl font-medium font-mono text-muted leading-6">
              {excerpt}
            </p>
          ) : null}
          {coverAttribution ? (
            <span className="font-mono text-muted text-xs">
              {coverAttribution}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  </Link>
)
