"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { LuArrowUpRight } from "react-icons/lu";
import { TfiClose } from "react-icons/tfi";
import BrandLogo from "./BrandLogo";

const TopBar = () => {
  const [isOpen, setIsClose] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstMenuItemRef = useRef<HTMLAnchorElement>(null);

  const handleOpen = () => {
    setIsClose(!isOpen);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && isOpen) {
      setIsClose(false);
      menuButtonRef.current?.focus();
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!isScrolling) {
        setIsScrolling(true);
      }

      if (scrollY > 0) {
        setIsScrolling(true);
        setOpacity(0);
      } else {
        setIsScrolling(false);
        setOpacity(1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isScrolling]);

  useEffect(() => {
    const timeline = gsap.timeline({
      defaults: {
        opacity: 0,
        ease: "power2.out",
      },
    });
    // Per-open resources, released when the menu closes so they don't pile up on every open
    const splits: SplitText[] = [];
    const hoverHandlers: { el: HTMLElement; enter: () => void; leave: () => void }[] = [];
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const menus = gsap.utils.toArray("#top-bar .nav-menu a");

      timeline
        .to("#top-bar", {
          opacity: 1,
          duration: 0.3,
          ease: "power2.out",
        })
        .from("#top-bar .lets-talk-div", {
          y: 20,
          opacity: 0,
          duration: 0.3,
          delay: 0.5,
          ease: "power2.out",
        })
        .from("#top-bar .contact-menus li div", {
          x: 20,
          opacity: 0,
          duration: 0.3,
          stagger: 0.02,
          ease: "power2.out",
        })
        .from(
          "#top-bar .nav-image",
          {
            y: 20,
            scale: 0.8,
            opacity: 0,
            duration: 0.3,
            ease: "power2.out",
          },
          "<"
        )
        .from("#top-bar .navbar-image-bottom", {
          y: 20,
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });

      menus.forEach((menu, index) => {
        const currentMenu = menu as HTMLElement;

        const split = new SplitText(currentMenu, {
          type: "lines, chars",
        });
        splits.push(split);

        timeline.from(
          split.lines,
          {
            y: 20,
            opacity: 0,
            duration: 1,
            delay: 0.1 + index * 0.05,
            ease: "power2.out",
          },
          "1"
        );

        const enter = () => {
          gsap.to(split.chars, {
            color: "#ed5f09",
            duration: 0.3,
            stagger: 0.02,
            ease: "power2.out",
          });
        };
        const leave = () => {
          gsap.to(split.chars, {
            color: "#FFF",
            duration: 0.3,
            stagger: 0.02,
            ease: "power2.out",
          });
        };
        currentMenu.addEventListener("mouseenter", enter);
        currentMenu.addEventListener("mouseleave", leave);
        hoverHandlers.push({ el: currentMenu, enter, leave });
      });
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      // Finish (not abort) the intro so no element is left half-faded for the next open
      timeline.progress(1).kill();
      hoverHandlers.forEach(({ el, enter, leave }) => {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("mouseleave", leave);
      });
      splits.forEach((split) => {
        gsap.killTweensOf(split.chars);
        split.revert();
      });
    };
  }, [isOpen]);

  return (
    <div
      id="top-bar"
      className={cn(
        "sticky top-0 z-30 mx-auto py-4 transition-all",
        isScrolling && !isOpen
          ? "bg-[rgba(46, 39, 39, 0.45] shadow-[0 4px 30px rgba(0, 0, 0, 0.1)]  backdrop-blur-[6.7px] border-[1px solid rgba(46, 39, 39, 0.3)]"
          : "bg-primary"
      )}
    >
      <nav className="w-[90%] md:w-[90%] lg:w-[70%] layout_normal flex items-center justify-between gap-x-5 px-2">
        <BrandLogo
          className="w-1/3 justify-start"
          brandIconClass="w-[35px] h-[20px] md:w-[30px] md:h-[20px] shrink-0 flex items-center"
          brandClass={cn(`h-[20px] md:h-[20px] shrink-0 flex items-center transition-all duration-700 opacity-[${opacity}] ${opacity === 1 ? 'w-[60px] md:w-[70px]' : 'w-[0px]'}`)}
          brandStyle={{ opacity }}
        />
        
        <div className="w-1/3 flex justify-center">
          <time
            className="text-para4 font-clash font-semibold"
            style={{ color: "#54595F" }}
          >
            EST - 2015
          </time>
        </div>
        <div className="w-1/3 flex justify-end">
          <button
            ref={menuButtonRef}
            className="cursor-pointer w-[40px] h-[15px] md:w-[120px] md:h-[30px] flex items-center justify-end focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            onClick={handleOpen}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOpen();
              }
            }}
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isOpen}
            aria-controls="navigation-menu"
            role="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="15"
              viewBox="0 0 50 15"
              fill="none"
              className="w-full max-w-[50px]"
              aria-hidden="true"
            >
              <path
                id="top-line"
                d="M49.09 1.09003H0"
                stroke="white"
                strokeWidth="2"
                strokeMiterlimit="10"
                className={cn(
                  "transition-transform origin-center duration-300 ease-in-out",
                  isOpen ? "rotate-45 translate-y-[6px]" : ""
                )}
              />
              <path
                id="bottom-line"
                d="M49.09 13.1801H15.26"
                stroke="white"
                strokeWidth="2"
                strokeMiterlimit="10"
                className={cn(
                  "transition-transform origin-center duration-300 ease-in-out",
                  isOpen ? "-rotate-45 -translate-y-[6px]" : ""
                )}
              />
            </svg>
          </button>
        </div>
      </nav>
      <nav
        id="navigation-menu"
        className={cn(
          "fixed left-0 top-0 bottom-0 z-20 pxX-[6%] w-full h-screen bg-[rgb(0 0 0 / 52%)]  backdrop-blur-[25px] transition-all duration-1000 ease-in-out",
          `] ${
            isOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible translate-y-[-100%]"
          }`
        )}
        role="navigation"
        aria-label="Main navigation"
        onKeyDown={handleKeyDown}
      >
        <div
          className={`w-full h-full absolute top-0 left-0 bg-[url("/assets/mask_bg/bg_mask.png")] z-[-1] opacity-[0.5]`}
        ></div>
        <div className="scrollable-overlay  min-h-screen px-[6%] md:px-0 py-[2%] md:py-0">
          <div className="flex flex-col md:flex-row  text-typo-primary ">
            <aside className="flex flex-col pt-[10%] w-[100%] md:w-[45%] md:min-h-screen border-b-[0.5px] md:border-b-0 md:border-r-[0.5px] border-mute flex-grow pb-4 lg:pb-0">
              <div className="w-full md:w-[70%] lg:w-[55%] xl:w-[55%] md:ml-[15%] lg:ml-[35%]">
                <div>
                  <Button
                    className="lets-talk-div w-[30%] h-[1.5rem] rounded-full px-10  hover:bg-btn_hvr hover:text-typo-primary hover:border-[1px] hover:border-solid hover:border-[#ed5f09]"
                    variant={"outline"}
                  >
                    Let&lsquo;s Talk
                  </Button>
                </div>
                <ul className="flex justify-between gap-2 mt-10 contact-menus">
                  <li>
                    <div className="uppercase text-[0.7rem] md:text-[calc(100vw/80)]  lg:text-[calc(100vw/100)] xl:text-[calc(50vw/60)] font-helvetica font-normal ">
                      Phone
                    </div>
                    <div className="text-[0.7rem] md:text-[calc(100vw/60)] lg:text-[calc(100vw/60)] xl:text-[calc(50vw/50)] font-semibold font-helvetica mt-[0.9rem]">
                      +1 (415)-800-2326
                    </div>
                  </li>
                  <li>
                    <div className="uppercase text-[0.7rem] md:text-[calc(100vw/60)] lg:text-[calc(100vw/100)] xl:text-[calc(50vw/60)] font-helvetica font-normal ">
                      Email
                    </div>
                    <div className="text-[0.7rem] md:text-[calc(100vw/60)] lg:text-[calc(100vw/60)] xl:text-[calc(50vw/50)] font-semibold font-helvetica mt-[0.9rem]">
                      hey@wemotif.com
                    </div>
                  </li>
                  <li>
                    <div className="uppercase text-[0.7rem] md:text-[calc(100vw/60)] lg:text-[calc(100vw/100)] xl:text-[calc(50vw/60)] font-helvetica font-normalercase ">
                      Learn
                    </div>
                    <div className="mt-2">
                      <LuArrowUpRight
                        className="xl:w-[calc(50vw/20)] xl:h-[calc(50vw/25)]"
                        size={40}
                      />
                    </div>
                  </li>
                </ul>
                <div className="hidden nav-image md:block w-full mt-[16%]">
                  <Image
                    className=""
                    layout="responsive"
                    src={"/assets/common/navbar/Left-side-card.png"}
                    width={900}
                    height={500}
                    alt=""
                  />
                </div>
              </div>
            </aside>
            <aside className="flex flex-col pt-[10%] w-[100%] md:w-[60%]">
              <div className="md:pl-16 md:pr-[2vw]">
                <div className="md:relativeX">
                  <button
                    className="absolute z-[1] top-[6%] right-[3%] md:top-3 md:right-6 lg:top-[15%] lg:right-[16%] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    onClick={handleOpen}
                    aria-label="Close navigation menu"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpen();
                      }
                    }}
                  >
                    <TfiClose
                      className="text-typo-primary w-[40%] md:w-[2vw] h-[2.5rem]"
                      size={50}
                      aria-hidden="true"
                    />
                  </button>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 lg:relative">
                    <div
                      className={`flex items-center gap-3 w-[8rem] h-[3rem]`}
                    >
                      <div className="w-full h-full">
                        <Link href="/" onClick={handleOpen}>
                          <Image
                            className="w-full"
                            layout="intrinsic"
                            src={"/assets/logo/logo.png"}
                            width={100}
                            height={100}
                            alt=""
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                <nav className="nav-menu mt-[7%]" role="navigation" aria-label="Main menu">
                  <Link
                    ref={firstMenuItemRef}
                    className="text-[2.5rem] lg:text-[2rem] xl:text-[3.5rem] font-clash cursor-pointer text-typo-primary overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black block"
                    href={"/what-we-do"}
                    onClick={handleOpen}
                  >
                    What We Do
                  </Link>
                  <Link
                    className="text-[2.5rem] lg:text-[2rem] xl:text-[3.5rem] font-clash cursor-pointer text-typo-primary overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black block"
                    href={"/the-motif-process"}
                    onClick={handleOpen}
                  >
                    How We Do
                  </Link>
                  <Link
                    className="text-[2.5rem] jb_c_menu flex items-start lg:text-[2rem] xl:text-[3.5rem] font-clash cursor-pointer text-typo-primary overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                    href={"/why-motif"}
                    onClick={handleOpen}
                  >
                    Why <span className="font-bold">MOTIF</span>{" "}?
                  </Link>
                  <Link
                    className="text-[2.5rem] lg:text-[2rem] xl:text-[3.5rem] font-clash cursor-pointer text-typo-primary overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black block"
                    href={"/about"}
                    onClick={handleOpen}
                  >
                    About
                  </Link>
                  <Link
                    className="text-[2.5rem] lg:text-[2rem] xl:text-[3.5rem] font-clash cursor-pointer text-typo-primary overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black block"
                    href={"/contact"}
                    onClick={handleOpen}
                  >
                    Contact
                  </Link>
                  <div className="w-full navbar-image-bottom h-[100px] md:hidden overflow-hidden border-[0.5px] border-[#54595F] rounded-lg mt-10">
                    <Image
                      className="object-cover object-center w-full h-full"
                      src={"/assets/nav/nav_img.jpeg"}
                      width={500}
                      height={500}
                      alt=""
                    />
                  </div>
                </nav>
              </div>
            </aside>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default TopBar;
