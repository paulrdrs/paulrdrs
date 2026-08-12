import { PageContainer } from "@/components/PageContainer"
import { PhotoList } from "@/components/PhotoList"
import { getPublishedPhotos } from "@/db/content"

export const dynamic = "force-dynamic"

export default async function PhotoGalleryPage() {
  const photos = await getPublishedPhotos()

  return (
    <PageContainer>
      <header>
        <h1 className="page-title">Photography</h1>
      </header>

      {photos.length > 0 ? (
        <PhotoList photos={photos} />
      ) : (
        <div className="empty-state">No photographs published yet.</div>
      )}
    </PageContainer>
  )
}
