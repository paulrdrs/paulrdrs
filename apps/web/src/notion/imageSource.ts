// Shared shape for any Notion-hosted image we re-host: an uploaded file (short-
// lived presigned URL) or an external URL. Covers block images, the "Cover"
// Files property, and any other Files property.
export type NotionImageSource =
  | { readonly type: "external"; readonly url: string }
  | { readonly type: "file"; readonly url: string }
