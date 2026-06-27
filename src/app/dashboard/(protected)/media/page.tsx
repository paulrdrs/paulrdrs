import Image from "next/image"
import { requireDashboardSession } from "@/auth/guards"
import { getDashboardMediaAssets } from "@/db/adminContent"
import { uploadMediaAction } from "./actions"

const formatBytes = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function DashboardMediaPage() {
  await requireDashboardSession()

  const assets = await getDashboardMediaAssets()

  return (
    <>
      <h2 className="font-black text-2xl">Media</h2>

      <form action={uploadMediaAction} className="flex max-w-xl flex-col gap-4">
        <label className="field-label" htmlFor="file">
          File
          <input
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="field-control"
            id="file"
            name="file"
            required
            type="file"
          />
        </label>

        <label className="field-label" htmlFor="altText">
          Alt text
          <input
            className="field-control"
            id="altText"
            name="altText"
            type="text"
          />
        </label>

        <label className="field-label" htmlFor="attribution">
          Attribution
          <input
            className="field-control"
            id="attribution"
            name="attribution"
            type="text"
          />
        </label>

        <button className="button" type="submit">
          Upload media
        </button>
      </form>

      {assets.length > 0 ? (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Preview</th>
                <th>File</th>
                <th>Alt text</th>
                <th>Size</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <Image
                      alt={asset.altText ?? ""}
                      className="h-16 w-16 border border-line object-cover"
                      height={64}
                      src={`/media/${asset.id}`}
                      unoptimized
                      width={64}
                    />
                  </td>
                  <td>
                    <div className="font-black">{asset.filename}</div>
                    <div className="font-mono text-sm">{asset.mimeType}</div>
                  </td>
                  <td className="font-medium">{asset.altText ?? "-"}</td>
                  <td className="font-mono text-sm">
                    {formatBytes(asset.sizeBytes)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="font-medium">No media uploaded yet.</p>
      )}
    </>
  )
}
