import Image from "next/image"

type ContentImageProps = {
  alt?: string | null
  attribution?: string | null
  id: string
  presentation?: keyof typeof imagePresentations
  priority?: boolean
}

const imagePresentations = {
  body: {
    className: "aspect-[4/3]",
    sizes:
      "(min-width: 1024px) 960px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
  },
  contentCard: {
    className: "aspect-4/3",
    sizes:
      "(min-width: 1024px) 464px, (min-width: 640px) calc(50vw - 3rem), calc(100vw - 2rem)"
  },
  hero: {
    className: "aspect-4/3 lg:aspect-5/4",
    sizes:
      "(min-width: 1024px) 547px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
  },
  photo: {
    className: "aspect-auto min-h-96",
    sizes:
      "(min-width: 1024px) 960px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
  },
  photoCard: {
    className: "aspect-4/3",
    sizes:
      "(min-width: 1024px) 299px, (min-width: 640px) calc(50vw - 3rem), calc(100vw - 2rem)"
  },
  wide: {
    className: "aspect-video",
    sizes:
      "(min-width: 1024px) 960px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2rem)"
  }
} as const

export const ContentImage = ({
  alt,
  attribution,
  id,
  presentation = "body",
  priority = false
}: ContentImageProps) => {
  const { className, sizes } = imagePresentations[presentation]
  return (
    <figure>
      <div className={`relative overflow-hidden bg-surface ${className}`}>
        <Image
          alt={alt ?? ""}
          className="object-cover"
          fill
          priority={priority}
          sizes={sizes}
          src={`/media/${id}`}
        />
      </div>
      {attribution ? (
        <figcaption className="mt-2 font-mono text-muted text-xs">
          {attribution}
        </figcaption>
      ) : null}
    </figure>
  )
}
