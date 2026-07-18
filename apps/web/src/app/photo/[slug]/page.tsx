import type { Metadata } from "next"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import { ContentBody } from "@/components/ContentBody"
import { ContentImage } from "@/components/ContentImage"
import { PageContainer } from "@/components/PageContainer"
import {
  getPhotoProjects,
  getPhotoSlugByPreviousSlug,
  getPublishedPhotoBySlug
} from "@/db/content"
import { blockTreeToPlainText } from "@/lib/content"
import { buildContentMetadata } from "@/lib/metadata"

export const revalidate = 300

// Empty params so nothing prerenders at build (D1 is unavailable there); pages
// render on the first request and are then cached (ISR).
export function generateStaticParams() {
  return []
}

type PhotoPageProps = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({
  params
}: PhotoPageProps): Promise<Metadata> {
  const { slug } = await params
  const photo = await getPublishedPhotoBySlug(slug)

  if (!photo) {
    return {}
  }

  return buildContentMetadata({
    coverMediaId: photo.coverMediaId,
    description:
      photo.excerpt ?? (photo.body ? blockTreeToPlainText(photo.body) : null),
    path: `/photo/${photo.slug}`,
    title: photo.title
  })
}

export default async function PhotoPage({ params }: PhotoPageProps) {
  const { slug } = await params
  const photo = await getPublishedPhotoBySlug(slug)

  if (!photo) {
    const currentSlug = await getPhotoSlugByPreviousSlug(slug)
    if (currentSlug) {
      permanentRedirect(`/photo/${currentSlug}`)
    }
    notFound()
  }

  const projects = await getPhotoProjects(photo.id)

  return (
    <PageContainer>
      <header className="flex flex-col gap-4 pb-4">
        <p className="eyebrow">Photograph</p>
        <h1 className="page-title">{photo.title}</h1>
        {photo.excerpt ? (
          <p className="max-w-2xl text-muted text-xl">{photo.excerpt}</p>
        ) : null}
      </header>
      {photo.coverMediaId ? (
        <ContentImage
          alt={photo.coverAltText ?? photo.title}
          attribution={photo.coverAttribution}
          id={photo.coverMediaId}
          presentation="photo"
          priority
        />
      ) : null}
      {(photo.body?.length ?? 0) > 0 ? (
        <div>
          <ContentBody body={photo.body} />
        </div>
      ) : null}
      {projects.length > 0 ? (
        <footer className="flex flex-col gap-2 border-line border-t pt-8">
          <p className="eyebrow">Appears in</p>
          <ul className="flex flex-col gap-1">
            {projects.map((project) => (
              <li key={`${project.category}/${project.slug}`}>
                <Link
                  className="hover:text-muted"
                  href={`/projects/${project.category}/${project.slug}`}
                >
                  {project.title}
                </Link>
              </li>
            ))}
          </ul>
        </footer>
      ) : null}
    </PageContainer>
  )
}
