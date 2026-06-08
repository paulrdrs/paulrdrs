import { type NextRequest, NextResponse } from "next/server"
import { getDashboardMediaAsset } from "@/db/adminContent"
import { getMediaObject } from "@/media/storage"

export const dynamic = "force-dynamic"

type MediaRouteProps = {
  params: Promise<{
    id: string
  }>
}

const toResponseBody = async (body: unknown) => {
  if (body instanceof ReadableStream) {
    return body
  }

  if (body instanceof Blob) {
    if ("stream" in body && typeof body.stream === "function") {
      return body.stream()
    }

    return new Uint8Array(await body.arrayBuffer())
  }

  return body as BodyInit
}

export const GET = async (
  _request: NextRequest,
  { params }: MediaRouteProps
) => {
  const { id } = await params
  const asset = await getDashboardMediaAsset(id)

  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const object = await getMediaObject(asset.objectKey)

  if (!object.Body) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return new NextResponse(await toResponseBody(object.Body), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": object.ContentType ?? asset.mimeType
    }
  })
}
