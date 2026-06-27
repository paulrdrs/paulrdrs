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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-black text-2xl">Passkeys</h2>
        <RegisterPasskey />
      </div>

      {passkeys.length > 0 ? (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Type</th>
                <th>Created</th>
                <th>Last used</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {passkeys.map((passkey) => (
                <tr key={passkey.id}>
                  <td className="font-black">{passkey.email}</td>
                  <td className="font-mono text-sm">
                    {passkey.credentialDeviceType ?? "passkey"}
                  </td>
                  <td className="font-mono text-sm">
                    {formatDate(passkey.createdAt)}
                  </td>
                  <td className="font-mono text-sm">
                    {formatDate(passkey.lastUsedAt)}
                  </td>
                  <td>
                    <form action={deletePasskeyAction}>
                      <input name="id" type="hidden" value={passkey.id} />
                      <button
                        className="button-quiet"
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
