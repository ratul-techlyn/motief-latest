"use client";

import { useAnimationComplete } from "@/context/AnimationContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cubesData as cubesDataDesktop } from "@/lib/cubesData";
import { cubesDataMobile } from "@/lib/cubesDataMobile";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "./loading-anim.css";

interface LoadingAnimationProps {
  onComplete?: () => void;
}

export default function LoadingAnimation({
  onComplete,
}: LoadingAnimationProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showCubes, setShowCubes] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const cubesRef = useRef<HTMLDivElement>(null);
  const { setAnimationComplete } = useAnimationComplete();
  const isMobile = useIsMobile();
  const cubesData = isMobile ? cubesDataMobile : cubesDataDesktop;
  const startTimeRef = useRef<number>(Date.now());

  const imageUrls = [
    "/images/cube-faces/cube-1.jpg",
    "/images/cube-faces/cube-2.jpg",
    "/images/cube-faces/cube-3.jpg",
    "/images/cube-faces/cube-4.jpg",
    "/images/cube-faces/cube-5.jpg",
    "/images/cube-faces/cube-6.jpg",
    "/images/cube-faces/cube-7.jpg",
    "/images/cube-faces/cube-8.jpg",
    "/images/cube-faces/cube-9.jpg",
    "/images/cube-faces/cube-10.jpg",
    "/images/cube-faces/cube-11.jpg",
    "/images/cube-faces/cube-12.jpg",
    "/images/cube-faces/cube-13.jpg",
    "/images/cube-faces/cube-14.jpg",
  ];

  // Check if user has seen the animation before (using cookies for consistency)
  useEffect(() => {
    const hasSeenAnimation = document.cookie.includes("hasSeenMotifAnimation=true");
    const isFirstTime = !hasSeenAnimation;

    setIsFirstTimeUser(isFirstTime);

    if (!isFirstTime) {
      // Not a first-time user, skip animation immediately
      setIsLoading(false);
      setAnimationComplete(true);
      onComplete?.();
      return;
    }
  }, [setAnimationComplete, onComplete]);

  const texts = [
    "MOTIF® is an incubator",
    "We grow brands into \nmovements people feel, \nfollow, and obsess over.",
    "Every strategy is a story.\nEvery design a statement.\nEvery move led by people,\nnot algorithms.",
    "Welcome to MOTIF®\nLets Make History",
  ];

  // Preload images for better performance (non-blocking)
  useEffect(() => {
    const preloadImages = async () => {
      const imagePromises = imageUrls.map((url) => {
        return new Promise<void>((resolve, reject) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => reject();
          img.src = url;
        });
      });

      // Start animation immediately, don't wait for all images
      setImagesLoaded(true);

      try {
        // Load images in background with timeout
        await Promise.race([
          Promise.all(imagePromises),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Image loading timeout')), 3000)
          )
        ]);
      } catch (error) {
        console.warn('Some images failed to preload or timed out:', error);
        // Continue with animation anyway
      }
    };

    preloadImages();

    // Fallback: ensure animation starts even if images fail to load
    const fallbackTimer = setTimeout(() => {
      if (!imagesLoaded) {
        setImagesLoaded(true);
      }
    }, 1000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Original timing for full animation experience
      const elapsedTime = Date.now() - startTimeRef.current;
      const remainingTime = Math.max(0, 16000 - elapsedTime); // Original 16s timing

      setTimeout(() => {
        // Mark animation as seen for first-time users using cookies
        document.cookie = "hasSeenMotifAnimation=true; path=/; max-age=31536000"; // 1 year
        setAnimationComplete(true);
        onComplete?.();
      }, remainingTime);

      return;
    }

    // Wait for images to load before starting animation
    if (!imagesLoaded) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= texts.length) {
          clearInterval(interval);
          setTimeout(() => {
            setIsLoading(false);
            onComplete?.();
          }, 1000); // Original 1000ms transition
          return prev;
        }

        if (nextIndex === texts.length - 1) {
          // Start vanishing cubes when the last text appears
          setTimeout(() => {
            if (cubesRef.current) {
              const cubes = gsap.utils.toArray(
                cubesRef.current.children
              ) as HTMLElement[];
              gsap.to(cubes, {
                opacity: 0,
                scale: 0,
                z: -1500,
                rotateX: "+=2160",
                rotateY: "+=2160",
                duration: 0.4, // Original duration
                stagger: {
                  each: 0.015, // Original stagger
                  from: "random",
                },
                ease: "power4.in",
                onComplete: () => {
                  setShowCubes(false);
                },
              });
            }
          }, 500); // Original 500ms response
        }
        return nextIndex;
      });
    }, 3800); // Original 3800ms text transitions

    return () => clearInterval(interval);
  }, [isLoading, texts.length, setAnimationComplete, onComplete, imagesLoaded]);

  useEffect(() => {
    const container = cubesRef.current;
    if (!(showCubes && container && imagesLoaded)) return;
    // Infinite spin timelines: scoped so they stop when the intro unmounts
    const ctx = gsap.context(() => {
      const cubes = gsap.utils.toArray(
        container.children
      ) as HTMLElement[];

      gsap.to(cubes, {
        duration: 0.8, // Original fade-in duration
        opacity: 1,
        stagger: 0.08, // Original stagger
        delay: 0.5, // Original delay
        ease: "power2.out",
      });

      Object.entries(cubesData).forEach(([, data], index) => {
        const cube = cubes[index] as HTMLElement;
        const { initial, final } = data;

        const tl = gsap.timeline({
          delay: 0.2, // Original delay
        });

        tl.to(cube, {
          rotateY: "+=360",
          rotateX: "+=10",
          duration: 6, // Original duration
          repeat: -1,
          ease: "none",
        })
          .fromTo(
            cube,
            {
              top: `${initial.top}%`,
              left: `${initial.left}%`,
              z: initial.z,
              rotateX: initial.rotateX,
              rotateY: initial.rotateY,
              rotateZ: initial.rotateZ,
            },
            {
              top: `${final.top}%`,
              left: `${final.left}%`,
              z: final.z,
              rotateX: final.rotateX,
              rotateY: final.rotateY,
              rotateZ: final.rotateZ,
              duration: 1, // Original duration
              ease: "power2.inOut",
            }
          )
          .to(
            cube,
            {
              top: `${initial.top}%`,
              left: `${initial.left}%`,
              z: initial.z,
              rotateX: initial.rotateX,
              rotateY: initial.rotateY,
              rotateZ: initial.rotateZ,
              delay: 5, // Original delay
              duration: 1, // Original duration
              ease: "power2.inOut",
            }
          );
      });
    });
    return () => ctx.revert();
  }, [showCubes, imagesLoaded]);

  // Don't render anything if not a first-time user or not loading
  if (!isFirstTimeUser || !isLoading) return null;

  const lines = texts[currentTextIndex].split("\n");

  return (
    <div no-bot-load="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white overflow-hidden">
      {showCubes && (
        <div ref={cubesRef} className="cubes absolute inset-0">
          {Object.entries(cubesData).map(([,], index) => (
            <div
              key={`cube-${index}`}
              className={`cube cube-${index + 1}`}
              style={{
                position: "absolute",
                opacity: 0, // Ensure initial opacity is 0 for fade-in
                transformStyle: "preserve-3d",
              }}
            >
              {["front", "back", "right", "left", "top", "bottom"].map(
                (face, faceIndex) => (
                  <div
                    key={face}
                    className={face}
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backfaceVisibility: "visible",
                    }}
                  >
                    <Image
                      src={
                        imageUrls[(index + faceIndex) % imageUrls.length] ||
                        "/placeholder.svg"
                      }
                      alt={`Cube face ${face}`}
                      fill
                      sizes="150px"
                      priority={true}
                      className="object-cover"
                    />
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
      <div className="w-full h-full flex items-center justify-center relative z-10">
        <div className="w-[80%] max-w-3xl flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTextIndex}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0, filter: "blur(10px)" },
                visible: {
                  opacity: 1,
                  filter: "blur(0px)",
                  transition: {
                    when: "beforeChildren",
                    staggerChildren: 0.28, // Slightly increased stagger for readability
                  },
                },
                exit: {
                  opacity: 0,
                  filter: "blur(10px)",
                  transition: { duration: 0.3 },
                },
              }}
              className={`text-md md:text-3xl w-fit font-light flex flex-col items-start text-left ${
                currentTextIndex === 0 || currentTextIndex === texts.length - 1
                  ? "uppercase text-center justify-center"
                  : ""
              }`}
            >
              {lines.map((line, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.45 }} // Slightly increased duration for readability
                  className="mb-2"
                >
                  <motion.span
                    className={`relative inline-block`}
                    variants={{
                      hidden: { clipPath: "inset(0 100% 0 0)" },
                      visible: {
                        clipPath: "inset(0 0% 0 0)",
                        transition: { duration: 0.65, ease: "easeOut" }, // Slightly increased duration for readability
                      },
                    }}
                  >
                    {line.split("$$$").map((part, i) => (
                      <span key={i} className={i === 1 ? "ml-8" : ""}>
                        {part}
                      </span>
                    ))}
                  </motion.span>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

