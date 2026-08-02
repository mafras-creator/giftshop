"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Slide = {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string | null;
  title?: string | null;
  subtitle?: string | null;
  buttonText?: string | null;
  linkUrl?: string | null;
};

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  if (slides.length === 0) return null;

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(index);
  }

  // Keep the active dot correct if the browser window is resized
  useEffect(() => {
    function onResize() {
      scrollToIndex(active);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative rounded-card overflow-hidden">
      {/* Scrollable track - swipe with a finger on mobile, drag or use arrows on desktop */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative shrink-0 w-full snap-start min-h-[220px] md:min-h-[340px]"
          >
            {/* Desktop image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageUrl}
              alt={slide.title ?? ""}
              className="hidden md:block w-full h-full object-cover absolute inset-0"
              draggable={false}
            />
            {/* Mobile image (falls back to desktop image if none set) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.mobileImageUrl || slide.imageUrl}
              alt={slide.title ?? ""}
              className="block md:hidden w-full h-full object-cover absolute inset-0"
              draggable={false}
            />

            {(slide.title || slide.subtitle || slide.buttonText) && (
              <div className="absolute inset-0 flex items-center px-6 md:px-14">
                <div className="text-white max-w-md drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]">
                  {slide.title && (
                    <h2 className="text-2xl md:text-4xl font-bold leading-tight mb-2">
                      {slide.title}
                    </h2>
                  )}
                  {slide.subtitle && (
                    <p className="text-white/90 text-sm md:text-base mb-4">{slide.subtitle}</p>
                  )}
                  {slide.buttonText && (
                    <Link
                      href={slide.linkUrl || "/shop"}
                      className="inline-block bg-accent-500 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-semibold text-sm md:text-base hover:bg-accent-600 transition shadow-soft-lg"
                    >
                      {slide.buttonText}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          {/* Desktop-only manual scroll arrows */}
          <button
            aria-label="Previous slide"
            onClick={() => scrollToIndex(active - 1)}
            disabled={active === 0}
            className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-[2] w-9 h-9 items-center justify-center rounded-full bg-white/85 hover:bg-white text-gray-700 shadow disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            aria-label="Next slide"
            onClick={() => scrollToIndex(active + 1)}
            disabled={active === slides.length - 1}
            className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-[2] w-9 h-9 items-center justify-center rounded-full bg-white/85 hover:bg-white text-gray-700 shadow disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots - tap to jump directly to a slide, on any device */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[2] flex gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === active ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
