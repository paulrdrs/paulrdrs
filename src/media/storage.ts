import "server-only"
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3"
import { getStorageEnvs } from "@/envs/server"

let client: S3Client | undefined

const getClient = () => {
  if (!client) {
    const storageEnvs = getStorageEnvs()

    client = new S3Client({
      credentials: {
        accessKeyId: storageEnvs.RAILWAY_STORAGE_ACCESS_KEY_ID,
        secretAccessKey: storageEnvs.RAILWAY_STORAGE_SECRET_ACCESS_KEY
      },
      endpoint: storageEnvs.RAILWAY_STORAGE_ENDPOINT,
      region: storageEnvs.RAILWAY_STORAGE_REGION
    })
  }

  return client
}

export const uploadMediaObject = async ({
  body,
  contentType,
  objectKey
}: {
  body: Uint8Array
  contentType: string
  objectKey: string
}) => {
  const storageEnvs = getStorageEnvs()

  await getClient().send(
    new PutObjectCommand({
      Body: body,
      Bucket: storageEnvs.RAILWAY_STORAGE_BUCKET,
      ContentType: contentType,
      Key: objectKey
    })
  )
}

export const getMediaObject = async (objectKey: string) => {
  const storageEnvs = getStorageEnvs()

  return getClient().send(
    new GetObjectCommand({
      Bucket: storageEnvs.RAILWAY_STORAGE_BUCKET,
      Key: objectKey
    })
  )
}
