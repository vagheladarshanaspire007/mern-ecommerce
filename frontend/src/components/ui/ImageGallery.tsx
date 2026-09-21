import { useState } from 'react';

interface ImageGalleryProps {
  readonly images: string[];
  readonly productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const hasImages = images.length > 0;
  const selectedImage = images[selectedIndex];

  if (!hasImages) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border bg-gray-100">
        <span className="text-sm text-gray-500">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border bg-white">
        <img
          src={selectedImage}
          alt={`${productName} ${selectedIndex + 1}`}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={`View ${productName} image ${index + 1}`}
              aria-current={selectedIndex === index}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 bg-white ${
                selectedIndex === index ? 'border-black' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
