import ExplosionContainer from "@/components/shared/ExplosionContainer";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import React, { useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { useIsMobile } from "@/hooks/use-mobile";

const footers = [
  {
    name: "EXPLORE",
    className: "order-2 md:order-none",
    list: [
      {
        title: "WHAT WE DO",
        url: "/what-we-do",
      },
      {
        title: "HOW WE DO",
        url: "/the-motif-process",
      },
      {
        title: "WHY US",
        url: "/why-motif",
      },
      {
        title: "ABOUT",
        url: "/about",
      },
      {
        title: "PULSEB2B",
        url: "/pulse-b2b-ecommerce-agency",
      },
      {
        title: "CONTACT",
        url: "/contact",
      },
    ],
  },
  {
    name: "SPECIALIZED",
    className: "order-1 md:order-none",
    list: [
      {
        title: "LUXURY",
        url: "/luxury-lifestyle-advertising-branding-agency-nyc-la-sf",
      },
      {
        title: "FASHION",
        url: "/fashion-agency",
      },
      {
        title: "BEAUTY",
        url: "/beauty-brand-marketing-advertising-agency",
      },
      {
        title: "DTC",
        url: "/not-a-dtc-agency",
      },
      {
        title: "SHOPIFY PLUS",
        url: "/better-than-shopify-platinum-partner",
      },
      {
        title: "BIGCOMMERCE",
        url: "/the-only-bigcommerce-elite-partner-an-incubator",
      },
    ],
  },
  {
    name: "REGIONS",
    className: "order-3 md:order-none",
    list: [
      {
        title: "LOS ANGELES — LA",
        url: "#", // URL not specified in the provided data
      },
      {
        title: "NEW YORK — NY",
        url: "#", // URL not specified in the provided data
      },
      {
        title: "SAN FRANCISCO — SF",
        url: "#", // URL not specified in the provided data
      },
      {
        title: "DUBAI — UAE",
        url: "#", // URL not specified in the provided data
      },
      {
        title: "DELHI — INDIA",
        url: "#", // URL not specified in the provided data
      },
    ],
  },
];

const motto = ["Connecting", "Brands with", "People and", "culture."];

const Footer = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const isMobile = useIsMobile();

  useGSAP(() => {
    if (footerRef.current) {
      const menus = footerRef.current.querySelectorAll(".footer_menus li a");

      const cleanups: (() => void)[] = [];

      menus.forEach((menu, index) => {
        const currentMenu = menu as HTMLElement;

        const split = new SplitText(currentMenu, {
          type: "lines, chars",
        });

        const enter = () => {
          gsap.to(split.chars, {
            color: "#ed5f09",
            duration: 0.3,
            stagger: 0.02,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        const leave = () => {
          gsap.to(split.chars, {
            color: "rgb(132, 132, 132)",
            duration: 0.3,
            stagger: 0.02,
            ease: "power2.out",
            overwrite: "auto",
          });
        };
        currentMenu.addEventListener("mouseenter", enter);
        currentMenu.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          currentMenu.removeEventListener("mouseenter", enter);
          currentMenu.removeEventListener("mouseleave", leave);
          gsap.killTweensOf(split.chars);
        });
      });

      return () => cleanups.forEach((fn) => fn());
    }
  });
  return (
    <footer
      ref={footerRef}
      className="footer layout_normal pt-[8%] w-[90%] md:w-[90%] lg:w-[70%]"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[420px_1fr]">
        <div className="order-1 lg:order-none grid grid-cols-2  justify-between w-full">
          <ul className="column-span-1 hidden xs:block lg:hidden">
            <li className={footers[2].className} key={footers[2].name}>
              <h4 className="text-[1rem] leading-[1]  font-clash font-[600] text-typo-primary">
                {footers[2].name}
              </h4>
              <ul className="mt-4 footer_menus">
                {footers[2].list.map((navEl) => (
                  <li
                    className="pt-[10px] text-[14px] leading-[1rem] font-helvetica font-normal"
                    key={navEl.title}
                  >
                    <Link
                      className="text-[14px] leading-[1rem] font-helvetica font-normal"
                      href={navEl.url}
                    >
                      {navEl.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          <div className="column-span-1">
            {motto.map((el) => (
              <h2
                className="capitalize font-semibold  font-clash text-[1.5em] md:text-[26px] leading-[1.1] text-typo-mute_deep"
                key={el}
              >
                {el}
              </h2>
            ))}
          </div>
        </div>

        <div className="pb-[8%]">
          <ul className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-12 xl:gap-4 lg:[&>li]:w-[180px] xl:[&>li]:w-[220px]">
            {footers.map((item, index) => (
              <li
                className={`${item.className} ${
                  index === 2 ? "block xs:hidden lg:block" : ""
                }`}
                key={item.name}
              >
                <h4 className="text-[1rem] leading-[1]  font-clash font-[600] text-typo-primary">
                  {item.name}
                </h4>
                <ul className="mt-4 footer_menus">
                  {item.list.map((navEl) => (
                    <li
                      className="pt-[10px] text-[14px] leading-[1rem] font-helvetica font-normal"
                      key={navEl.title}
                    >
                      <Link
                        className="text-[14px] leading-[1rem] font-helvetica font-normal"
                        href={navEl.url}
                      >
                        {navEl.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div></div>
      <div className="mt-[10%] pb-4 sm:flex justify-between">
        <div className="text-[10px] font-helvetica font-semibold text-[#4F4F4F]">
          MOTIF® Digital, INC {new Date().getFullYear()} ©
        </div>
        <div className="text-[12px] font-helvetica font-semibold text-[#4F4F4F]">
          STRATEGY, COMMERCE, EXPERT™
        </div>
        <div className="text-[10px] font-helvetica font-semibold text-[#4F4F4F]">
          TERMS PRIVACY POLICY
        </div>
      </div>
      {!isMobile && (
        <ExplosionContainer
          footerRef={footerRef as React.RefObject<HTMLElement>}
        />
      )}
    </footer>
  );
};

export default Footer;
