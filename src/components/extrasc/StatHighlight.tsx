"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface StatItem {
  value: string;
  label: string;
}

interface StatsHighlightProps {
  stats: StatItem[];
  textColor?: string;
  borderColor?: string;
  className?: string;
}

const StatsHighlight: React.FC<StatsHighlightProps> = ({
  stats,
  textColor = "text-white",
  borderColor = "white",
  className = "",
}) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const timelines: gsap.core.Timeline[] = [];

    cardRefs.current.forEach((card, index) => {
      const valueEl = card?.querySelector(".stat-value");
      if (!card || !valueEl) return;

      const targetValue = parseInt(valueEl.getAttribute("data-value") || "0");
      let obj = { count: 0 };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          start: "top 85%",
          toggleActions: "play none none reset",
        },
      });

      tl.to(obj, {
        count: targetValue,
        duration: 1.5,
        ease: "power3.out",
        onUpdate: () => {
          const val = Math.floor(obj.count);
          if (val !== parseInt(valueEl.textContent || "")) {
            valueEl.textContent = val.toString();
          }
        },
      });

      timelines.push(tl);
    });

    // Optional: expose timelines here if you want to sync with external sequences

    // Kill the timelines and their ScrollTriggers when the component unmounts
    return () => {
      timelines.forEach((tl) => {
        tl.scrollTrigger?.kill();
        tl.kill();
      });
    };
  }, []);

  return (
    <div className={`max-w-[1800px] w-full flex justify-center ${className}`}>
      <div className="w-full max-w-4xl m-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            ref={(el: HTMLDivElement | null): void => {
              cardRefs.current[index] = el;
            }}
            className={`relative w-full overflow-hidden border border-${borderColor} rounded-xl px-10 py-4 md:px-15 md:py-8 text-left`}
          >
            <h3
              className={`stat-value text-[3.5rem] font-medium font-clash leading-none mt-6 ${textColor}`}
              data-value={parseInt(item.value).toString()}
            >
              0
            </h3>
            <p
              className={`text-sm mt-3 mb-4 md:text-sm font-medium ${textColor}`}
            >
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsHighlight;
