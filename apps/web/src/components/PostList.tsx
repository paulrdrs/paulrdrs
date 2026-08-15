import { PostSnippet } from "./PostSnippet"

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
  <ol data-content-list="blog-posts">
    {posts.map((post) => (
      <li key={post.id}>
        <PostSnippet
          coverAltText={post.coverAltText}
          coverAttribution={post.coverAttribution}
          coverMediaId={post.coverMediaId}
          excerpt={post.excerpt}
          href={`/blog/${post.slug}`}
          label={formatDate(post.publishedAt)}
          title={post.title}
        />
      </li>
    ))}
  </ol>
)
