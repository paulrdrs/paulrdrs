import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type MarkdownContentProps = {
  markdown: string
}

export const MarkdownContent = ({ markdown }: MarkdownContentProps) => {
  return (
    <article className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
    </article>
  )
}
