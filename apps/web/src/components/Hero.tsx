import Link from "next/link"
import type { ReactNode } from "react"
import type { FeaturedHero } from "@/db/content"
import { ContentImage } from "./ContentImage"

type HeroProps = {
  featured?: FeaturedHero
  intro?: ReactNode
  title: string
}

export const Hero = ({ featured, intro, title }: HeroProps) => {
  if (!featured) {
    return (
      <section className="grid gap-8 pb-8 lg:grid-cols-12">
        <h1 className="display-title lg:col-span-9">{title}</h1>
        {intro ? (
          <div className="lg:col-span-7 lg:col-start-6">{intro}</div>
        ) : null}
      </section>
    )
  }

  return (
    <section className="grid gap-8 pb-12 lg:grid-cols-12 lg:items-end">
      <div className="flex flex-col justify-end gap-4 lg:col-span-5 lg:pb-4">
        <p className="eyebrow">Featured · {featured.label}</p>
        <h1 className="text-balance font-black text-5xl sm:text-7xl">
          <Link className="hover:text-muted" href={featured.href}>
            {featured.title}
          </Link>
        </h1>
        {featured.excerpt ? (
          <p className="max-w-xl text-lg text-muted">{featured.excerpt}</p>
        ) : null}
        <Link
          className="font-mono text-link text-sm uppercase"
          href={featured.href}
        >
          View feature
        </Link>
      </div>

      {featured.coverMediaId ? (
        <Link className="group lg:col-span-7" href={featured.href}>
          <ContentImage
            alt={featured.coverAltText}
            attribution={featured.coverAttribution}
            className="aspect-4/3 lg:aspect-5/4"
            id={featured.coverMediaId}
            priority
          />
        </Link>
      ) : (
        <div className="hidden aspect-5/4 items-end border border-line p-4 text-muted lg:col-span-7 lg:flex">
          <span className="font-mono text-xs uppercase">{featured.label}</span>
        </div>
      )}
    </section>
  )
}
