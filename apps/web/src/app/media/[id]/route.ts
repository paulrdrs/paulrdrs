import { type NextRequest, NextResponse } from "next/server"
import { getMediaAssetLocation } from "@/db/media"
import { getMediaObject } from "@/media/storage"

export const dynamic = "force-dynamic"

type MediaRouteProps = {
  params: Promise<{
    id: string
  }>
}

export const GET = async (
  _request: NextRequest,
  { params }: MediaRouteProps
) => {
  const { id } = await params
  const asset = await getMediaAssetLocation(id)

  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const object = await getMediaObject(asset.objectKey)

  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(object.body, {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": object.httpMetadata?.contentType ?? asset.mimeType
    }
  })
}
