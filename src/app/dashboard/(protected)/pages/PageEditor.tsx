import type { PageFormValues } from "@/cms/contentForms"
import { MarkdownContent } from "@/components/MarkdownContent"

type PageEditorProps = {
  action: (formData: FormData) => void | Promise<void>
  page?: PageFormValues
  submitLabel: string
}

const formatDateTimeLocal = (date: Date | null | undefined) => {
  if (!date) {
    return ""
  }

  return date.toISOString().slice(0, 16)
}

export const PageEditor = ({ action, page, submitLabel }: PageEditorProps) => {
  const bodyMarkdown = page?.bodyMarkdown ?? ""

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
            defaultValue={page?.title ?? ""}
            id="title"
            name="title"
            required
            type="text"
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
              defaultValue={page?.status ?? "draft"}
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
              defaultValue={formatDateTimeLocal(page?.publishedAt)}
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
            />
          </label>
        </div>

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
