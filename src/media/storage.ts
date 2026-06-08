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
        accessKeyId: storageEnvs.STORAGE_ACCESS_KEY_ID,
        secretAccessKey: storageEnvs.STORAGE_SECRET_ACCESS_KEY
      },
      endpoint: storageEnvs.STORAGE_ENDPOINT,
      region: storageEnvs.STORAGE_REGION
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
      Bucket: storageEnvs.STORAGE_BUCKET,
      ContentType: contentType,
      Key: objectKey
    })
  )
}

export const getMediaObject = async (objectKey: string) => {
  const storageEnvs = getStorageEnvs()

  return getClient().send(
    new GetObjectCommand({
      Bucket: storageEnvs.STORAGE_BUCKET,
      Key: objectKey
    })
  )
}
