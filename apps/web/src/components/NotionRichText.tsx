import { Fragment, type ReactNode } from "react"
import type { RichText } from "@/notion/types"

const applyMarks = (text: string, rich: RichText): ReactNode => {
  let node: ReactNode = text

  if (rich.annotations.code) {
    node = <code>{node}</code>
  }
  if (rich.annotations.bold) {
    node = <strong>{node}</strong>
  }
  if (rich.annotations.italic) {
    node = <em>{node}</em>
  }
  if (rich.annotations.strikethrough) {
    node = <s>{node}</s>
  }
  if (rich.annotations.underline) {
    node = <u>{node}</u>
  }

  return node
}

type NotionRichTextProps = {
  richText: readonly RichText[]
}

export const NotionRichText = ({ richText }: NotionRichTextProps) => {
  // Notion rich-text segments have no id; key on a running text offset, which is
  // stable for static content and unique among siblings.
  const segments: Array<{ key: string; segment: RichText }> = []
  let offset = 0
  for (const segment of richText) {
    segments.push({ key: `${offset}:${segment.text}`, segment })
    offset += segment.text.length + 1
  }

  return (
    <>
      {segments.map(({ key, segment }) => {
        const content = applyMarks(segment.text, segment)
        const colorClass =
          segment.annotations.color === "default"
            ? undefined
            : `notion-color-${segment.annotations.color}`

        if (segment.href) {
          return (
            <a className={colorClass} href={segment.href} key={key}>
              {content}
            </a>
          )
        }

        if (colorClass) {
          return (
            <span className={colorClass} key={key}>
              {content}
            </span>
          )
        }

        return <Fragment key={key}>{content}</Fragment>
      })}
    </>
  )
}
