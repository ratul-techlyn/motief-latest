import { useAnimationComplete } from "@/context/AnimationContext";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

type Props = {
  direction: "left" | "right";
  triggerRef: React.RefObject<HTMLElement>;
  delay?: number;
  absolute?: boolean;
  position?: "top" | "bottom"; // only needed when absolute is true
};

const AnimatedLine = ({
  direction,
  triggerRef,
  delay = 0,
  absolute = false,
  position = "top",
}: Props) => {
  const lineRef = useRef<HTMLDivElement>(null);
  const { isBot } = useAnimationComplete();

  useEffect(() => {
    if (!lineRef.current || !triggerRef.current || isBot) return;

    // Scoped so the tween and its ScrollTrigger are removed on unmount/re-run
    const ctx = gsap.context(() => {
      // Reset the line scale before animating
      gsap.set(lineRef.current, {
        scaleX: 0,
        transformOrigin: direction,
      });

      gsap.fromTo(
        lineRef.current,
        { scaleX: 0, transformOrigin: direction },
        {
          scaleX: 1,
          duration: 4.5,
          delay: delay,
          stagger: 4,
          ease: "power4.out",
          scrollTrigger: {
            trigger: triggerRef.current,
            start: "top 80%",
          },
        }
      );
    });

    return () => ctx.revert();
  }, [direction, triggerRef, delay, isBot]);

  if (absolute) {
    return (
      <div
        className={`absolute ${position}-0 left-0 w-full h-[2px] overflow-hidden`}
      >
        <div
          ref={lineRef}
          className="w-full h-full"
          style={{
            backgroundColor: "rgba(47, 47, 47, 0.6)",
            transform: "scaleX(0)",
          }}
        />
      </div>
    );
  }

  // Inline version (e.g. inside a flex row)
  return (
    <div className="ml-auto h-[2px] w-[100%] lg:w-full overflow-hidden">
      <div
        ref={lineRef}
        className="w-full h-full"
        style={{
          backgroundColor: "rgba(47, 47, 47, 0.6)",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
};

export default AnimatedLine;
