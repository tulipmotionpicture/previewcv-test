"use client";

import { ReactNode, useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";

type CardSliderProps = {
  children: ReactNode[];
  breackpoints?: {
    [key: number]: {
      slidesPerView: number;
      centeredSlides?: boolean;
      centeredSlidesBounds?: boolean;
      initialSlide?: number;
    };
  };
};

export default function CardSlider({
  children,
  breackpoints,
}: CardSliderProps) {
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  // Trigger re-render once refs are available
  const [swiperReady, setSwiperReady] = useState(false);

  useEffect(() => {
    setSwiperReady(true);
  }, []);

  return (
    <div className="relative w-full">
      {swiperReady && (
        <Swiper
          modules={[Navigation, Autoplay]}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            // @ts-expect-error incorrect type definition from library
            swiper.params.navigation.prevEl = prevRef.current;
            // @ts-expect-error incorrect type definition from library
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          spaceBetween={20}
          breakpoints={
            breackpoints || {
              0: {
                slidesPerView: 1.2,
                centeredSlides: true,
                centeredSlidesBounds: true,
                initialSlide: 1,
              },
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }
          }
          className="!pb-16"
        >
          {children.map((child, i) => (
            <SwiperSlide key={i} className="!h-auto flex">
              <div className="w-full flex-grow h-full flex">{child}</div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Bottom-right custom nav */}
      <div className="absolute right-4 bottom-0 flex gap-6 z-10">
        <button
          ref={prevRef}
          className="p-2 bg-white hover:bg-muted/80 rounded-full shadow scale"
        >
          <ChevronLeft className="h-6 w-6 text-primary" />
        </button>
        <button
          ref={nextRef}
          className="p-2 bg-white hover:bg-muted/80 rounded-full shadow scale"
        >
          <ChevronRight className="h-6 w-6 text-primary" />
        </button>
      </div>
    </div>
  );
}
