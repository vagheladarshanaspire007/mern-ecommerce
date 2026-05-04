import { useState } from 'react';
import clsx from 'clsx';
import type { ProductImage } from '@/types/auth.types';
import { DEFAULT_IMAGE_PLACEHOLDER, resolveImageUrl } from '@/utils/resolveImageUrl';

interface ImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

const fallbackImage: ProductImage = {
  id: 'fallback-image',
  url: 'https://placehold.co/1200x900/e5e7eb/6b7280?text=No+Image',
  alt: 'Product image unavailable',
};

export function ImageGallery({ images, productName }: Readonly<ImageGalleryProps>) {
  const galleryImages =
    images.length > 0 ? images : [{ ...fallbackImage, alt: `${productName} image unavailable` }];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = galleryImages[selectedIndex] ?? galleryImages[0];

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-gray-700 bg-gray-800 shadow-md">
        <img
          key={selectedImage.id}
          src={resolveImageUrl(selectedImage.url)}
          alt={selectedImage.alt ?? `${productName} image ${selectedIndex + 1}`}
          loading="lazy"
          width={1200}
          height={900}
          className="h-105 w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = DEFAULT_IMAGE_PLACEHOLDER;
          }}
        />
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {galleryImages.map((image, index) => (
          <button
            key={image.id ?? `${image.url}-${index}`}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={clsx(
              'overflow-hidden rounded-2xl border bg-gray-800 transition focus:outline-none focus:ring-2 focus:ring-indigo-500',
              index === selectedIndex
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-gray-700 hover:border-indigo-500/60'
            )}
            aria-label={`Show image ${index + 1} of ${productName}`}
            aria-pressed={index === selectedIndex}
          >
            <img
              src={resolveImageUrl(image.url)}
              alt={image.alt ?? `${productName} thumbnail ${index + 1}`}
              loading="lazy"
              width={160}
              height={80}
              className="h-20 w-full object-cover"
              onError={(event) => {
                event.currentTarget.src = DEFAULT_IMAGE_PLACEHOLDER;
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ImageGallery;
