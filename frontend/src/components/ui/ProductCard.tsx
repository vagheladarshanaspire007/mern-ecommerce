import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';
import type { Product } from '@/services/product.service';

import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

interface ProductCardProps {
  readonly product: Product;
}

const PRODUCT_LIST_SCROLL_KEY = 'product-list-scroll-position';

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isOutOfStock = product.stock <= 0;

  const handleProductClick = () => {
    sessionStorage.setItem(PRODUCT_LIST_SCROLL_KEY, String(window.scrollY));

    void navigate(`/products/${product.id}`);
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        stock: product.stock,
        imageUrl: product.imageUrls[0],
      })
    );
  };

  return (
    <Card hoverable className="flex h-full flex-col overflow-hidden">
      {/* Product Image */}
      <button
        type="button"
        onClick={handleProductClick}
        className="block w-full text-left"
        aria-label={`View ${product.name}`}
      >
        <div className="aspect-square overflow-hidden bg-gray-100">
          {product.imageUrls[0] ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
              No image available
            </div>
          )}
        </div>
      </button>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={handleProductClick}
          className="mb-2 text-left"
          aria-label={`View ${product.name}`}
        >
          <h3 className="line-clamp-2 text-base font-semibold text-gray-900 hover:underline">
            {product.name}
          </h3>
        </button>

        <div className="mb-2">
          <Badge variant={isOutOfStock ? 'danger' : 'success'}>
            {isOutOfStock ? 'Out of stock' : 'In stock'}
          </Badge>
        </div>

        {product.categoryName && (
          <p className="mb-2 text-sm text-gray-500">{product.categoryName}</p>
        )}

        <p className="mb-4 text-lg font-bold text-gray-900">₹{Number(product.price).toFixed(2)}</p>

        <Button
          variant="primary"
          size="sm"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          className="mt-auto w-full"
          type="button"
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </Card>
  );
}
