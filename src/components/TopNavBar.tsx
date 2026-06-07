import Link from "next/link"

export const TopNavBar = () => {
  return (
    <nav className="no-scrollbar fixed flex h-12 w-full max-w-5xl items-center justify-between gap-4 overflow-x-scroll bg-inherit px-4 font-mono">
      <Link className="nav-text-link font-black" href="/">
        {"paulrdrs"}
      </Link>
      <Link className="nav-text-link font-medium" href="/blog">
        {"Blog"}
      </Link>
      <Link className="nav-text-link font-medium" href="/projects">
        {"Projects"}
      </Link>
      <Link className="nav-text-link font-medium" href="/projects/photography">
        {"Photography"}
      </Link>
      <Link className="nav-text-link font-medium" href="/projects/software">
        {"Software"}
      </Link>
      <Link className="nav-text-link font-medium" href="/store">
        {"Store"}
      </Link>
      <Link className="nav-text-link font-medium" href="/contact">
        {"Contact"}
      </Link>
    </nav>
  )
}
