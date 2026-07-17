import type { ReactNode } from "react"

type PageContainerProps = {
  children?: ReactNode
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <main className="flex w-full max-w-5xl flex-col gap-8 px-4 pt-4 pb-12">
      {children}
    </main>
  )
}
