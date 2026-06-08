import { createSignedValue, verifySignedValue } from "./crypto"

describe("session cookie signing", () => {
  const secret = "a-secret-that-is-at-least-32-chars"

  it("returns the original token for a valid signed cookie", () => {
    const signedValue = createSignedValue("session-token", secret)

    expect(verifySignedValue(signedValue, secret)).toBe("session-token")
  })

  it("rejects a tampered signed cookie", () => {
    const signedValue = createSignedValue("session-token", secret)

    expect(verifySignedValue(`${signedValue}tampered`, secret)).toBeUndefined()
  })
})
