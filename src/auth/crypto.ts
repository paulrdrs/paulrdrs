import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual
} from "node:crypto"

const sha256Hex = (value: string) =>
  createHash("sha256").update(value).digest("hex")

export const createOpaqueToken = () => randomBytes(32).toString("base64url")

export const hashToken = (token: string) => sha256Hex(token)

export const signValue = (value: string, secret: string) =>
  createHmac("sha256", secret).update(value).digest("base64url")

export const createSignedValue = (value: string, secret: string) =>
  `${value}.${signValue(value, secret)}`

export const verifySignedValue = (signedValue: string, secret: string) => {
  const separatorIndex = signedValue.lastIndexOf(".")

  if (separatorIndex <= 0) {
    return undefined
  }

  const value = signedValue.slice(0, separatorIndex)
  const signature = signedValue.slice(separatorIndex + 1)
  const expectedSignature = signValue(value, secret)
  const signatureBuffer = Buffer.from(signature)
  const expectedSignatureBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return undefined
  }

  return timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
    ? value
    : undefined
}
