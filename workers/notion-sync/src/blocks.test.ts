import { fetchPageBlocks } from "./blocks"
import { getNotionImageSourceKey, rehostImage } from "./media"
import type { NotionSyncRuntime } from "./runtime"

vi.mock("./media", () => ({
  getNotionImageSourceKey: vi.fn(),
  rehostImage: vi.fn()
}))

const getNotionImageSourceKeyMock = vi.mocked(getNotionImageSourceKey)
const rehostImageMock = vi.mocked(rehostImage)
const runtime = {
  bucket: {},
  databaseIds: {},
  db: {}
} as unknown as NotionSyncRuntime

const defaultAnnotations = {
  bold: false,
  code: false,
  color: "default",
  italic: false,
  strikethrough: false,
  underline: false
}

const richTextItem = (text: string) => ({
  annotations: defaultAnnotations,
  href: null,
  plain_text: text
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe("fetchPageBlocks", () => {
  it("paginates, skips unsupported blocks, and attaches nested children", async () => {
    const listMock = vi.fn(
      async ({
        block_id,
        start_cursor
      }: {
        block_id: string
        start_cursor?: string
      }) => {
        if (block_id === "root" && !start_cursor) {
          return {
            has_more: true,
            next_cursor: "cursor-1",
            object: "list",
            results: [
              {
                has_children: false,
                id: "paragraph-1",
                object: "block",
                paragraph: { rich_text: [richTextItem("Hello")] },
                type: "paragraph"
              }
            ]
          }
        }

        if (block_id === "root" && start_cursor === "cursor-1") {
          return {
            has_more: false,
            next_cursor: null,
            object: "list",
            results: [
              {
                has_children: true,
                id: "toggle-1",
                object: "block",
                toggle: { rich_text: [richTextItem("Toggle")] },
                type: "toggle"
              },
              {
                has_children: true,
                id: "table-1",
                object: "block",
                table: {},
                type: "table"
              },
              {
                has_children: false,
                id: "page-link-1",
                link_to_page: { page_id: "target-page-1", type: "page_id" },
                object: "block",
                type: "link_to_page"
              }
            ]
          }
        }

        if (block_id === "toggle-1") {
          return {
            has_more: false,
            next_cursor: null,
            object: "list",
            results: [
              {
                has_children: false,
                id: "child-paragraph-1",
                object: "block",
                paragraph: { rich_text: [richTextItem("Child")] },
                type: "paragraph"
              }
            ]
          }
        }

        throw new Error(`Unexpected block_id ${block_id}`)
      }
    )

    Object.assign(runtime, {
      notion: {
        blocks: { children: { list: listMock } }
      }
    })

    const blocks = await fetchPageBlocks(runtime, "root")

    expect(blocks).toEqual([
      {
        children: [],
        id: "paragraph-1",
        richText: [
          { annotations: defaultAnnotations, href: null, text: "Hello" }
        ],
        type: "paragraph"
      },
      {
        children: [
          {
            children: [],
            id: "child-paragraph-1",
            richText: [
              { annotations: defaultAnnotations, href: null, text: "Child" }
            ],
            type: "paragraph"
          }
        ],
        id: "toggle-1",
        richText: [
          { annotations: defaultAnnotations, href: null, text: "Toggle" }
        ],
        type: "toggle"
      },
      {
        children: [],
        id: "page-link-1",
        pageId: "target-page-1",
        type: "link_to_page"
      }
    ])
    expect(listMock).toHaveBeenCalledTimes(3)
    expect(listMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ block_id: "table-1" })
    )
  })

  it("re-hosts image blocks via media.ts and preserves the caption", async () => {
    const listMock = vi.fn().mockResolvedValue({
      has_more: false,
      next_cursor: null,
      object: "list",
      results: [
        {
          has_children: false,
          id: "image-1",
          image: {
            caption: [richTextItem("A caption")],
            external: { url: "https://example.com/photo.png" },
            type: "external"
          },
          object: "block",
          type: "image"
        }
      ]
    })

    Object.assign(runtime, {
      notion: {
        blocks: { children: { list: listMock } }
      }
    })
    getNotionImageSourceKeyMock.mockReturnValue("source-key-1")
    rehostImageMock.mockResolvedValue("media-id-1")

    const blocks = await fetchPageBlocks(runtime, "root")

    expect(getNotionImageSourceKeyMock).toHaveBeenCalledWith({
      type: "external",
      url: "https://example.com/photo.png"
    })
    expect(rehostImageMock).toHaveBeenCalledWith(
      runtime,
      "https://example.com/photo.png",
      "source-key-1"
    )
    expect(blocks).toEqual([
      {
        caption: [
          { annotations: defaultAnnotations, href: null, text: "A caption" }
        ],
        children: [],
        id: "image-1",
        mediaId: "media-id-1",
        type: "image"
      }
    ])
  })
})
