"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { requireDashboardSession } from "@/auth/guards"
import { createDashboardMediaAsset } from "@/db/adminContent"
import { uploadMediaObject } from "@/media/storage"
import { buildMediaObjectKey, parseMediaUploadForm } from "@/media/upload"

export const uploadMediaAction = async (formData: FormData) => {
  await requireDashboardSession()

  const { altText, attribution, file } = parseMediaUploadForm(formData)
  const objectKey = buildMediaObjectKey(file.name)
  const body = new Uint8Array(await file.arrayBuffer())

  await uploadMediaObject({
    body,
    contentType: file.type,
    objectKey
  })

  await createDashboardMediaAsset({
    altText,
    attribution,
    filename: file.name,
    mimeType: file.type,
    objectKey,
    sizeBytes: file.size
  })

  revalidatePath("/dashboard/media")
  redirect("/dashboard/media")
}
