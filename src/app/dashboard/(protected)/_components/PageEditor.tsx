import type { PageFormValues } from "@/cms/contentForms"
import { MarkdownContent } from "@/components/MarkdownContent"
import { getHeroSelectionValue, type HeroSelection } from "@/site/hero"

type HeroOptions = {
  media: Array<{ altText: string | null; filename: string; id: string }>
  posts: Array<{ id: string; title: string }>
  projects: Array<{
    category: "photography" | "software"
    id: string
    title: string
  }>
}

type PageEditorProps = {
  action: (formData: FormData) => void | Promise<void>
  heroOptions?: HeroOptions
  heroSelection?: HeroSelection | null
  page?: PageFormValues
  submitLabel: string
}

const formatDateTimeLocal = (date: Date | null | undefined) => {
  if (!date) {
    return ""
  }

  return date.toISOString().slice(0, 16)
}

export const PageEditor = ({
  action,
  heroOptions,
  heroSelection = null,
  page,
  submitLabel
}: PageEditorProps) => {
  const bodyMarkdown = page?.bodyMarkdown ?? ""

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={action} className="flex flex-col gap-4">
        {heroOptions ? (
          <label className="field-label" htmlFor="heroSelection">
            Featured homepage hero
            <select
              className="field-control"
              defaultValue={getHeroSelectionValue(heroSelection)}
              id="heroSelection"
              name="heroSelection"
            >
              <option value="">Home page introduction</option>
              {heroOptions.posts.length > 0 ? (
                <optgroup label="Blog posts">
                  {heroOptions.posts.map((post) => (
                    <option key={post.id} value={`post:${post.id}`}>
                      {post.title}
                    </option>
                  ))}
                </optgroup>
              ) : null}
              {(["software", "photography"] as const).map((category) => {
                const projects = heroOptions.projects.filter(
                  (project) => project.category === category
                )

                return projects.length > 0 ? (
                  <optgroup
                    key={category}
                    label={category === "software" ? "Software" : "Photography"}
                  >
                    {projects.map((project) => (
                      <option key={project.id} value={`project:${project.id}`}>
                        {project.title}
                      </option>
                    ))}
                  </optgroup>
                ) : null
              })}
              {heroOptions.media.length > 0 ? (
                <optgroup label="Individual photos">
                  {heroOptions.media.map((asset) => (
                    <option key={asset.id} value={`media:${asset.id}`}>
                      {asset.altText || asset.filename}
                    </option>
                  ))}
                </optgroup>
              ) : null}
            </select>
            <span className="font-sans text-muted text-sm normal-case tracking-normal">
              Published content links to its page. Individual photos open in a
              dedicated viewer.
            </span>
          </label>
        ) : null}

        <label
          className="flex flex-col gap-2 font-mono text-sm"
          htmlFor="title"
        >
          Title
          <input
            className="field-control"
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
            className="field-control min-h-72"
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
              className="field-control"
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
              className="field-control"
              defaultValue={formatDateTimeLocal(page?.publishedAt)}
              id="publishedAt"
              name="publishedAt"
              type="datetime-local"
            />
          </label>
        </div>

        <button className="button" type="submit">
          {submitLabel}
        </button>
      </form>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
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
