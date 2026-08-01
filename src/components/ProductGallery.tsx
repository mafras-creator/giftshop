"use client";

import { useState } from "react";

export default function ProductGallery({
  images,
  productName,
}: {
  images: { id: string; url: string }[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return <div className="aspect-square bg-gray-100 rounded-lg" />;
  }

  return (
    <div>
      {/* Main large image */}
      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[activeIndex].url}
          alt={`${productName} - image ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Small thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 mt-4">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                index === activeIndex
                  ? "border-brand-600"
                  : "border-transparent hover:border-gray-300"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
