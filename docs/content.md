# Content And Media

The CMS manages posts, projects, keyed pages, and uploaded media.

## Content Types

- Posts use a unique slug and render at `/blog/[slug]`.
- Projects use a category plus slug and render at
  `/projects/[category]/[slug]`.
- Pages are keyed records, currently used for `home` and `contact`.
- Media assets store object metadata in Postgres and private objects in Railway
  Storage Bucket.

Posts and projects support title, slug, excerpt, Markdown body, status, publish
date, SEO fields, and optional cover media. Projects also support category and
external links.

In the dashboard, posts are managed under the blog section. Home and Contact are
edited as top-level dashboard sections backed by keyed page records.

## Publishing

Public reads only query records with `status = "published"`. Draft records stay
available in the dashboard but do not render on public content routes.

Publishing content makes it available through the matching public route.

## Navigation Visibility

The dashboard settings page can hide the Blog, Projects, Photography, Software,
and Store links from the public top navigation. These settings only affect link
visibility. The matching public routes remain accessible by direct URL while
their navigation links are hidden.

When an admin has a valid session, the public top navigation appends a Dashboard
link to `/dashboard`. This authenticated link is always last and is not
controlled by the navigation visibility settings.

## Markdown

Long-form CMS content is Markdown with GitHub-flavored Markdown support. Raw HTML
and executable MDX are intentionally not enabled.

The dashboard preview and public pages share the same Markdown rendering model.

## Media

Media uploads are stored in the Railway Storage Bucket through S3-compatible
credentials configured on the `web` service. The bucket objects are private.

The app stores media metadata in Postgres and serves public assets through
`/media/[id]`, which proxies the object by media ID.

Posts and projects can reference uploaded media as cover assets.
