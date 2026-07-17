import { ContentSnippet } from "./ContentSnippet"

type PostListItem = {
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt: string | null
  id: string
  publishedAt: Date | null
  slug: string
  title: string
}

type PostListProps = {
  posts: PostListItem[]
}

const formatDate = (date: Date | null) =>
  date
    ? new Intl.DateTimeFormat("en", {
        dateStyle: "medium"
      }).format(date)
    : "Undated"

export const PostList = ({ posts }: PostListProps) => (
  <ol className="flex flex-col gap-12" data-content-list="blog-posts">
    {posts.map((post) => (
      <ContentSnippet
        coverAltText={post.coverAltText}
        coverAttribution={post.coverAttribution}
        coverMediaId={post.coverMediaId}
        excerpt={post.excerpt}
        href={`/blog/${post.slug}`}
        label={formatDate(post.publishedAt)}
        title={post.title}
        key={post.id}
      />
    ))}
  </ol>
)
