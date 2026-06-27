"use client"

import { startAuthentication } from "@simplewebauthn/browser"
import { useState } from "react"

export function PasskeyLogin() {
  const [error, setError] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const signIn = async () => {
    setError(false)
    setIsPending(true)

    try {
      const optionsResponse = await fetch(
        "/dashboard/passkeys/authentication/options",
        { method: "POST" }
      )

      if (!optionsResponse.ok) {
        throw new Error("Could not start passkey sign-in")
      }

      const authenticationResponse = await startAuthentication({
        optionsJSON: await optionsResponse.json()
      })
      const verificationResponse = await fetch(
        "/dashboard/passkeys/authentication/verify",
        {
          body: JSON.stringify({ response: authenticationResponse }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        }
      )

      if (!verificationResponse.ok) {
        throw new Error("Passkey sign-in failed")
      }

      window.location.assign("/dashboard")
    } catch {
      setError(true)
      setIsPending(false)
    }
  }

  return (
    <div className="flex max-w-md flex-col gap-4">
      <button
        className="button"
        disabled={isPending}
        onClick={signIn}
        type="button"
      >
        {isPending ? "Signing in..." : "Sign in with passkey"}
      </button>

      {error ? (
        <p className="border-line border-l-2 pl-4 text-muted text-sm">
          Passkey sign-in failed.
        </p>
      ) : null}
    </div>
  )
}
