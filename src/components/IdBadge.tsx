"use client"

import Image from "next/image"
import Tilt from "react-parallax-tilt"
import { Strap } from "./Straps"

const PHOTO_URL =
  "https://avatars.githubusercontent.com/u/23299139?s=400&u=80a127b9c4b88d80503d2c3e4b8259bc48a260a7&v=4"

export const IdBadge = () => {
  return (
    <Tilt tiltMaxAngleX={4} tiltMaxAngleY={12} className="w-96 pb-8">
      <div className="relative flex flex-col items-center">
        <div className="flex-flex-col">
          <div className="flex h-24 justify-center">
            <Strap side="left" />
            <Strap side="right" />
          </div>

          <div className="absolute z-40 mt-5 flex w-full items-center justify-center">
            <div className={"h-3 w-14 bg-neutral-100 dark:bg-neutral-900"}>
              {""}
            </div>
          </div>
        </div>

        <div
          className={
            "relative z-20p flex h-[30rem] w-80 select-none flex-col gap-4 overflow-hidden rounded-2xl bg-white p-4 text-left shadow-lg focus:outline-neutral-800 dark:bg-neutral-800"
          }
        >
          <div
            className={
              "h-4 w-20 shrink-0 self-center rounded-full border-t-1 border-t-neutral-200 bg-neutral-100 dark:border-t-neutral-950 dark:bg-neutral-900"
            }
          >
            {""}
          </div>

          <div className={"flex h-full flex-col justify-end gap-6"}>
            <div className="flex flex-col items-center gap-2">
              <span className="font-bold text-3xl">{"Paulo Rodrigues"}</span>
              <span className="text-xl">{"Software Developer"}</span>
            </div>
            <div className="relative flex h-72 w-72 shrink-0 overflow-hidden rounded-xl">
              <Image
                alt="Paulo Rodrigues profile picture"
                src={PHOTO_URL}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </Tilt>
  )
}
