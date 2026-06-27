import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
  WebAuthnCredential
} from "@simplewebauthn/server"
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from "@simplewebauthn/server"
import { and, desc, eq, gt, isNotNull, isNull, lt, or } from "drizzle-orm"
import { getDb } from "@/db/client"
import { adminPasskeys, webauthnChallenges } from "@/db/schema"
import { getAuthEnvs } from "@/envs/server"
import { WEBAUTHN_CHALLENGE_TTL_MINUTES } from "./constants"
import { isAllowedAdminEmail, normalizeEmail } from "./tokens"

type WebAuthnChallengeType = "authentication" | "registration"

type PasskeyRegistrationInput = {
  email: string
}

type PasskeyRegistrationVerificationInput = {
  email: string
  response: RegistrationResponseJSON
}

type PasskeyAuthenticationVerificationInput = {
  response: AuthenticationResponseJSON
}

export type DashboardPasskey = {
  createdAt: Date
  credentialDeviceType: string | null
  email: string
  id: string
  lastUsedAt: Date | null
  transports: string[]
}

const rpName = "paulrdrs.com"

const minutesFromNow = (minutes: number, now = new Date()) =>
  new Date(now.getTime() + minutes * 60 * 1000)

const toBase64Url = (value: Uint8Array) =>
  Buffer.from(value).toString("base64url")

const fromBase64Url = (value: string) => Buffer.from(value, "base64url")

export const getPasskeyConfig = () => {
  const authEnvs = getAuthEnvs()
  const siteUrl = new URL(authEnvs.SITE_URL)
  const rpID = authEnvs.PASSKEY_RP_ID ?? siteUrl.hostname.replace(/^www\./, "")

  return {
    allowlist: authEnvs.ADMIN_EMAIL_ALLOWLIST,
    bootstrapSecret: authEnvs.PASSKEY_BOOTSTRAP_SECRET,
    expectedOrigin: siteUrl.origin,
    rpID
  }
}

export const verifyBootstrapSecret = (value: string) => {
  return value === getPasskeyConfig().bootstrapSecret
}

export const assertAllowedAdminEmail = (email: string) => {
  const { allowlist } = getPasskeyConfig()

  if (!isAllowedAdminEmail(email, allowlist)) {
    throw new Error("Email is not allowed")
  }

  return normalizeEmail(email)
}

const createChallenge = async ({
  challenge,
  email,
  type
}: {
  challenge: string
  email?: string | null
  type: WebAuthnChallengeType
}) => {
  await getDb()
    .insert(webauthnChallenges)
    .values({
      challenge,
      email,
      expiresAt: minutesFromNow(WEBAUTHN_CHALLENGE_TTL_MINUTES),
      type
    })
}

const getValidChallenge = async ({
  challenge,
  email,
  now = new Date(),
  type
}: {
  challenge: string
  email?: string | null
  now?: Date
  type: WebAuthnChallengeType
}) => {
  const where = email
    ? and(
        eq(webauthnChallenges.challenge, challenge),
        eq(webauthnChallenges.type, type),
        eq(webauthnChallenges.email, email),
        isNull(webauthnChallenges.consumedAt),
        gt(webauthnChallenges.expiresAt, now)
      )
    : and(
        eq(webauthnChallenges.challenge, challenge),
        eq(webauthnChallenges.type, type),
        isNull(webauthnChallenges.consumedAt),
        gt(webauthnChallenges.expiresAt, now)
      )

  const [existingChallenge] = await getDb()
    .select({ id: webauthnChallenges.id })
    .from(webauthnChallenges)
    .where(where)
    .limit(1)

  return existingChallenge
}

const consumeChallenge = async (challenge: string) => {
  await getDb()
    .update(webauthnChallenges)
    .set({ consumedAt: new Date() })
    .where(eq(webauthnChallenges.challenge, challenge))
}

export const deleteExpiredChallenges = async (now = new Date()) => {
  await getDb()
    .delete(webauthnChallenges)
    .where(
      or(
        lt(webauthnChallenges.expiresAt, now),
        isNotNull(webauthnChallenges.consumedAt)
      )
    )
}

export const getPasskeysByEmail = async (email: string) => {
  return getDb()
    .select()
    .from(adminPasskeys)
    .where(eq(adminPasskeys.email, normalizeEmail(email)))
    .orderBy(desc(adminPasskeys.createdAt))
}

export const getDashboardPasskeys = async (
  email: string
): Promise<DashboardPasskey[]> => {
  const passkeys = await getPasskeysByEmail(email)

  return passkeys.map((passkey) => ({
    createdAt: passkey.createdAt,
    credentialDeviceType: passkey.credentialDeviceType,
    email: passkey.email,
    id: passkey.id,
    lastUsedAt: passkey.lastUsedAt,
    transports: passkey.transports
  }))
}

