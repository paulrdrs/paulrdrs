import type { ContentStatus } from "@/cms/contentForms"
import { MarkdownContent } from "@/components/MarkdownContent"
import { type ProjectCategory, projectCategories } from "@/db/contentTypes"

type BaseContent = {
  title?: string
  slug?: string
  excerpt?: string | null
  bodyMarkdown?: string
  status?: ContentStatus
  coverMediaId?: string | null
  publishedAt?: Date | null
  seoTitle?: string | null
  seoDescription?: string | null
}

type MediaOption = {
  altText: string | null
  filename: string
  id: string
}

type ContentEditorProps = {
  action: (formData: FormData) => void | Promise<void>
  content?: BaseContent & {
    category?: ProjectCategory
  }
  kind: "post" | "project"
  mediaAssets?: MediaOption[]
  submitLabel: string
}

const formatDateTimeLocal = (date: Date | null | undefined) => {
  if (!date) {
    return ""
  }

  return date.toISOString().slice(0, 16)
}

export const ContentEditor = ({
  action,
  content,
  kind,
  mediaAssets = [],
  submitLabel
}: ContentEditorProps) => {
  const bodyMarkdown = content?.bodyMarkdown ?? ""

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form action={action} className="flex flex-col gap-4">
        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="title"
        >
          Title
          <input
            className="border border-current bg-transparent px-3 py-2 font-sans text-base"
            defaultValue={content?.title ?? ""}
            id="title"
            name="title"
            required
            type="text"
          />
        </label>

        <label className="flex flex-col gap-2 font-mono text-sm" htmlFor="slug">
          Slug
          <input
            className="border border-current bg-transparent px-3 py-2 font-sans text-base"
            defaultValue={content?.slug ?? ""}
            id="slug"
            name="slug"
            type="text"
          />
        </label>

        {kind === "project" ? (
          <label
            className="flex flex-col gap-2 font-mono text-sm"
            htmlFor="category"
          >
            Category
            <select
              className="border border-current bg-transparent px-3 py-2 font-sans text-base"
              defaultValue={content?.category ?? "software"}
              id="category"
              name="category"
              required
            >
              {projectCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="coverMediaId"
        >
          Cover media
          <select
            className="border border-current bg-transparent px-3 py-2 font-sans text-base"
            defaultValue={content?.coverMediaId ?? ""}
            id="coverMediaId"
            name="coverMediaId"
          >
            <option value="">none</option>
            {mediaAssets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.filename}
              </option>
            ))}
          </select>
        </label>

        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="excerpt"
        >
          Excerpt
          <textarea
            className="min-h-24 border border-current bg-transparent px-3 py-2 font-sans text-base"
            defaultValue={content?.excerpt ?? ""}
            id="excerpt"
            name="excerpt"
          />
        </label>

        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="bodyMarkdown"
        >
          Markdown body
          <textarea
            className="min-h-72 border border-current bg-transparent px-3 py-2 font-sans text-base"
            defaultValue={bodyMarkdown}
            id="bodyMarkdown"
            name="bodyMarkdown"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label
            className="flex flex-col gap-2 font-mono text-sm"
            htmlFor="status"
          >
            Status
            <select
              className="border border-current bg-transparent px-3 py-2 font-sans text-base"
              defaultValue={content?.status ?? "draft"}
              id="status"
              name="status"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>

          <label
            className="flex flex-col gap-2 font-mono text-sm"
            htmlFor="publishedAt"
          >
            Publish date
            <input
              className="border border-current bg-transparent px-3 py-2 font-sans text-base"
              defaultValue={formatDateTimeLocal(content?.publishedAt)}
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
            />
          </label>
        </div>

        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="seoTitle"
        >
          SEO title
          <input
            className="border border-current bg-transparent px-3 py-2 font-sans text-base"
            defaultValue={content?.seoTitle ?? ""}
            id="seoTitle"
            name="seoTitle"
            type="text"
          />
        </label>

        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="seoDescription"
        >
          SEO description
          <textarea
            className="min-h-20 border border-current bg-transparent px-3 py-2 font-sans text-base"
            defaultValue={content?.seoDescription ?? ""}
            id="seoDescription"
            name="seoDescription"
          />
        </label>

        <button
          className="border border-current px-4 py-2 font-black text-base hover:bg-black hover:text-white"
          type="submit"
        >
          {submitLabel}
        </button>
      </form>

      <aside className="flex flex-col gap-3">
        <h3 className="font-black text-xl">Preview</h3>
        {bodyMarkdown ? (
          <MarkdownContent markdown={bodyMarkdown} />
        ) : (
          <p className="font-medium">Nothing to preview yet.</p>
        )}
      </aside>
    </div>
  )
}
