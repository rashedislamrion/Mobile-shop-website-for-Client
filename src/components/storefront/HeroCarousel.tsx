"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockSlides = [
  { id: 1, image: "https://placehold.co/1200x400/059669/ffffff?text=Mega+Sale:+Up+to+50%+Off", alt: "Mega Sale" },
  { id: 2, image: "https://placehold.co/1200x400/0f172a/ffffff?text=New+Arrivals:+Original+Displays", alt: "New Arrivals" },
  { id: 3, image: "https://placehold.co/1200x400/dc2626/ffffff?text=Free+Shipping+on+Orders+Over+৳5000", alt: "Free Shipping" },
];

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mockSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % mockSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + mockSlides.length) % mockSlides.length);

  return (
    <div className="relative w-full aspect-[21/9] md:aspect-[3/1] rounded-2xl overflow-hidden group">
      {/* Slides */}
      <div 
        className="flex w-full h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {mockSlides.map((slide) => (
          <div key={slide.id} className="w-full h-full shrink-0 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button 
        variant="secondary" 
        size="icon" 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white text-slate-800 rounded-full w-10 h-10 shadow-sm"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>
      <Button 
        variant="secondary" 
        size="icon" 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white text-slate-800 rounded-full w-10 h-10 shadow-sm"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {mockSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${currentSlide === index ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
