import type { ReactNode } from "react"

type PageContainerProps = {
  children?: ReactNode
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <main className="flex h-full w-full flex-col gap-4 px-4 py-8">
      {children}
    </main>
  )
}
