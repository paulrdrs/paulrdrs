import Image from "next/image"

type ContentImageProps = {
  alt?: string | null
  attribution?: string | null
  className?: string
  id: string
  priority?: boolean
}

export const ContentImage = ({
  alt,
  attribution,
  className = "aspect-[4/3]",
  id,
  priority = false
}: ContentImageProps) => (
  <figure>
    <div className={`media-frame relative ${className}`}>
      <Image
        alt={alt ?? ""}
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        fill
        priority={priority}
        sizes="(min-width: 1024px) 60vw, 100vw"
        src={`/media/${id}`}
        unoptimized
      />
    </div>
    {attribution ? (
      <figcaption className="mt-2 font-mono text-muted text-xs">
        {attribution}
      </figcaption>
    ) : null}
  </figure>
)
