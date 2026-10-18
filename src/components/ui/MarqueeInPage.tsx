"use client";

import { MotifIcon } from "@/components/motif-icon";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { horizontalLoop } from "../shared/marqueeNav/horizontalLoop";

gsap.registerPlugin(Observer, ScrollTrigger);
// gsap.registerPlugin(Observer)

interface MarqueeNavigationProps {
  text: string[]; // list of text strings to loop
  speed?: number;
  className?: string;
  iconClass?: string;
  iconSize?: string;
  href?: string;
  direction?:number;
}

export default function MarqueeInPage({
  text,
  speed = 1,
  className,
  iconClass,
  iconSize,
  href,
  direction,
}: MarqueeNavigationProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  const marqueeContent = (text:string) => (
    <span className="inline-flex items-center">
      <span className="uppercase font-clash">{text.toUpperCase()}</span>
      <span className="flex items-center mx-3 lg:mx-8">
        <MotifIcon className={iconClass} size={iconSize} />
      </span>
    </span>
  );
  // const items = new Array(21).fill(marqueeContent);
  const itemList = text.map(marqueeContent)
  // Fill up to 21 items
const repeatCount = Math.ceil(21 / itemList.length);
const items = Array(repeatCount)
  .fill(itemList)
  .flat()
  .slice(0, 21); // Ensure exact length

  useEffect(() => {
    if (!railRef.current || !wrapperRef.current || !items?.length) return;

    const h4Elements = gsap.utils.toArray<HTMLHeadingElement>(
      railRef.current.querySelectorAll("h4")
    );

    const tl = horizontalLoop(h4Elements, {
      repeat: -1,
      speed,
      paddingRight: 15,
      paddingLeft: 30,
    });


    let currentDirection = 1;
    // This instance's own trigger (a shared id would let one marquee kill another's trigger)
    let fadeTrigger: ScrollTrigger | null = null;

    const onWheel = (e: WheelEvent) => {
      const newDirection = e.deltaY < 0 ? -1 : 1;
      if (newDirection !== currentDirection) {
        gsap.to(tl, {
          timeScale: newDirection,
          duration: 0.3,
          overwrite: true,
        });
        currentDirection = newDirection;
      }
    };

    if(direction){
      gsap.to(tl, {
        timeScale: direction,
        duration: 0.3,
        overwrite: true,
      });
    }else{

      // 👇 Custom scroll direction detection


      // Attach to the marquee wrapper only, not window
      wrapperRef.current.addEventListener("wheel", onWheel, { passive: true });

      // Fade-in animation (unchanged)
      gsap.set(wrapperRef.current, { opacity: 0, y: 50 });

      fadeTrigger = ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top 90%",
        end: "bottom 10%",
        onEnter: () => {
          gsap.fromTo(
            wrapperRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }
          );
        },
        onLeave: () => gsap.set(wrapperRef.current, { opacity: 0, y: 50 }),
        onEnterBack: () => {
          gsap.fromTo(
            wrapperRef.current,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }
          );
        },
        onLeaveBack: () => gsap.set(wrapperRef.current, { opacity: 0, y: 50 }),
      });
    }


    return () => {
      tl.kill();
      wrapperRef.current?.removeEventListener("wheel", onWheel);
      fadeTrigger?.kill();
    };
  }, [text.join("|"), iconSize, speed, direction]);

  return (
    <div
      ref={wrapperRef}
      className={`scrolling-text w-full overflow-hidden flex items-center bg-black ${
        className || ""
      }`}
    >
      <Link href={href?.toString() || ""} passHref>
        <div ref={railRef} className="rail flex">
          {items?.map((text, idx) => (
            //   <h4 key={idx} className="text-[100px] font-black whitespace-nowrap mr-[30px] text-white">
            <h4
              key={idx}
              className=" whitespace-nowrap text-[6vw] leading-none tracking-tight text-white hover:text-white/90 transition-colors font-medium"
            >
              {text}
            </h4>
          ))}
        </div>
      </Link>
    </div>
  );
}
