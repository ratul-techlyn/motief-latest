"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import GlassoMorphismCard from "./GlassMorphismCards";

gsap.registerPlugin(ScrollTrigger);

const brands =  [
    {
        title: "We help you...",
        description:
            "To Achieve your goals with our expert guidance and helping you by",
        points: [
            "— Mastering your positioning.",
            "— Acquiring and retaining customers.",
            "— Make you own your online presence.",
        ],
        id: "01",
    },
    {
        title: "We have...",
        description: "Everything you need to be successful in the industry such as",
        points: [
            "— Tech Partners and high—profile creators.",
            "— Years of experience with brands like yours.",
            "— Tons of insights to draw from.",
        ],
        id: "02",
    },
    {
        title: "We use...",
        description:
            "Industry Expertise & straightforward insights to drive results.",
        points: [
            "— First party data analytics.",
            "— Knowledge of culture & where it's headed.",
            "— Straightforward insights to drive results.",
        ],
        id: "03",
    },
    
    {
        title: "We give you...",
        description:
            "All the things combined power to elevate and upscale your brand such as",
        points: [
            "— A strategy to launch.",
            "— A playbook to grow.",
            "— Resource to scale.",
        ],
        id: "04",
    },
    
  ];



const AppearanceCards = () => {
    const [isWindow, setIsWindow] = useState(false);
    const [slideOffset, setSlideOffset] = useState(0);

    const brandSectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      // Scoped so the timeline and its ScrollTrigger are reverted on unmount/re-run
      const ctx = gsap.context(() => {
        if (brandSectionRef.current) {
          const crads = brandSectionRef.current.querySelectorAll(".brand-card");
          const cardNames = brandSectionRef.current.querySelectorAll(".barnd_card_name");
          const cardCategories = brandSectionRef.current.querySelectorAll(".barnd_card_category");
          const cardIds = brandSectionRef.current.querySelectorAll(".barnd_card_id");
          const cardImages = brandSectionRef.current.querySelectorAll(".brand-card-img");

          const brandTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: brandSectionRef.current,
              start: "top 90%",
              end: "bottom top",
              toggleActions: "play none none restart",
            },
          });

          brandTimeline.from(crads, {
            opacity: 0,
            x: "100vw",
          
            duration: 2,
            delay: (index) => index * 0.01,
            ease: "power2.inOut",
          }).from(cardImages, {
            borderRadius: "17%",
            duration: 1,
            ease: "power2.inOut",
          }, "-=0.5").from(cardNames, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
          }).from(cardCategories, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
          }, "<").from(cardIds, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
          }, "<");
        }
      }, brandSectionRef);
      return () => ctx.revert();
    }, [brandSectionRef.current, isWindow]);

    useEffect(() => {
      const calculateOffset = () => {
        const viewportWidth = window.innerWidth;

        let layoutWidth = viewportWidth;

        if (viewportWidth >= 1024) {
          layoutWidth = Math.min(viewportWidth * 0.7, 1536); // lg:w-[70%]
        } else {
          layoutWidth = viewportWidth * 0.9; // w-[90%] for md and below
        }

        const offset = (viewportWidth - layoutWidth) / 2;
        setSlideOffset(offset);
      };

      calculateOffset();
      window.addEventListener("resize", calculateOffset);
      setIsWindow(true);
      return () => window.removeEventListener("resize", calculateOffset);
    }, []);

    if (!isWindow) {
      return <div className="mt-20 mx-auto px-3 min-h-[435.75px]"></div>;
    }


    return (
        <section
      ref={brandSectionRef}
      className="mt-20 mx-auto px-3 min-h-[435.75px]"
    >
      <Swiper
        slidesPerView={"auto"}
        spaceBetween={10}
        pagination={false}
        scrollbar={{
          el: ".swiper-scrollbar",
          draggable: true,
          dragSize: 100,
        }}
        // freeMode={{
        //     enabled: true,
        //     sticky: false,
        //     momentumBounce: false,
        // }}
        loop={false}
        slidesOffsetBefore={slideOffset}
        modules={[FreeMode]}
        className="mySwiper flex flex-nowrap gap-2 text-typo-primary"
      >
        {brands.map((item,index) => (
          <SwiperSlide className="!w-auto !mr-4" key={index}>
            <div className="flex gap-0 brand-card">
            <GlassoMorphismCard
            title={item.title}
            description={item.description}
            points={item.points}
            numberText={(index + 1).toString().padStart(4, "0")}
            className="w-[clamp(20rem,25vw,24rem)] sm:w-[clamp(18rem,18vw,22rem)] md:w-[35vw] lg:w-[clamp(25vw,29vw,33vw)]
            h-[25rem] sm:h-[clamp(24rem,28rem,32rem)] lg:h-[26rem]
              hover:rounded-[5%] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.165, 0.84, 0.44, 1)]"
          />

                                            
            </div>
            
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
    );
};

export default AppearanceCards;