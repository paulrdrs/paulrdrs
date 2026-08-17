export const Eyebrow = ({ label }: { label: string }) => {
  return (
    <span
      data-component="Eyebrow"
      className="w-fit rounded-sm border border-limit bg-canvas px-2 font-medium font-mono text-muted text-xs uppercase tracking-widest"
    >
      {label}
    </span>
  )
}
