// Uploaded files have expiring URLs; external image URLs are stable.
export type NotionImageSource =
  | { readonly type: "external"; readonly url: string }
  | { readonly type: "file"; readonly url: string }
