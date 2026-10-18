"use client";
import { useAnimationComplete } from "@/context/AnimationContext";
import { cn } from "@/lib/utils";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { useRef } from "react";
import { FaCentercode } from "react-icons/fa6";

gsap.registerPlugin(ScrollTrigger);

const rollingWords = ["FASHION", "BEAUTY", "LUXURY"];

export interface TLineItem {
  text?: string;
  img?: string;
  alt?: string;
}

export interface TitleImgProps {
  lines: string[][];
  description?: string[];
  titleDelay?: number;
  imageDelay?: number;
  width?: string;
}

const TitleImgBannerJB = ({
  lines,
  description,
  titleDelay = 0,
  imageDelay = 0,
  width = "75%",
}: TitleImgProps) => {
  const refBox = useRef<HTMLDivElement>(null);
  const rollingRef = useRef<HTMLDivElement>(null);

  const { hasLoadedAnimationFinished, hasPageTransitionFinished } =
    useAnimationComplete();

  useGSAP(
    () => {
      if (refBox.current) {
        const lines = refBox.current.querySelectorAll(
          ".mix-title-element-text"
        );
        const images = refBox.current.querySelectorAll(
          ".mix-title-element-image"
        );
        const pera = refBox.current.querySelectorAll(".anm-hero-pera");
        const splitText = new SplitText(pera, {
          type: "words, lines",
          lineClass: "overflow-hidden",
        });

        const titleTimeline = gsap.timeline();

        titleTimeline.fromTo(
          lines,
          { y: 200, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            delay: titleDelay,
            duration: 1,
            ease: "power3.out",
          }
        );
        // Get screen width once
        const screenW = window.innerWidth;

        // Animate each image based on responsive breakpoint logic
        images.forEach((img) => {
          let finalWidth;

          if (screenW >= 1536) {
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
            finalWidth = "10vw";
          } else {
            // sm and below
            finalWidth = "10vw";
          }

          titleTimeline.fromTo(
            images,
            { width: 0, opacity: 0 },
            {
              width: finalWidth,
              opacity: 1,
              delay: imageDelay,
              duration: 0.5,
              ease: "power3.out",
            }
          );
        });

        titleTimeline.fromTo(
          splitText.words,
          {
            y: 100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power3.out",
          }
        );

        // 5: Rolling - start sooner
        const rolling = rollingRef.current;
        const rollingHeight =
          rollingRef.current?.firstElementChild?.clientHeight || 40;
        const tlNew = gsap.timeline({
          repeat: -1,
          onRepeat: function () {
            gsap.set(rollingRef.current, { y: 0 });
          },
        });

        const wordScrollDuration = 0.4; // Reduced from 0.5s for snappier transitions
        const circleResizeDuration = 0.6; // Reduced from 0.8s
        const stepDelay = 1.8; // Reduced from 2s for faster word cycling

        for (let i = 0; i <= rollingWords.length; i++) {
          const idx = i % rollingWords.length;
          const startTime = i * stepDelay;

          tlNew.to(
            rollingRef.current,
            {
              y: -i * rollingHeight,
              duration: wordScrollDuration,
              ease: "power1.inOut",
            },
            startTime
          );
        }
      }
    },
    {
      scope: refBox,
      dependencies: [hasLoadedAnimationFinished, hasPageTransitionFinished],
    }
  );

  return (
    <div ref={refBox} className={`w-full md:w-[${width}]`}>
      <h1 className="text-other_hero_title_sm md:text-other_hero_title_md lg:text-other_hero_title_lg 2xl:text-other_hero_title_2xl font-clash font-semibold text-typo-primary">
        {lines.map((row, rowIndex) => (
          <span
            key={rowIndex}
            className="flex flex-wrap items-center gap-x-3 leading-[1.1] tracking-[1.5px] 3xl:text-[clamp(50px,2.9vw,64px)]"
          >
            {row.map((item, itemIndex) =>
              item === "capsule" ? (
                <span
                  key={itemIndex}
                  className="overflow-hidden inline-block rounded-full w-[20vw] md:w-[12vw] lg:w-[8vw] 2xl:w-[8vw] h-[40px] md:h-[4vw] lg:h-[3vw] 2xl:h-[2.5vw] bg-cover bg-top bg-no-repeat jb-capsoul"
                >
                  <span
                    className="relative block visible rounded-full w-[20vw] md:w-[12vw] lg:w-[8vw] 2xl:w-[8vw] h-[40px] md:h-[4vw] lg:h-[3vw] 2xl:h-[2.5vw] bg-cover bg-center bg-no-repeat hero_ani_text"
                    style={{
                      aspectRatio: "1 / 1",
                      // No fixed backgroundSize: bg-cover fills the capsule at every width
                      backgroundPosition: "center",
                      margin: "0 0 1% 3%",
                    }}
                  />
                </span>
              ) : item === "rolling-text" ? (
                <span
                  key={itemIndex}
                  className="anm-hero-rolling block overflow-hidden"
                  style={{ height: "2.5rem", lineHeight: "2.5rem" }}
                >
                  <div ref={rollingRef} style={{ willChange: "transform" }}>
                    {[...rollingWords, rollingWords[0]].map((word, i) => (
                      <div
                        key={i}
                        className="block"
                        style={{ height: "2.5rem", lineHeight: "2.5rem" }}
                      >
                        {word}
                      </div>
                    ))}
                  </div>
                </span>
              ) : (
                <span
                  key={itemIndex}
                  className={[
                    cn("relative visible inline-block", {
                      " text-justify": rowIndex !== lines.length - 1,
                    }),
                    "flex overflow-hidden font-clash font-semibold uppercase leading-[1.2] [word-spacing:0.1em]",
                  ].join(" ")}
                >
                  <span className="mix-title-element-text">{item}</span>
                </span>
              )
            )}
          </span>
        ))}
      </h1>

      <div className={cn({ "mt-3": description?.length })}>
        {description &&
          description.map((el, idx) => (
            <p
              className={`flex overflow-hidden font-helvetica text-hero_subtitle_sm md:text-hero_subtitle_md lg:text-hero_subtitle_lg 2xl:text-hero_subtitle_2xl 3xl:text-[clamp(22px,1.47vw,30px)] font-normal leading-[1.4] md:leading-[1.2] lg:leading-[1] text-[#848484] inline ${
                idx !== 0 ? "ml-1" : ""
              }`}
              key={idx}
            >
              <span className="anm-hero-pera">{el}</span>
            </p>
          ))}
      </div>
    </div>
  );
};

export default TitleImgBannerJB;
