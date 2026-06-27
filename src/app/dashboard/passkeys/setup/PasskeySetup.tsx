"use client"

import { startRegistration } from "@simplewebauthn/browser"
import { useState } from "react"

export function PasskeySetup() {
  const [error, setError] = useState(false)
  const [isPending, setIsPending] = useState(false)

  const register = async (formData: FormData) => {
    setError(false)
    setIsPending(true)

    const payload = {
      bootstrapSecret: String(formData.get("bootstrapSecret") ?? ""),
      email: String(formData.get("email") ?? "")
    }

    try {
      const optionsResponse = await fetch(
        "/dashboard/passkeys/registration/options",
        {
          body: JSON.stringify(payload),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        }
      )

      if (!optionsResponse.ok) {
        throw new Error("Could not start passkey setup")
      }

      const registrationResponse = await startRegistration({
        optionsJSON: await optionsResponse.json()
      })
      const verificationResponse = await fetch(
        "/dashboard/passkeys/registration/verify",
        {
          body: JSON.stringify({ ...payload, response: registrationResponse }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        }
      )

      if (!verificationResponse.ok) {
        throw new Error("Passkey setup failed")
      }

      window.location.assign("/dashboard")
    } catch {
      setError(true)
      setIsPending(false)
    }
  }

  return (
    <form action={register} className="flex max-w-md flex-col gap-4">
      <label className="field-label" htmlFor="email">
        Email
        <input
          className="field-control"
          id="email"
          name="email"
          required
          type="email"
        />
      </label>

      <label className="field-label" htmlFor="bootstrapSecret">
        Bootstrap secret
        <input
          className="field-control"
          id="bootstrapSecret"
          name="bootstrapSecret"
          required
          type="password"
        />
      </label>

      <button className="button" disabled={isPending} type="submit">
        {isPending ? "Registering..." : "Register passkey"}
      </button>

      {error ? (
        <p className="text-muted text-sm">Passkey setup failed.</p>
      ) : null}
    </form>
  )
}
