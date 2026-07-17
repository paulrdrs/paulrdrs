import type { Metadata } from "next"
import { Geist, Inconsolata } from "next/font/google"
import "./globals.css"
import { SiteFrame } from "@/components/SiteFrame"
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
  // Cloudflare Web Analytics beacon. The token is a runtime var (set at deploy);
  // when it's absent (e.g. local dev) the beacon is simply not rendered.
  const beaconToken = process.env.CF_BEACON_TOKEN

  return (
    <html
      lang="en"
      className={`${geist.variable} ${inconsolata.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
        {beaconToken ? (
          <script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: beaconToken })}
          />
        ) : null}
      </head>
      <body>
        <SiteFrame navigation={<TopNavBar />}>{children}</SiteFrame>
      </body>
    </html>
  )
}
