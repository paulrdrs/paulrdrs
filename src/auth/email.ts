type SendMagicLinkEmailInput = {
  apiKey: string
  from: string
  to: string
  loginUrl: string
}

export const sendMagicLinkEmail = async ({
  apiKey,
  from,
  to,
  loginUrl
}: SendMagicLinkEmailInput) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Your paulrdrs.com login link",
      text: `Use this one-time link to sign in:\n\n${loginUrl}\n\nIt expires in 15 minutes.`,
      html: `<p>Use this one-time link to sign in:</p><p><a href="${loginUrl}">Sign in to paulrdrs.com</a></p><p>It expires in 15 minutes.</p>`
    })
  })

  if (!response.ok) {
    throw new Error("Failed to send magic-link email")
  }
}
