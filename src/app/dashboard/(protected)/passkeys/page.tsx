import { requireDashboardSession } from "@/auth/guards"
import { getDashboardPasskeys } from "@/auth/passkeys"
import { deletePasskeyAction } from "./actions"
import { RegisterPasskey } from "./RegisterPasskey"

const formatDate = (date: Date | null) => {
  return date
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(date)
    : "-"
}

export default async function DashboardPasskeysPage() {
  const session = await requireDashboardSession()
  const passkeys = await getDashboardPasskeys(session.email)

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-black text-2xl">Passkeys</h2>
        <RegisterPasskey />
      </div>

      {passkeys.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-current border-b font-mono text-sm">
              <tr>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Created</th>
                <th className="py-2 pr-4">Last used</th>
                <th className="py-2 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {passkeys.map((passkey) => (
                <tr className="border-current border-b" key={passkey.id}>
                  <td className="py-3 pr-4 font-black">{passkey.email}</td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {passkey.credentialDeviceType ?? "passkey"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {formatDate(passkey.createdAt)}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
                    {formatDate(passkey.lastUsedAt)}
                  </td>
                  <td className="py-3 pr-4">
                    <form action={deletePasskeyAction}>
                      <input name="id" type="hidden" value={passkey.id} />
                      <button
                        className="border border-current px-3 py-2 font-mono text-sm hover:bg-black hover:text-white disabled:opacity-50"
                        disabled={passkeys.length <= 1}
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-medium">No passkeys registered.</p>
      )}
    </>
  )
}
