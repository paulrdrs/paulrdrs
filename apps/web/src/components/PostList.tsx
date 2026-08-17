import { PostSnippet } from "./PostSnippet"

type PostListItem = {
  coverAltText?: string | null
  coverAttribution?: string | null
  coverMediaId?: string | null
  excerpt: string | null
  id: string
  publishedAt: Date | null
  slug: string
  tags: string[]
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
  <div data-content-list="blog-posts" className="flex flex-col gap-4">
    {posts.map((post) => (
      <PostSnippet
        key={post.id}
        coverAltText={post.coverAltText}
        coverAttribution={post.coverAttribution}
        coverMediaId={post.coverMediaId}
        excerpt={post.excerpt}
        href={`/blog/${post.slug}`}
        label={formatDate(post.publishedAt)}
        tags={post.tags}
        title={post.title}
      />
    ))}
  </div>
)
