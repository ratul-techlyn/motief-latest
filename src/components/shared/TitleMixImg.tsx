"use client";
import { useAnimationComplete } from "@/context/AnimationContext";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import Link from "next/link";
import React, { useRef } from "react";

export type TTitleData = string | { imageSrc: string; altText?: string };

export type TitleMixImgProps = {
  data: TTitleData[][];
  classNameLine?: string;
  classNameText?: string;
  classNameWrap?: string;
  titleDelay?: number;
  imageDelay?: number;
  isScroll?: boolean;
};

const TitleMixImg: React.FC<TitleMixImgProps> = ({
  data,
  classNameLine,
  classNameText,
  classNameWrap,
  titleDelay = 0,
  imageDelay = 0,
  isScroll = false,
}) => {
  const refBox = useRef<HTMLDivElement>(null);
  const { hasLoadedAnimationFinished, hasPageTransitionFinished, isBot } =
    useAnimationComplete();

  useGSAP(
    () => {
      if (refBox.current && !isBot) {
        const lines = refBox.current.querySelectorAll(
          ".mix-title-element-text"
        );
        const images = refBox.current.querySelectorAll(
          ".mix-title-element-image"
        );
        let titleTimeline = gsap.timeline();

        if (isScroll) {
          titleTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: refBox.current,
              start: "top bottom",
              end: "bottom bottom+=200",
              toggleActions: "restart none none reset",
            },
          });
        }

        // Get screen width once
        const screenW = window.innerWidth;
        let finalWidth: string;

        // Animate each image based on responsive breakpoint logic

        if (screenW >= 2000) {
          // 3xl
          finalWidth = "4vw";
        } else if (screenW >= 1536) {
          // 2xl
          finalWidth = "8vw";
        } else if (screenW >= 1280) {
          // xl
          finalWidth = "8vw";
        } else if (screenW >= 1024) {
          // lg
          finalWidth = "8vw";
        } else if (screenW >= 768) {
          // md
          finalWidth = "16vw";
        } else {
          // sm and below
          finalWidth = "12vw";
        }

        titleTimeline.fromTo(
          lines,
          { y: 200, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            delay: titleDelay,
            duration: 1.5,
            ease: "power3.out",
          }
        );

        titleTimeline.from(images, {
          width: 0,
          opacity: 1,
          delay: imageDelay,
          duration: 1,
          stagger: 0.7,
          ease: "power2.out",
        });
      }
    },
    {
      scope: refBox,
      dependencies: [hasLoadedAnimationFinished, hasPageTransitionFinished, isBot],
    }
  );

  return (
    <div
      ref={refBox}
      className={[
        "3xl:max-w-[1440px]",
        "w-full uppercase text-home_hero_title_sm md:text-home_hero_title_md xl:text-home_hero_title_xl font-clash font-semibold text-typo-primary transform translate-x-0 translate-y-0 opacity-100 ",
        classNameWrap,
      ].join(" ")}
    >
      <h1>
        {data.map((row, rowIndex) => (
          <span
            key={rowIndex}
            className={[
              "flex flex-wrap  items-center gap-x-0 gap-y-2 md:gap-x-2 md:gap-y-0 leading-[1.1] tracking-[1.5px]",
              classNameLine,
            ].join(" ")}
          >
            {row.map((item, itemIndex) =>
              typeof item === "string" ? (
                <span
                  key={itemIndex}
                  className={[
                    "3xl:text-[64px]",
                    cn("relative visible inline-block", {
                      " text-justify": rowIndex !== data.length - 1,
                    }),
                    "overflow-hidden flex font-clash font-semibold uppercase leading-[1.2] [word-spacing:0.1em]",
                    classNameText,
                  ].join(" ")}
                >
                  <span className="mix-title-element-text">{item}</span>
                </span>
              ) : (
                <Link href={item?.imageSrc || "/"} key={itemIndex}>
                  <span
                    className="mix-title-element-image relative mx-2 visible block rounded-full w-[20vw] md:w-[7vw] lg:w-[10vw] xl:w-[7vw] bg-[length:20vw] md:bg-[length:7vw] lg:bg-[length:10vw] xl:bg-[length:7vw] h-[3vh]  md:h-[5vh] lg:h-[3vw] xl:h-[3vw] 2x:h-[4vh] 3xl:max-h-[6vh]"
                    style={{
                      backgroundImage: `url(${item.imageSrc})`,
                      backgroundPosition: "left center",
                      aspectRatio: "1 / 1",
                    }}
                  ></span>
                </Link>
              )
            )}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default TitleMixImg;
