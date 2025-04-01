const Brand = () => {
  return (
    <span className="rounded font-bold font-mono text-neutral-600 text-xs dark:text-neutral-400">
      {"paulrdrs.com"}
    </span>
  )
}

export const Strap = ({ side }: { side: "left" | "right" }) => {
  const leftStyles = "z-0 rotate-[80deg] translate-x-[40%]"
  const rightStyles = "z-30 rotate-[-80deg] translate-x-[-40%]"

  return (
    <div
      className={`flex h-10 w-48 translate-y-2 transform select-none items-center gap-4 overflow-hidden rounded bg-white dark:bg-neutral-950 ${side === "left" ? leftStyles : rightStyles}`}
    >
      <Brand />
      <Brand />
      <Brand />
      <Brand />
    </div>
  )
}
