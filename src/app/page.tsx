import { IdBadge } from "@/components/IdBadge"
import { Presentation } from "@/components/Presentation"

const Home = () => {
  return (
    <div className="flex w-full max-w-5xl flex-col items-center justify-start gap-4 pb-8">
      <section className="flex w-full flex-col px-4 lg:flex-row">
        <div className="flex w-full shrink-0 justify-center overflow-hidden lg:w-fit">
          <IdBadge />
        </div>

        <Presentation />
      </section>
    </div>
  )
}

export default Home

