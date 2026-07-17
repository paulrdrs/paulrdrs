import type { ReactNode } from "react"

type SiteFrameProps = {
  children: ReactNode
  navigation: ReactNode
}

export const SiteFrame = ({ children, navigation }: SiteFrameProps) => {
  return (
    <div className="flex min-h-screen flex-col">
      {navigation}
      <div className="flex-1">{children}</div>
      <footer className="site-shell flex items-end justify-end py-8 font-mono text-muted text-xs uppercase tracking-wider">
        <span>{"paulrdrs.com"}</span>
      </footer>
    </div>
  )
}
