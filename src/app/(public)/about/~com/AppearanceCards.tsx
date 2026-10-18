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

const brands = [
  {
    title: "Human First Approach",
    description:
      "MOTIF® focuses on the emotional connection brands make with their audience, not just the numbers. Every decision is rooted in understanding human behavior.",
  },
  {
    title: "Long Term Growth",
    description:
      "MOTIF® forms lasting partnerships, not transactional relationships. Focus is on building long-term brand value that continues to grow year after year.",
  },
  {
    title: "Creatives Drive Impacts",
    description:
      "Creativity drives everything. Data supports it. MOTIF® uses art and design to captivate audiences, elevating creativity with technology.",
  },
  {
    title: "Data Third Brand Lead",
    description:
      "Data serves as a support tool, not the driving force. MOTIF® focuses on building emotional connections first, using data to fine-tune strategies.",
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
    <section
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
              {/* <div>
                <div className="w-auto md:w-auto h-[18rem] lg:h-auto lg:w-[22vw] hover:rounded-[17%] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.165, 0.84, 0.44, 1)]">
                  <Image
                    className="h-full w-auto brand-card-img"
                    src={item.img}
                    objectFit="contain"
                    width={800}
                    height={500}
                    alt=""
                  />
                </div>
                <div>
                  <h2 className="barnd_card_name uppercase font-clash text-[clamp(20px,calc(100vw/10),1.6rem)] font-semibold mt-[.8vw] mb-[15px] md:mb-[.2vw] leading-[1.3]">
                    {item.name}
                  </h2>
                  <p className="barnd_card_category font-helvetica text-[15px] font-medium text-typo-primary">
                    {item.category}
                  </p>
                </div>
              </div>
              <div
                className="barnd_card_id rotate-180 text-end"
                style={{ writingMode: "vertical-rl" }}
              >
                {item.id}
              </div> */}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default AppearanceCards;
