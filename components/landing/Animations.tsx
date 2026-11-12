"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Subtle motion for the landing page. Renders nothing; it targets data attributes:
 *
 *   data-hero        hero text blocks, staggered on load
 *   data-hero-image  hero arch, scales in
 *   data-hero-badge  hero badge, fades in (opacity only: it uses a CSS transform for centring)
 *   data-reveal      fades up when scrolled into view
 *   data-stagger     children fade up one after another when scrolled into view
 *   data-arch-img    image eases from a slight zoom when scrolled into view
 *
 * Skipped entirely when the visitor prefers reduced motion.
 */
export function Animations() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const ease = "power3.out";
      const trigger = (el: Element, start = "top 88%") => ({
        trigger: el,
        start,
        once: true,
      });

      // Hero entrance
      gsap.from("[data-hero]", {
        y: 28,
        opacity: 0,
        duration: 0.9,
        ease,
        stagger: 0.12,
        clearProps: "transform,opacity",
      });
      gsap.from("[data-hero-image]", {
        y: 40,
        opacity: 0,
        scale: 0.96,
        duration: 1.2,
        ease,
        delay: 0.15,
        clearProps: "transform,opacity",
      });
      gsap.from("[data-hero-badge]", {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.9,
        clearProps: "opacity",
      });

      // Scroll reveals
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 32,
          opacity: 0,
          duration: 0.9,
          ease,
          clearProps: "transform,opacity",
          scrollTrigger: trigger(el),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((parent) => {
        gsap.from(Array.from(parent.children), {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease,
          stagger: 0.12,
          clearProps: "transform,opacity",
          scrollTrigger: trigger(parent, "top 85%"),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-arch-img]").forEach((img) => {
        gsap.from(img, {
          scale: 1.15,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: trigger(img, "top 90%"),
        });
      });
    });

    return () => mm.revert();
  }, []);

  return null;
}
