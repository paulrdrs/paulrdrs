export const TopNavBar = () => {
  return (
    <div className="no-scrollbar fixed flex h-12 w-full max-w-5xl items-center justify-between gap-4 overflow-x-scroll bg-inherit px-4 font-mono">
      <span className="nav-text-link font-black">{"paulrdrs"}</span>
      <span className="nav-text-link font-medium">{`Blog`}</span>
      <span className="nav-text-link font-medium">{"Projects"}</span>
      <span className="nav-text-link font-medium">{"Photography"}</span>
      <span className="nav-text-link font-medium">{"Software"}</span>
      <span className="nav-text-link font-medium">{"Store"}</span>
      <span className="nav-text-link font-medium">{"Contact"}</span>
    </div>
  )
}
