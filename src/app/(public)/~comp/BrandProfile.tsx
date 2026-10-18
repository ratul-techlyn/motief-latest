"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

gsap.registerPlugin(ScrollTrigger);

const brands = [
  {
    id: "000-1",
    img: "/assets/home/brand_profile/lace-luxury-jewelry-brand-motif-partner-incubator-not-an-agency.png",
    name: "lace",
    category: "Strategy, Brand Marketing & CX",
  },
  {
    id: "000-2",
    img: "/assets/home/brand_profile/j-balvin-will-smith-scd-crowd.png",
    name: "SCD CROWD",
    category: "Brand Marketing, Expansion & CX",
  },
  {
    id: "000-3",
    img: "/assets/home/brand_profile/lnko-highend-eyewear-brand-motif-for-fahion-brand-motif-incubator-not-an-agency.png",
    name: "lnko",
    category: "Strategy, Brand Marketing & CX",
  },

  {
    id: "0000-4",
    img: "/assets/home/brand_profile/dp-paradis-motif-partner-brand-not-an-agency-incubator-company.png",
    name: "DP PARRADIS",
    category: "Strategy, Brand Marketing & CX",
  },

  {
    id: "000-5",
    img: "/assets/home/brand_profile/brand_profile3.png",
    name: "maybell",
    category: "Branding, Experience & Marketing",
  },
  {
    id: "000-6",
    img: "/assets/home/brand_profile/frkm-a-motif-incubato-agency-parrtner-brand-j-balvin-creative.png",
    name: "FRKM",
    category: "Brand Marketing, Strategy & Expansion",
  },

  {
    id: "000-7",
    img: "/assets/home/brand_profile/brand_profile4.png",
    name: "tenshoppe",
    category: "Strategy, Experiemce Design & CX",
  },
];

const BrandProfile = () => {
  const [isWindow, setIsWindow] = useState(false);
  const [slideOffset, setSlideOffset] = useState(0);

  const brandSectionRef = useRef<HTMLDivElement>(null);

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
            duration: 2,
            delay: (index) => index * 0.01,
            ease: "power2.inOut",
          })
          .from(
            cardImages,
            {
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
      data-cursor-label="glide me"
      className="mt-20 mx-auto px-3 min-h-[435.75px]"
      aria-label="Featured brand collaborations and incubated fashion, beauty, and lifestyle startups by MOTIF®"
    >
      <h2 className="sr-only">
        Brand partnerships, incubated ventures, and creative collaborations with MOTIF® – a fashion marketing agency and beauty brand growth partner.
      </h2>

      <p className="sr-only">
        Explore featured brands incubated and grown by MOTIF® – a global brand growth partner, fashion marketing agency, luxury lifestyle branding firm, and beauty & skincare accelerator. These startups represent strategic collaborations in brand marketing, experience design, and commerce, across DTC and retail sectors.
      </p>


      <Swiper
        slidesPerView={"auto"}
        spaceBetween={10}
        pagination={false}
        scrollbar={{
          el: ".swiper-scrollbar",
          draggable: true,
          dragSize: 100,
        }}
        freeMode={true}
        loop={false}
        slidesOffsetBefore={slideOffset}
        modules={[FreeMode]}
        className="mySwiper flex flex-nowrap gap-2 text-typo-primary"
      >
        {brands.map((item) => (
          <SwiperSlide className="!w-auto !mr-4" key={item.id}>
            <div className="flex gap-0 brand-card">
              <div>
                <div className="w-auto md:w-auto h-[18rem] lg:h-auto lg:w-[24vw] xl:w-[22vw] hover:rounded-[5%] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.165, 0.84, 0.44, 1)]">
                  <Image
                    className="h-full w-auto brand-card-img"
                    src={item.img}
                    objectFit="contain"
                    width={800}
                    height={500}
                    alt= {`${item.name} – DTC & Retail brand incubated by MOTIF®, better than any agency`}
                  />
                </div>
                <div>
                  <h4 className="barnd_card_name uppercase font-clash text-[clamp(20px,calc(100vw/10),1.6rem)] font-semibold mt-[15px] lg:mt-[1.5vw] md:mb-[.2vw] leading-[1.3]">
                    {item.name}
                  </h4>
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
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default BrandProfile;
