"use client";

import { useCursor } from "@/context/CursorContext";
import gsap from "gsap";
import { useEffect, useRef } from "react";
import styles from "./CursorDot.module.css";

const CursorDot = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const { label } = useCursor();
  const isActive = label !== "";

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };

    const setX = gsap.quickSetter(dot, "x", "px");
    const setY = gsap.quickSetter(dot, "y", "px");

    let frameId = 0;
    const update = () => {
      pos.x += (mouse.x - pos.x) * 0.2;
      pos.y += (mouse.y - pos.y) * 0.2;

      setX(pos.x);
      setY(pos.y);

      frameId = requestAnimationFrame(update);
    };
    update();

    const moveHandler = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener("mousemove", moveHandler, { passive: true });
    return () => {
      // Stop the follow loop, otherwise it keeps running after unmount
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", moveHandler);
    };
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    gsap.to(dot, {
      scale: isActive ? 0 : 1,
      opacity: isActive ? 0 : 1,
      duration: 0.2,
      ease: "power2.out",
    });
  }, [isActive]);

  return <div id="cursor-dot" ref={dotRef} className={styles.cursorDot} />;
};

export default CursorDot;
