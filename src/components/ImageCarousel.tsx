import React, { useState, useEffect } from "react";

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [current, setCurrent] = useState(0);
  const length = images.length;

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [length]);

  const nextSlide = () => {
    setCurrent(current === length - 1 ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrent(current === 0 ? length - 1 : current - 1);
  };

  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  // Animation state
  const [fade, setFade] = useState(true);
  useEffect(() => {
    setFade(false);
    const timeout = setTimeout(() => setFade(true), 100);
    return () => clearTimeout(timeout);
  }, [current]);

  return (
    <div className="relative w-full h-72 flex items-center justify-center">
      <button
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-primary-700 text-white rounded-full p-2 shadow hover:bg-primary-800 z-10"
        onClick={prevSlide}
        aria-label="Previous image"
      >
        &#8592;
      </button>
      <img
        src={images[current]}
        alt={`Venue image ${current + 1}`}
        className={`w-full h-72 object-cover rounded-xl shadow-lg transition-opacity duration-700 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      />
      <button
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary-700 text-white rounded-full p-2 shadow hover:bg-primary-800 z-10"
        onClick={nextSlide}
        aria-label="Next image"
      >
        &#8594;
      </button>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`w-3 h-3 rounded-full bg-primary-300 ${
              current === idx ? "bg-primary-700" : "opacity-50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel;
