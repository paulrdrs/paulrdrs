import { SiGithub, SiInstagram } from "react-icons/si"
import { SocialLink } from "./SocialLink"

const INTRODUCTION = "I'm Paulo Rodrigues, a software developer from Portugal 🇵🇹."
const WORK =
  "I mainly work with the Node.js ecosystem, though I've been dabbling in Rust and Go lately."
const HOBBIES =
  "Outside of programming, I enjoy reading, photography, and spending time with my family."

export const Presentation = () => {
  return (
    <div className="flex w-full flex-col justify-start gap-4 px-4 lg:justify-center lg:px-0 lg:pr-8">
      <span className="font-bold text-5xl">{"Hey 👋"}</span>
      <span className="text-xl">{INTRODUCTION}</span>
      <span className="text-xl">{WORK}</span>
      <span className="text-xl">{HOBBIES}</span>
      <SocialLink
        href="https://github.com/paulrdrs"
        label="/paulrdrs"
        icon={<SiGithub className="size-6 text-black dark:text-white" />}
      />
      <SocialLink
        href="https://instagram.com/paulrdrs"
        label="/paulrdrs"
        icon={<SiInstagram className="size-6 text-pink-500" />}
      />
    </div>
  )
}
