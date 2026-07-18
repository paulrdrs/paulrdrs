import Link from "next/link"
import { ContentImage } from "./ContentImage"

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
  <ol className="flex flex-col gap-2" data-content-list="blog-posts">
    {posts.map((post) => (
      <li className="group" key={post.id}>
        <Link
          aria-label={post.title}
          className="flex flex-col gap-4 py-4 sm:flex-row sm:items-start sm:gap-8"
          href={`/blog/${post.slug}`}
        >
          {post.coverMediaId ? (
            <div className="w-full shrink-0 sm:w-1/3">
              <ContentImage
                alt={post.coverAltText}
                attribution={post.coverAttribution}
                id={post.coverMediaId}
                presentation="postCard"
              />
            </div>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
              <span className="font-black text-2xl sm:text-3xl">
                {post.title}
              </span>
              <time className="shrink-0 font-mono text-muted text-xs uppercase">
                {formatDate(post.publishedAt)}
              </time>
            </div>
            {post.excerpt ? (
              <span className="max-w-2xl text-muted">{post.excerpt}</span>
            ) : null}
          </div>
        </Link>
      </li>
    ))}
  </ol>
)
