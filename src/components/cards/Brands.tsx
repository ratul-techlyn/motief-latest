"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

gsap.registerPlugin(ScrollTrigger);

const partners = [
  "/assets/what_we_do/partner/partner1.webp",
  "/assets/what_we_do/partner/partner2.webp",
  "/assets/what_we_do/partner/partner3.webp",
  "/assets/what_we_do/partner/partner4.webp",
  "/assets/what_we_do/partner/partner5.webp",
  "/assets/what_we_do/partner/partner6.webp",
  "/assets/what_we_do/partner/partner7.webp",
  "/assets/what_we_do/partner/partner8.webp",
  "/assets/what_we_do/partner/partner9.webp",
  "/assets/what_we_do/partner/partner10.webp",
  "/assets/what_we_do/partner/partner11.png",
  "/assets/what_we_do/partner/partner12.png",
  "/assets/what_we_do/partner/partner13.png",
  "/assets/what_we_do/partner/partner14.webp",
  "/assets/what_we_do/partner/partner15.webp",
];

const Brands = () => {
  const refBox = useRef<HTMLUListElement | null>(null);
  const [finishedTimeline, setFinishedTimeline] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useGSAP(
    () => {
      if (refBox.current) {
        const brands = refBox.current.querySelectorAll(".brand_box");

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: refBox.current,
            start: "top bottom-=100",
            end: "center center",
            scrub: true,
            toggleActions: "restart none none reverse",
            onUpdate: (self) => {
              if (self.progress > 0.5) {
                setFinishedTimeline(true);
              }
            },
          },
        });

        timeline.fromTo(
          brands,
          {
            opacity: 0,
            y: 100,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: "power3.out",
          }
        );
      }
    },
    { scope: refBox }
  );

  useEffect(() => {
    if (!finishedTimeline || !refBox.current) return;

    const brands = refBox.current.querySelectorAll(".brand_box");
    if (brands.length === 0) return;

    let animationRef: gsap.core.Tween | null = null;
    let masterRef: gsap.core.Timeline | null = null;
    let cancelled = false;

    const animateBrands = () => {
      if (cancelled) return;
      // Generate random indexes for staggered animation
      const indexes = Array.from({ length: brands.length }, (_, i) => i).sort(
        () => Math.random() - 0.5
      );

      // Create master timeline
      const masterTl = gsap.timeline({
        onComplete: () => {
          // Schedule next animation cycle
          if (!cancelled) animationRef = gsap.delayedCall(3, animateBrands);
        },
      });
      masterRef = masterTl;

      brands.forEach((brand, pos) => {
        const index = indexes[pos];
        const images = brand.querySelectorAll("img");

        // Create individual brand timeline
        const brandTl = gsap.timeline();

        brandTl
          .to(brand, {
            scale: 0.5,
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
          })
          .call(() => {
            // More efficient image switching
            images.forEach((img, i) => {
              img.style.display = i === index ? "block" : "none";
            });
          })
          .to(brand, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          });

        // Add to master timeline with staggered delay
        masterTl.add(brandTl, index * 0.1);
      });
    };

    // Start the animation cycle
    animateBrands();

    // Cleanup function
    return () => {
      cancelled = true;
      if (animationRef) {
        animationRef.kill();
      }
      masterRef?.kill();
      gsap.killTweensOf(brands);
    };
  }, [finishedTimeline]);

  return (
    <>
      <div className="layout_normal w-[90%] md:w-[90%] lg:w-[70%]">
        <section className="my-24 md:my-48"
         aria-label="Technology, platform, and software partners powering MOTIF®’s brand incubation and acceleration services">
         <h2 className="sr-only">
            Strategic Partnerships with Technology & Platform Providers
          </h2>
          <p className="sr-only">
            MOTIF® partners with world-class platforms, tools, and software providers to deliver seamless brand incubation, marketing execution, and growth acceleration. These technology partnerships—including advertising platforms, eCommerce tools, analytics engines, and design systems—support our work across fashion, luxury lifestyle, and beauty brands. Unlike traditional agencies, MOTIF® integrates strategic platforms to act as an end-to-end growth partner.
          </p>
          <ul
            ref={refBox}
            className="grid grid-cols-2 lg:grid-cols-[repeat(5,minmax(150px,1fr))]  gap-x-4 gap-y-8 md:gap-y-10"
          >
            {partners.slice(0, isMobile ? 14 : 15).map((brand, idx) => (
              <li
                key={idx}
                className="w-full h-[100px] flex items-center justify-center"
              >
                <div className="w-[65%] brand_box opacity-0">
                  {partners.map((brand, newIdx) => (
                    <Image
                      key={newIdx}
                      className={`object-contain ${
                        idx === newIdx ? "block" : "hidden"
                      }`}
                      src={brand}
                      alt="MOTIF strategic technology partner logo"
                      width={400}
                      height={250}
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
};

export default Brands;
