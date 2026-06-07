import type { Metadata } from "next"
import { Geist, Inconsolata } from "next/font/google"
import "./globals.css"
import { TopNavBar } from "@/components/TopNavBar"

const inconsolata = Inconsolata({
  variable: "--font-inconsolata",
  subsets: ["latin"]
})

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"]
})

export const metadata: Metadata = {
  title: "paulrdrs",
  description: "paulrdrs"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${inconsolata.variable}`}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
      </head>
      <body className="flex min-h-screen flex-col items-center gap-4 scroll-smooth antialiased">
        <TopNavBar />

        <div className="mt-12 flex h-full w-full max-w-5xl flex-col">
          {children}
        </div>

        <footer className="font-mono">{"paulrdrs.com"}</footer>
      </body>
    </html>
  )
}
