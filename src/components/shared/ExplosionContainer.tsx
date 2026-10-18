"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";

interface Config {
  gravity: number;
  friction: number;
  imageSize: number;
  horizontalForce: number;
  verticalForce: number;
  rotationSpeed: number;
  delay: number;
}

const ExplosionContainer: React.FC<{
  footerRef: React.RefObject<HTMLElement>;
}> = ({ footerRef }) => {
  const explosionContainerRef = useRef<HTMLDivElement>(null);
  const [explosionTriggered, setExplosionTriggered] = useState<boolean>(false);
  const [isFooterInViewport, setIsFooterInViewport] = useState<boolean>(false);
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef(0);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const config: Config = {
    gravity: 0.25,
    friction: 0.99,
    imageSize: 150,
    horizontalForce: 30,
    verticalForce: 15,
    rotationSpeed: 10,
    delay: 1000,
  };

  const imageParticleCount: number = 15;
  const imagePaths: string[] = Array.from(
    { length: imageParticleCount },
    (_, i) => `/assets/footerexplo/img${i + 1}.jpg`
  );

  class Particle {
    element: HTMLImageElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;

    constructor(element: HTMLImageElement) {
      this.element = element;
      this.x = 0;
      this.y = 0;
      this.vx = (Math.random() - 0.5) * config.horizontalForce;
      this.vy = -config.verticalForce - Math.random() * 10;
      this.rotation = 0;
      this.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed;
    }

    update(): void {
      this.vy += config.gravity;
      this.vx *= config.friction;
      this.vy *= config.friction;
      this.rotationSpeed *= config.friction;

      this.x += this.vx;
      this.y += this.vy;
      this.rotation += this.rotationSpeed;

      if (this.element) {
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
      }
    }
  }

  const createParticles = (): void => {
    if (!explosionContainerRef.current) return;

    explosionContainerRef.current.innerHTML = "";
    particlesRef.current = [];

    imagePaths.forEach((path) => {
      const particle = document.createElement("img");
      particle.src = path;
      particle.classList.add("explosion-particle-img");
      particle.style.width = `${config.imageSize}px`;
      explosionContainerRef.current!.appendChild(particle);
    });

    const particleElements =
      explosionContainerRef.current.querySelectorAll<HTMLImageElement>(
        ".explosion-particle-img"
      );
    particlesRef.current = Array.from(particleElements).map(
      (element) => new Particle(element)
    );
  };

  const explode = (): void => {
    if (explosionTriggered) return;

    setExplosionTriggered(true);

    createParticles();

    let finished = false;

    const animate = (): void => {
      if (finished) return;

      particlesRef.current.forEach((particle) => particle.update());

      if (
        explosionContainerRef.current &&
        particlesRef.current.every(
          (particle) =>
            particle.y > explosionContainerRef.current!.offsetHeight / 2
        )
      ) {
        cancelAnimationFrame(frameRef.current);
        finished = true;
        resetTimerRef.current = setTimeout(() => {
          setExplosionTriggered(false);
        }, 2000);
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (explosionContainerRef.current) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "footer",
            start: "top 80%",
            end: "top 20%",
            // toggleActions: "play none none reverse",
            // markers: true,
            onEnter: () => {
              const is_exploded = localStorage.getItem("is_exploded");
              if (!is_exploded) {
                explode();
                localStorage.setItem("is_exploded", "true");
              }
            },
          },
        });
      }
    });
    return () => {
      ctx.revert();
      // Stop a running explosion loop / pending reset if the footer unmounts mid-animation
      cancelAnimationFrame(frameRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [explosionContainerRef]);

  return (
    <div ref={explosionContainerRef} className="explosion-container"></div>
  );
};

export default ExplosionContainer;
