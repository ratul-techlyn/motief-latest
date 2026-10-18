"use client";

import { useCursor } from "@/context/CursorContext";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import styles from "./CursorLabel.module.css";

const CursorLabel = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { label, setLabel } = useCursor();

  useEffect(() => {
    const containerEl = containerRef.current;
    if (!containerEl) return;

    const glass = containerEl.querySelector(
      `.${styles.glassDot}`
    ) as HTMLDivElement;
    const textSpan = containerEl.querySelector(
      `.${styles.labelText}`
    ) as HTMLSpanElement;

    let cursorX = 0;
    let cursorY = 0;
    let lastAttr: string | null = null;
    let lastHasLabel: boolean | null = null;

    const handleMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const labelSource = target?.closest?.("[data-cursor-label]");
      const attr = labelSource?.getAttribute("data-cursor-label") || "";
      if (attr !== lastAttr) {
        lastAttr = attr;
        setLabel(attr);
      }

      cursorX = e.clientX;
      cursorY = e.clientY;

      // overwrite: each move replaces the previous follow tween instead of stacking
      gsap.to(containerEl, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: "power3.out",
        overwrite: "auto",
      });

      const hasLabel = Boolean(attr);
      // Glass/text targets only change when the label appears or disappears
      if (hasLabel === lastHasLabel) return;
      lastHasLabel = hasLabel;

      gsap.to(glass, {
        scale: hasLabel ? 1.2 : 0.5,
        opacity: hasLabel ? 1 : 0,
        backgroundColor: hasLabel ? "rgba(255,255,255,0.08)" : "#ED5F09",
        borderColor: hasLabel ? "rgba(255,255,255,0.2)" : "transparent",
        backdropFilter: hasLabel ? "blur(10px)" : "blur(0px)",
        duration: 0.25,
        ease: hasLabel ? "power2.out" : "power2.in",
        overwrite: "auto",
      });

      gsap.to(textSpan, {
        opacity: hasLabel ? 1 : 0,
        y: hasLabel ? 0 : 6,
        duration: 0.2,
        ease: hasLabel ? "power2.out" : "power2.in",
        overwrite: "auto",
      });
    };

    // ✅ define scroll handler once
    const handleScroll = () => {
      handleMove({
        clientX: cursorX, // fallback X
        clientY: cursorY, // Y follows scroll
      } as MouseEvent);
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setLabel]);

  return (
    <div ref={containerRef} className={styles.cursorLabelContainer}>
      <div className={styles.glassDot}>
        <span className={styles.labelText}>{label}</span>
      </div>
    </div>
  );
};

export default CursorLabel;
