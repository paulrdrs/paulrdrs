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
      <label className="flex flex-col gap-2 font-mono text-sm" htmlFor="email">
        Email
        <input
          className="border border-current bg-transparent px-3 py-2 font-sans text-base"
          id="email"
          name="email"
          required
          type="email"
        />
      </label>

      <label
        className="flex flex-col gap-2 font-mono text-sm"
        htmlFor="bootstrapSecret"
      >
        Bootstrap secret
        <input
          className="border border-current bg-transparent px-3 py-2 font-sans text-base"
          id="bootstrapSecret"
          name="bootstrapSecret"
          required
          type="password"
        />
      </label>

      <button
        className="border border-current px-4 py-2 font-black text-base hover:bg-black hover:text-white"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Registering..." : "Register passkey"}
      </button>

      {error ? <p className="font-medium">Passkey setup failed.</p> : null}
    </form>
  )
}
