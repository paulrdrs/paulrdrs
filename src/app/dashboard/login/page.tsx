import { PageContainer } from "@/components/PageContainer"
import { requestMagicLinkAction } from "./actions"

type LoginPageProps = {
  searchParams?: Promise<{
    sent?: string
    error?: string
  }>
}

export default async function DashboardLoginPage({
  searchParams
}: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  const showSentMessage = resolvedSearchParams?.sent === "1"
  const showErrorMessage = resolvedSearchParams?.error === "1"

  return (
    <PageContainer>
      <h1 className="font-black text-3xl">Dashboard login</h1>

      <form
        action={requestMagicLinkAction}
        className="flex max-w-md flex-col gap-4"
      >
        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="email"
        >
          Email
          <input
            className="border border-current bg-transparent px-3 py-2 font-sans text-base"
            id="email"
            name="email"
            required
            type="email"
          />
        </label>

        <button
          className="border border-current px-4 py-2 font-black text-base hover:bg-black hover:text-white"
          type="submit"
        >
          Send magic link
        </button>
      </form>

      {showSentMessage ? (
        <p className="font-medium">
          If that email is allowed, a login link has been sent.
        </p>
      ) : null}

      {showErrorMessage ? (
        <p className="font-medium">
          That login link is missing, expired, or used.
        </p>
      ) : null}
    </PageContainer>
  )
}
