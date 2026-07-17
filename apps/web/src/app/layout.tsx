import type { Metadata } from "next"
import { Geist, Inconsolata } from "next/font/google"
import "./globals.css"
import { TopNavBar } from "@/components/TopNavBar"
import { getSiteEnvs } from "@/envs/server"

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"]
})

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"]
})

const resolveMetadataBase = () => {
  try {
    return new URL(getSiteEnvs().SITE_URL)
  } catch {
    return undefined
  }
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: "paulrdrs",
    template: "%s · paulrdrs"
  },
  description: "Personal site, blog, and projects portfolio of Paulo Rodrigues."
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${inconsolata.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
      </head>
      <body>
        <TopNavBar />
        {children}
        <footer className="site-shell flex items-end justify-end py-8 font-mono text-muted text-xs uppercase tracking-wider">
          <span>{"paulrdrs.com"}</span>
        </footer>
      </body>
    </html>
  )
}