export const getPasskeyRegistrationOptions = async ({
  email
}: PasskeyRegistrationInput) => {
  const normalizedEmail = assertAllowedAdminEmail(email)
  const existingPasskeys = await getPasskeysByEmail(normalizedEmail)
  const { rpID } = getPasskeyConfig()
  const options = await generateRegistrationOptions({
    attestationType: "none",
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "required"
    },
    excludeCredentials: existingPasskeys.map((passkey) => ({
      id: passkey.credentialId,
      transports: passkey.transports as AuthenticatorTransportFuture[]
    })),
    rpID,
    rpName,
    userDisplayName: normalizedEmail,
    userName: normalizedEmail
  })

  await createChallenge({
    challenge: options.challenge,
    email: normalizedEmail,
    type: "registration"
  })

  return options
}

export const verifyPasskeyRegistration = async ({
  email,
  response
}: PasskeyRegistrationVerificationInput) => {
  const normalizedEmail = assertAllowedAdminEmail(email)
  const { expectedOrigin, rpID } = getPasskeyConfig()
  let verifiedChallenge: string | undefined
  const verification = await verifyRegistrationResponse({
    expectedChallenge: async (challenge) => {
      const existingChallenge = await getValidChallenge({
        challenge,
        email: normalizedEmail,
        type: "registration"
      })

      if (existingChallenge) {
        verifiedChallenge = challenge
      }

      return Boolean(existingChallenge)
    },
    expectedOrigin,
    expectedRPID: rpID,
    requireUserVerification: true,
    response
  })

  if (!(verification.verified && verification.registrationInfo)) {
    throw new Error("Passkey registration could not be verified")
  }

  const { credential, credentialBackedUp, credentialDeviceType } =
    verification.registrationInfo

  await getDb()
    .insert(adminPasskeys)
    .values({
      counter: credential.counter,
      credentialBackedUp,
      credentialDeviceType,
      credentialId: credential.id,
      credentialPublicKey: toBase64Url(credential.publicKey),
      email: normalizedEmail,
      transports: credential.transports ?? response.response.transports ?? []
    })
    .onConflictDoUpdate({
      set: {
        counter: credential.counter,
        credentialBackedUp,
        credentialDeviceType,
        credentialPublicKey: toBase64Url(credential.publicKey),
        transports: credential.transports ?? response.response.transports ?? [],
        updatedAt: new Date()
      },
      target: adminPasskeys.credentialId
    })

  if (verifiedChallenge) {
    await consumeChallenge(verifiedChallenge)
  }

  return normalizedEmail
}

export const getPasskeyAuthenticationOptions = async () => {
  const { rpID } = getPasskeyConfig()
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required"
  })

  await createChallenge({
    challenge: options.challenge,
    type: "authentication"
  })

  return options
}

const toWebAuthnCredential = (
  passkey: typeof adminPasskeys.$inferSelect
): WebAuthnCredential => ({
  counter: passkey.counter,
  id: passkey.credentialId,
  publicKey: fromBase64Url(passkey.credentialPublicKey),
  transports: passkey.transports as AuthenticatorTransportFuture[]
})

export const verifyPasskeyAuthentication = async ({
  response
}: PasskeyAuthenticationVerificationInput) => {
  const [passkey] = await getDb()
    .select()
    .from(adminPasskeys)
    .where(eq(adminPasskeys.credentialId, response.id))
    .limit(1)

  if (!passkey) {
    throw new Error("Passkey is not registered")
  }

  const { expectedOrigin, rpID } = getPasskeyConfig()
  let verifiedChallenge: string | undefined
  const verification = await verifyAuthenticationResponse({
    credential: toWebAuthnCredential(passkey),
    expectedChallenge: async (challenge) => {
      const existingChallenge = await getValidChallenge({
        challenge,
        type: "authentication"
      })

      if (existingChallenge) {
        verifiedChallenge = challenge
      }

      return Boolean(existingChallenge)
    },
    expectedOrigin,
    expectedRPID: rpID,
    requireUserVerification: true,
    response
  })

  if (!verification.verified) {
    throw new Error("Passkey authentication could not be verified")
  }

  await getDb()
    .update(adminPasskeys)
    .set({
      counter: verification.authenticationInfo.newCounter,
      credentialBackedUp: verification.authenticationInfo.credentialBackedUp,
      credentialDeviceType:
        verification.authenticationInfo.credentialDeviceType,
      lastUsedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(adminPasskeys.id, passkey.id))

  if (verifiedChallenge) {
    await consumeChallenge(verifiedChallenge)
  }

  return passkey.email
}

export const deletePasskey = async ({
  email,
  id
}: {
  email: string
  id: string
}) => {
  const passkeys = await getPasskeysByEmail(email)

  if (passkeys.length <= 1) {
    throw new Error("Cannot delete the last passkey")
  }

  await getDb()
    .delete(adminPasskeys)
    .where(and(eq(adminPasskeys.id, id), eq(adminPasskeys.email, email)))
}
