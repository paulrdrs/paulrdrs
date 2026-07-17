import Link from "next/link"

type PostListItem = {
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
  <ol className="flex flex-col gap-2">
    {posts.map((post) => (
      <li className="group" key={post.id}>
        <Link
          aria-label={post.title}
          className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8"
          href={`/blog/${post.slug}`}
        >
          <span className="flex min-w-0 flex-col gap-2">
            <span className="font-black text-2xl sm:text-3xl">
              {post.title}
            </span>
            {post.excerpt ? (
              <span className="max-w-2xl text-muted">{post.excerpt}</span>
            ) : null}
          </span>
          <time className="font-mono text-muted text-xs uppercase">
            {formatDate(post.publishedAt)}
          </time>
        </Link>
      </li>
    ))}
  </ol>
)
