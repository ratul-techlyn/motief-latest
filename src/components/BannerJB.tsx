import { useAnimationComplete } from "@/context/AnimationContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";
import { useRef } from "react";
import TitleImgBannerJB from "./shared/TitleImgBannerJB";

const titleMixImgData = [
  [
    "BUILDING",
    "TOMORROW'S",
    "ICONIC",
    "BRANDS",
    "WITH",
    "A",
    "PROFIT-SHARE",
    "capsule", // for capsule
    "PARTNERSHIP",
    "IN",
    "rolling-text", // for rolling text
  ],
];

const BannerJB = () => {
  const refBox = useRef<HTMLDivElement>(null);
  const { hasLoadedAnimationFinished, hasPageTransitionFinished } =
    useAnimationComplete();

  useGSAP(
    () => {
      if (refBox.current) {
        const pera = refBox.current.querySelectorAll(".anm-hero-pera");
        const splitText = new SplitText(pera, { type: "words" });
        gsap.fromTo(
          splitText.words,
          {
            y: 100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            delay: 1,
            duration: 1,
            ease: "power3.out",
          }
        );
      }
    },
    {
      scope: refBox,
      dependencies: [hasLoadedAnimationFinished, hasPageTransitionFinished],
    }
  );

  return (
    <>
      {/* WEB  */}
      <section className="jb_banner_new hidden sm:block layout_normal pt-32 pb-[45px] md:pb-0 lg:pt-32 layout_normal px-2 w-[90%] md:w-[90%] lg:w-[70%]">
        <h2 className="sr-only">
          MOTIF®: Beyond the Agency Model for Fashion, Beauty & Lifestyle Brands
        </h2>
        <p className="sr-only">
          Most fashion, beauty, and lifestyle brands don’t need another
          marketing agency. They need a growth partner. MOTIF® replaces
          traditional agencies by incubating and accelerating DTC and retail
          brands — blending strategy, design, and commerce to build brands that
          last.
        </p>

        <div className="custom_jb_banner">
            <TitleImgBannerJB lines={titleMixImgData} description={[""]} width="100%" />
        </div>

        <div ref={refBox} className="mt-3">
          <p className="anm-hero-pera overflow-hidden font-helvetica text-hero_subtitle_sm sm:text-[16px] md:text-hero_subtitle_md lg:text-hero_subtitle_lg 2xl:text-hero_subtitle_2xl 3xl:text-[clamp(20px,30px,32px)] font-medium text-typo-mute">
            Once an advertising and branding agency, now a global incubator that
            builds, grows, and scales luxury lifestyle, fashion, and beauty
            brands through innovative strategies, human first approaches,
            powerful creatives & crazy ideas.
          </p>
          <p className="sr-only">
            MOTIF® is a global incubator and growth partner, not just a fashion marketing agency. It helps build and scale luxury lifestyle, fashion, and beauty brands by merging brand strategy, creative storytelling, and tech implementation. With a focus on brand equity, sustainable growth, and human-first marketing, MOTIF® transforms early-stage and emerging brands into icons.
          </p>

        </div>
      </section>
      
    </>
  );
};

export default BannerJB;
