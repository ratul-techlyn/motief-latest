"use client";

import GlassoMorphismCard from "@/components/shared/marqueeNav/GlassoMorphismCard";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

gsap.registerPlugin(ScrollTrigger);


enum Feeling {
  Sad = 1,
  Neutral = 2,
  Happy = 3,
}

const feelingColorMap = {
  [Feeling.Sad]: ["#394e7a", "	#8e9ac7", "#4ee"],
  [Feeling.Neutral]: ["#22d", "#c8f8ff", "#6d2"],
  [Feeling.Happy]: ["#39f", "#f4e54d", "#fa3"],
};

const feelingLabelMap = {
  [Feeling.Sad]: "Could be better",
  [Feeling.Neutral]: "Okay",
  [Feeling.Happy]: "Happy",
};

const brands = [
  {
    title: "Beyond The Algorithms",
    description:
      "Beauty isn’t built on trends or TikTok hacks. It’s built on desire. We ignore the algorithm and create brands people feel."
    },
  {
    title: "Crafting Obsessions",
    description:
    "Clicks fade. Obsession stays. We don’t chase vanity metrics. We build beauty brands that live in routines, rituals, and hearts."   
  },
  {
    title: " Creative First, Always",
    description:
    "Performance comes and goes. Creative sticks. We start with story, soul, and seduction then scale it like hell."    
  },
  {
    title: "Desire Over Discounts.",
    description:
    "Anyone can offer 20% off. Few can build want. We turn interest into need, and brand moments into lifelong love."    
  },
  {
    title: "Presence Over Platform",
    description:
    "It’s not about showing up everywhere. It’s about showing up right where desire begins, where decisions are made, where beauty lives."

  },
  {
    title: "Feel > Funnel",
    description:
    "Funnels don’t build loyalty. Feelings do. We design every touchpoint to move people not just move them through."
  },
];

const AppearanceCards = () => {
  const [isWindow, setIsWindow] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);

  const brandSectionRef = useRef<HTMLDivElement>(null);
  const [feeling, setFeeling] = useState<Feeling>(Feeling.Neutral);

  useEffect(() => {
    // Scoped so the timeline and its ScrollTrigger are reverted on unmount/re-run
    const ctx = gsap.context(() => {
      if (brandSectionRef.current) {
        const crads = brandSectionRef.current.querySelectorAll(".brand-card");
        const cardNames =
          brandSectionRef.current.querySelectorAll(".barnd_card_name");
        const cardCategories = brandSectionRef.current.querySelectorAll(
          ".barnd_card_category"
        );
        const cardIds =
          brandSectionRef.current.querySelectorAll(".barnd_card_id");
        const cardImages =
          brandSectionRef.current.querySelectorAll(".brand-card-img");

        const brandTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: brandSectionRef.current,
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play none none restart",
          },
        });

        brandTimeline
          .from(crads, {
            opacity: 0,
            x: "100vw",
            duration: 3,
            delay: (index) => index * 0.01,
            ease: "power2.inOut",
          })
          .from(
            cardImages,
            {
              borderRadius: "17%",
              duration: 1,
              ease: "power2.inOut",
            },
            "-=0.5"
          )
          .from(cardNames, {
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
          })
          .from(
            cardCategories,
            {
              opacity: 0,
              duration: 1,
              ease: "power2.inOut",
            },
            "<"
          )
          .from(
            cardIds,
            {
              opacity: 0,
              duration: 1,
              ease: "power2.inOut",
            },
            "<"
          );
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
    <section data-cursor-label="ETHOS"
      ref={brandSectionRef}
      style={{
        ["--color-a" as string]: "#d53c05",
        ["--color-b" as string]: "#6f2004",
        ["--color-c" as string]: "#fff",
      }}
      className="relative card_background overflow-hidden h-screen flex bg-dark items-center mx-auto min-h-[435.75px]  before:absolute  before:bg-gradient-to-br before:from-[--color-a] before:to-[--color-b] before:blur-[50px] before:brightness-125 after:absolute  after:origin-[60%] after:animate-blob-reverse after:bg-gradient-to-br after:from-[--color-a] after:to-[--color-b] after:blur-[50px] after:brightness-125"
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
        {brands.map((item, index) => (
          <SwiperSlide className="!w-auto !mr-4" key={index}>
            <div className="flex gap-0 brand-card">
              <GlassoMorphismCard
                title={item.title}
                description={item.description}
                numberText={(index + 1).toString().padStart(4, "0")}
                className="w-[clamp(16rem,20vw,24rem)] sm:w-[clamp(18rem,18vw,22rem)] md:w-[35vw] lg:w-[clamp(23vw,25vw,28vw)]
            h-[25rem] sm:h-[clamp(24rem,28rem,32rem)] lg:h-[32rem]
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
