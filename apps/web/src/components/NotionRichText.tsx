import type { RichText } from "@paulrdrs/content/blocks"
import { Fragment, type ReactNode } from "react"

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

const safeLinkProtocols = new Set(["http:", "https:", "mailto:", "tel:"])

const getSafeHref = (href: string | null) => {
  if (!href) {
    return null
  }

  try {
    return safeLinkProtocols.has(new URL(href).protocol) ? href : null
  } catch {
    return null
  }
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
        const href = getSafeHref(segment.href)
        const colorClass =
          segment.annotations.color === "default"
            ? undefined
            : `notion-color-${segment.annotations.color}`

        if (href) {
          return (
            <a className={colorClass} href={href} key={key}>
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
