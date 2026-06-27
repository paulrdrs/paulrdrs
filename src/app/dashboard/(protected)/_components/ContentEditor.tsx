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
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={action} className="flex flex-col gap-4">
        <label className="field-label" htmlFor="title">
          Title
          <input
            className="field-control"
            defaultValue={content?.title ?? ""}
            id="title"
            name="title"
            required
            type="text"
          />
        </label>

        <label className="field-label" htmlFor="slug">
          Slug
          <input
            className="field-control"
            defaultValue={content?.slug ?? ""}
            id="slug"
            name="slug"
            type="text"
          />
        </label>

        {kind === "project" ? (
          <label className="field-label" htmlFor="category">
            Category
            <select
              className="field-control"
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

        <label className="field-label" htmlFor="coverMediaId">
          Cover media
          <select
            className="field-control"
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

        <label className="field-label" htmlFor="excerpt">
          Excerpt
          <textarea
            className="field-control min-h-24"
            defaultValue={content?.excerpt ?? ""}
            id="excerpt"
            name="excerpt"
          />
        </label>

        <label className="field-label" htmlFor="bodyMarkdown">
          Markdown body
          <textarea
            className="field-control min-h-72"
            defaultValue={bodyMarkdown}
            id="bodyMarkdown"
            name="bodyMarkdown"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="field-label" htmlFor="status">
            Status
            <select
              className="field-control"
              defaultValue={content?.status ?? "draft"}
              id="status"
              name="status"
            >
              <option value="draft">draft</option>
              <option value="published">published</option>
            </select>
          </label>

          <label className="field-label" htmlFor="publishedAt">
            Publish date
            <input
              className="field-control"
              defaultValue={formatDateTimeLocal(content?.publishedAt)}
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
            />
          </label>
        </div>

        <label className="field-label" htmlFor="seoTitle">
          SEO title
          <input
            className="field-control"
            defaultValue={content?.seoTitle ?? ""}
            id="seoTitle"
            name="seoTitle"
            type="text"
          />
        </label>

        <label className="field-label" htmlFor="seoDescription">
          SEO description
          <textarea
            className="field-control min-h-20"
            defaultValue={content?.seoDescription ?? ""}
            id="seoDescription"
            name="seoDescription"
          />
        </label>

        <button className="button" type="submit">
          {submitLabel}
        </button>
      </form>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-32 lg:self-start">
        <p className="eyebrow">Preview</p>
        {bodyMarkdown ? (
          <MarkdownContent markdown={bodyMarkdown} />
        ) : (
          <p className="font-medium">Nothing to preview yet.</p>
        )}
      </aside>
    </div>
  )
}
