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
    className="group flex flex-col gap-4 rounded-lg p-4 hover:bg-surface sm:flex-row"
    href={href}
    data-component="SoftwareProjectSnippet"
  >
    <div
      className="relative flex aspect-video w-full overflow-hidden rounded bg-surface p-4"
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
            className="absolute inset-0 bg-canvas/80 transition-colors duration-300 ease-out group-hover:bg-canvas/50"
          />
        </>
      ) : null}

      <div className="relative z-10 mt-auto flex h-full w-full flex-col items-center justify-center gap-1">
        <Eyebrow label={label} />

        <div className="flex flex-col justify-center gap-1 p-2">
          <h2 className="line-clamp-2 text-center font-black font-mono text-2xl text-ink uppercase tracking-widest sm:text-3xl">
            {title}
          </h2>
          {excerpt ? (
            <p className="line-clamp-3 max-w-xl text-center font-medium font-mono text-muted leading-6">
              {excerpt}
            </p>
          ) : null}
          {coverAttribution ? (
            <span className="text-center font-mono text-muted text-xs">
              {coverAttribution}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  </Link>
)
