"use client";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef } from "react";

gsap.registerPlugin(Draggable, ScrollTrigger);

interface SliderItem {
  url: string;
}

interface Props {
  sliderList: SliderItem[];
}

export default function GsapImageMarquee({ sliderList }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const velocity = useRef(1);
  const scrollVelocity = useRef(0);
  const direction = useRef(1);

  useEffect(() => {
    // Ticker and window listeners are not tracked by gsap.context, so they are removed explicitly
    let tick: (() => void) | null = null;
    let onResize: (() => void) | null = null;

    const ctx = gsap.context(() => {
      const wrapper = wrapperRef.current;
      const track = trackRef.current;
      if (!wrapper || !track) return;

      let lastScrollY = window.scrollY;
      let lastTimestamp = performance.now();
      let offsetX = 0;

      const updateSize = () => {
        // Each side is half the duplicated track
        return track.scrollWidth / 2;
      };

      let trackHalfWidth = updateSize();
      onResize = () => {
        trackHalfWidth = updateSize();
      };
      window.addEventListener("resize", onResize);

      // Dragging via Draggable
      Draggable.create(track, {
        type: "x",
        inertia: true,
        edgeResistance: 0.65,
        onPress: function () {
          gsap.set(track, { willChange: "transform" });
        },
        onDrag: function () {
          velocity.current = -this.getVelocity() / 50;
        },
        onThrowUpdate: function () {
          velocity.current = -this.getVelocity() / 50;
        },
        onRelease: function () {
          const vel = Math.abs(this.getVelocity());
          direction.current = this.getVelocity() < 0 ? -1 : 1;
          velocity.current = Math.min(Math.max(vel / 50, 0.5), 3);
        },
      });

      lastScrollY = window.scrollY;
      const currentTimestamp: number = performance.now();

      let rawVelocity: number = 0;
      let smoothedVelocity: number = 0;
      offsetX = 0;

      const direction = { current: 1 };
      const velocity = { current: 1 }; // base speed
      const scrollVelocity = { current: 0 };

      const trackElement: HTMLElement | null =
        document.querySelector(".your-track-class");
      const wrapperElement: HTMLElement | null = document.querySelector(
        ".your-wrapper-class"
      );
      let currentTrackHalfWidth: number = track?.offsetWidth
        ? track.offsetWidth / 2
        : 0;

      // Helper function
      const lerp = (start: number, end: number, t: number): number => {
        return start + (end - start) * t;
      };

      if (track && wrapper) {
        const visibility = ScrollTrigger.create({
          trigger: wrapper,
          start: "top bottom",
          end: "bottom top",
          onUpdate: () => {
            const now = performance.now();
            const currentY = window.scrollY;
            const deltaY = currentY - lastScrollY;
            const dt = now - lastTimestamp;

            direction.current =
              deltaY > 0 ? 1 : deltaY < 0 ? -1 : direction.current;
            rawVelocity = Math.abs(deltaY / dt) * 60;

            lastScrollY = currentY;
            lastTimestamp = now;
          },
        });

        tick = () => {
          // Skip the per-frame work while the marquee is off screen
          if (!visibility.isActive) return;

          smoothedVelocity = lerp(smoothedVelocity, rawVelocity, 0.075);
          scrollVelocity.current = Math.min(smoothedVelocity, 3);

          const baseSpeed = velocity.current;
          const boost = scrollVelocity.current;
          const speed = baseSpeed + boost * 0.75;

          offsetX -= speed * direction.current;

          // Loop
          if (offsetX <= -trackHalfWidth) offsetX += trackHalfWidth;
          if (offsetX >= 0) offsetX -= trackHalfWidth;

          gsap.set(track, { x: offsetX });
        };
        gsap.ticker.add(tick);
      }
    });

    return () => {
      if (tick) gsap.ticker.remove(tick);
      if (onResize) window.removeEventListener("resize", onResize);
      ctx.revert();
    };
  }, [sliderList]);

  return (
    <section>
      <div
        ref={wrapperRef}
        className="overflow-hidden w-full cursor-grab active:cursor-grabbing"
      >
        <div
          ref={trackRef}
          className="flex marquee-track"
          style={{ willChange: "transform" }}
        >
          {[...sliderList, ...sliderList].map((item, idx) => (
            <div
              key={idx}
              className="w-[23%] rounded-lg overflow-hidden mx-2 flex-shrink-0"
            >
              <Image
                src={item.url}
                alt={`Slide ${idx + 1}`}
                width={1000}
                height={1000}
                className="w-full h-auto"
                priority
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
