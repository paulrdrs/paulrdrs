import type { ReactNode } from "react"

type PageContainerProps = {
  children?: ReactNode
}

export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <main
      data-component="PageContainer"
      className="flex min-h-[calc(100svh-(var(--spacing)*24))] w-full max-w-3xl flex-col py-2"
    >
      {children}

      <footer className="mt-auto flex h-24 w-full items-center justify-center py-8">
        <span className="font-black font-mono text-limit text-xs uppercase tracking-wider">
          {"paulrdrs.com"}
        </span>
      </footer>
    </main>
  )
}
