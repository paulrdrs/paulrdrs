import Image from "next/image"
import { siteEnvsSchema } from "@/envs/schemas"

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
  projectCard: {
    className: "aspect-4/3",
    sizes:
      "(min-width: 1024px) 464px, (min-width: 640px) calc(50vw - 3rem), calc(100vw - 2rem)"
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
  const { SITE_URL: siteUrl } = siteEnvsSchema.parse({
    SITE_URL: process.env.SITE_URL
  })
  const mediaUrl = new URL(`/media/${id}`, siteUrl).toString()

  return (
    <figure>
      <div className={`media-frame relative ${className}`}>
        <Image
          alt={alt ?? ""}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          fill
          priority={priority}
          sizes={sizes}
          src={mediaUrl}
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
