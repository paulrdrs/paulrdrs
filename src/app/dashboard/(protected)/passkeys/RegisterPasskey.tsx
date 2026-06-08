"use client"

import { startRegistration } from "@simplewebauthn/browser"
import { useState } from "react"

export function RegisterPasskey() {
  const [error, setError] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const register = async () => {
    setError(false)
    setIsPending(true)

    try {
      const optionsResponse = await fetch(
        "/dashboard/passkeys/registration/options",
        {
          body: JSON.stringify({}),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        }
      )

      if (!optionsResponse.ok) {
        throw new Error("Could not start passkey registration")
      }

      const registrationResponse = await startRegistration({
        optionsJSON: await optionsResponse.json()
      })
      const verificationResponse = await fetch(
        "/dashboard/passkeys/registration/verify",
        {
          body: JSON.stringify({ response: registrationResponse }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        }
      )

      if (!verificationResponse.ok) {
        throw new Error("Passkey registration failed")
      }

      window.location.reload()
    } catch {
      setError(true)
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className="border border-current px-3 py-2 font-mono text-sm hover:bg-black hover:text-white"
        disabled={isPending}
        onClick={register}
        type="button"
      >
        {isPending ? "Registering..." : "Register passkey"}
      </button>
      {error ? (
        <p className="font-medium">Passkey registration failed.</p>
      ) : null}
    </div>
  )
}
