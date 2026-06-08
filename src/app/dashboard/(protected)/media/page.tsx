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
        <label className="flex flex-col gap-2 font-mono text-sm" htmlFor="file">
          File
          <input
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="border border-current bg-transparent px-3 py-2 font-sans text-base"
            id="file"
            name="file"
            required
            type="file"
          />
        </label>

        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="altText"
        >
          Alt text
          <input
            className="border border-current bg-transparent px-3 py-2 font-sans text-base"
            id="altText"
            name="altText"
            type="text"
          />
        </label>

        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="attribution"
        >
          Attribution
          <input
            className="border border-current bg-transparent px-3 py-2 font-sans text-base"
            id="attribution"
            name="attribution"
            type="text"
          />
        </label>

        <button
          className="border border-current px-4 py-2 font-black text-base hover:bg-black hover:text-white"
          type="submit"
        >
          Upload media
        </button>
      </form>

      {assets.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-current border-b font-mono text-sm">
              <tr>
                <th className="py-2 pr-4">Preview</th>
                <th className="py-2 pr-4">File</th>
                <th className="py-2 pr-4">Alt text</th>
                <th className="py-2 pr-4">Size</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((asset) => (
                <tr className="border-current border-b" key={asset.id}>
                  <td className="py-3 pr-4">
                    <Image
                      alt={asset.altText ?? ""}
                      className="h-16 w-16 border border-current object-cover"
                      height={64}
                      src={`/media/${asset.id}`}
                      unoptimized
                      width={64}
                    />
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-black">{asset.filename}</div>
                    <div className="font-mono text-sm">{asset.mimeType}</div>
                  </td>
                  <td className="py-3 pr-4 font-medium">
                    {asset.altText ?? "-"}
                  </td>
                  <td className="py-3 pr-4 font-mono text-sm">
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
