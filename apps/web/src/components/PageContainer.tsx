import type { ReactNode } from "react"

type PageContainerProps = {
  children?: ReactNode
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <main
      data-component="PageContainer"
      className="flex w-full max-w-4xl flex-col pb-8"
    >
      {children}
    </main>
  )
}
