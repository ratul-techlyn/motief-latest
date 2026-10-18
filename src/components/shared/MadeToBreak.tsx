"use client";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import React, { useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";

export default function MadeToBreak() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [stopCursor, setStopCursor] = useState(false);
  const [setVideo, setSetVideo] = useState(false);

  useGSAP(
    () => {
      if (sectionRef.current) {
        const headingOne = sectionRef.current.querySelector(".hero-jb-title");
        const heading = sectionRef.current.querySelector(".hero-jb-title-main");
        const subheading = sectionRef.current.querySelector(".hero-copy-jb h4");
        const video = sectionRef.current.querySelector(
          ".video_box .video_inner"
        );

        const isMobile = window.matchMedia("(max-width: 768px)").matches;

        const headingSplit = new SplitText(heading, {
          type: "chars, lines",
          lineClass: "flex overflow-hidden",
        });

        const headingOneSplit = new SplitText(headingOne, {
          type: "words, lines",
          lineClass: "flex overflow-hidden",
        });

        const subheadingSplit = new SplitText(subheading, {
          type: "words, lines",
          lineClass: "flex overflow-hidden",
        });

        const timeLine = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: isMobile ? "center center" : "top top+=50",
            end: isMobile ? "+=1000" : "+=2200",
            scrub: 1,
            pin: true,
            pinType: "fixed",
            anticipatePin: 1,
            pinReparent: true,
            invalidateOnRefresh: true,
            toggleActions: "play none none reverse",
            onUpdate: (self) => {
              if (!isMobile) {
                if (self.progress > 0.8) {
                  setStopCursor(true);
                } else {
                  setStopCursor(false);
                  setSetVideo(false);
                }
              }
            },
          },
        });

        if (isMobile) {
          timeLine
            .from(video, {
              scale: 0.6,
              y: isMobile ? 0 : -150,
              borderRadius: 20,
              duration: 3,
              ease: "power2.out",
            })
        } else {
          timeLine
            .to(headingSplit.chars, {
              y: -200,
              opacity: 0,
              stagger: 0.05,
              duration: 0.5,
              ease: "power2.out",
            })
            .to(
              headingOneSplit.words,
              {
                y: -200,
                opacity: 0,
                stagger: 0.05,
                duration: 0.5,
                ease: "power2.out",
              },
              "<"
            )
            .to(
              subheadingSplit.lines,
              {
                y: -300,
                opacity: 0,
                stagger: 0,
                duration: 1,
                ease: "power2.out",
              },
              "<"
            )
            .from(
              video,
              {
                scale: 0.25,
                y: -150,
                borderRadius: 40,
                duration: 3,
                ease: "power2.out",
              },
              "<"
            )
            .to(sectionRef.current, {
              duration: 2,
            });
        }
      }
    },
    { scope: sectionRef }
  );

  const handleMouseover = (e: MouseEvent) => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;

    if (sectionRef.current && !stopCursor && !isMobile) {
      const video = sectionRef.current.querySelector(
        ".video_box .video_inner"
      ) as HTMLElement;

      const x = e.clientX - 850;

      gsap.to(video, {
        x: x,
        duration: 1,
        ease: "power2.out",
        // Each mousemove replaces the previous follow tween instead of stacking another
        overwrite: "auto",
      });
    }
  };

  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (sectionRef.current && !isMobile) {
      const video = sectionRef.current.querySelector(
        ".video_box .video_inner"
      ) as HTMLElement;
      const videoRect = video?.getBoundingClientRect() ?? new DOMRect();
      const x = videoRect.left;

      if (!setVideo) {
        gsap.fromTo(
          video,
          {
            x: x,
          },
          {
            x: 0,
            duration: 1,
            ease: "power2.out",
          }
        );
        setSetVideo(true);
      }
    }
  }, [stopCursor]);

  return (
    <section
      ref={sectionRef}
      //   data-cursor-label="Hover"
      onMouseMove={(e: React.MouseEvent<HTMLElement>) =>
        handleMouseover(e as unknown as MouseEvent)
      }
      className="hero-jb h-[50vh] md:h-screen py-10 relative lg:pb-[150vh]"
    >
      <div className="headings lg:mb-[20vh] leading-none">
        <h3 className="hero-jb-title">Made To</h3>
        <h3 className="hero-jb-title-main">Break</h3>
      </div>

      <div className="hero-copy-jb px-2 w-full max-w-[90%] mx-auto">
        <h4 className="capitalize text-[1.8vw] font-medium leading-none">
          Motif Breaks Patterns to
          <br />
          Shape Meaningful Brands
        </h4>
        {/* <p>(Scroll)</p> */}
      </div>

      <div className="video_box w-full mt-10 absolute top-[0] left-[0]">
        <div className="video_inner">
          <div className="video_wrapper">
            <video src="/assets/video/morif-incubation-not-an-agency.mp4" className="w-full h-full object-cover" muted autoPlay loop></video>
          </div>

          <div className="video-title hidden">
            <p>PRO Showreel</p>
            <p>2023 - 2024</p>
          </div>
        </div>
      </div>
    </section>
  );
}
