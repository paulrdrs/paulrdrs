import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownContentProps = {
  markdown: string
}

export const MarkdownContent = ({ markdown }: MarkdownContentProps) => {
  return (
    <article className="flex w-full flex-col gap-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  )
}
