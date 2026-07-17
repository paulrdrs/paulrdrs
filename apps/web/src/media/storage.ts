import "server-only"
import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3"

type BucketGlobal = typeof globalThis & {
  paulrdrsBucket?: S3Client
}

const bucketGlobal = globalThis as BucketGlobal

const getRequiredBucketEnvironment = () => {
  const accessKeyId = process.env.BUCKET_ACCESS_KEY_ID
  const bucketName = process.env.BUCKET_NAME
  const endpoint = process.env.BUCKET_ENDPOINT
  const secretAccessKey = process.env.BUCKET_SECRET_ACCESS_KEY

  if (!accessKeyId || !bucketName || !endpoint || !secretAccessKey) {
    throw new Error("Railway Bucket configuration is required")
  }

  return { accessKeyId, bucketName, endpoint, secretAccessKey }
}

const getBucketClient = () => {
  if (!bucketGlobal.paulrdrsBucket) {
    const { accessKeyId, endpoint, secretAccessKey } =
      getRequiredBucketEnvironment()

    bucketGlobal.paulrdrsBucket = new S3Client({
      credentials: { accessKeyId, secretAccessKey },
      endpoint,
      region: "us-east-1"
    })
  }

  return bucketGlobal.paulrdrsBucket
}

export const getMediaObject = async (objectKey: string) => {
  const { bucketName } = getRequiredBucketEnvironment()

  try {
    return await getBucketClient().send(
      new GetObjectCommand({ Bucket: bucketName, Key: objectKey })
    )
  } catch (error) {
    if (
      error instanceof Error &&
      "name" in error &&
      (error.name === "NoSuchKey" || error.name === "NotFound")
    ) {
      return null
    }

    throw error
  }
}
