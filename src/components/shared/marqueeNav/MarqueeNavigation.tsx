"use client";

import { MotifIcon } from "@/components/motif-icon";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { horizontalLoop } from "./horizontalLoop";

gsap.registerPlugin(Observer, ScrollTrigger);

interface MarqueeNavigationProps {
  text: string[]; 
  speed?: number;
  className?: string;
  iconClass?: string;
  iconSize?: number;
  href?: string;
  direction?: number;
}

export default function MarqueeNavigation({
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

  const marqueeContent = (text: string) => (
    <span className="inline-flex items-center">
      <span className="uppercase font-clash">{text.toUpperCase()}</span>
      <span className="flex items-center mx-3 lg:mx-8">
        <MotifIcon className={iconClass} size={iconSize} />
      </span>
    </span>
  );
  const itemList = text.map(marqueeContent);
  const repeatCount = Math.ceil(21 / itemList.length);
  const items = Array(repeatCount).fill(itemList).flat().slice(0, 21); // Ensure exact length

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

    if (direction) {
      gsap.to(tl, {
        timeScale: direction,
        duration: 0.3,
        overwrite: true,
      });
    } else {
      wrapperRef.current.addEventListener("wheel", onWheel, { passive: true });

      fadeTrigger = ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top 90%",
        end: "bottom 10%",
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
            <h4
              key={idx}
              className=" whitespace-nowrap text-[10vw] lg:text-[8vw] leading-none tracking-tight text-white hover:text-white/90 transition-colors font-medium"
            >
              {text}
            </h4>
          ))}
        </div>
      </Link>
    </div>
  );
}
