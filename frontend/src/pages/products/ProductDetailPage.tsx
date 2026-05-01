import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, ShoppingCart } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ImageGallery } from '@/components/ui/ImageGallery';
import { PageLoader } from '@/components/ui/PageLoader';
import { ReviewList } from '@/components/ui/ReviewList';
import { StarRating } from '@/components/ui/StarRating';
import { productService } from '@/services/product.service';
import { useAppDispatch } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';

function StockBadge({ stock }: Readonly<{ stock: number }>) {
  let badgeClass;
  let label;
  if (stock > 10) {
    badgeClass = 'bg-emerald-500/15 text-emerald-300';
    label = 'In stock';
  } else if (stock > 0) {
    badgeClass = 'bg-amber-500/15 text-amber-300';
    label = `Low stock: ${stock} left`;
  } else {
    badgeClass = 'bg-rose-500/15 text-rose-300';
    label = 'Out of stock';
  }

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${badgeClass}`}>
      {label}
    </span>
  );
}

export default function ProductDetailPage() {
  const { id = '' } = useParams();
  const dispatch = useAppDispatch();

  const {
    data: product,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProductById(id),
    enabled: Boolean(id),
  });
  useEffect(() => {
    document.title = product
      ? `${product.name} | MERN E-Commerce`
      : 'Product Details | MERN E-Commerce';
  }, [product]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !product) {
    return (
      <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-8 text-center">
        <h1 className="text-2xl font-semibold text-rose-100">
          We couldn&apos;t load this product.
        </h1>
        <p className="mt-3 text-sm text-rose-200">
          {error instanceof Error ? error.message : 'Please try again.'}
        </p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-rose-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-rose-400"
        >
          Back to products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-10 bg-gray-900 px-4 py-6">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 text-sm text-gray-400"
      >
        <Link to="/" className="transition hover:text-gray-100">
          Home
        </Link>
        <ChevronRight size={16} aria-hidden="true" />
        <Link to="/products" className="transition hover:text-gray-100">
          Products
        </Link>
        <ChevronRight size={16} aria-hidden="true" />
        <span className="text-white">{product.name}</span>
      </nav>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <ImageGallery images={product.images} productName={product.name} />

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StockBadge stock={product.stock} />
              {product.category?.name && (
                <span className="inline-flex rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-200">
                  {product.category.name}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">{product.name}</h1>
              <p className="mt-3 text-3xl font-bold text-white">${product.price.toFixed(2)}</p>
            </div>
            <StarRating rating={product.averageRating} reviewCount={product.reviewCount} />
          </div>

          <div className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-md">
            <h2 className="text-lg font-semibold text-white">Description</h2>
            <p className="mt-3 text-sm leading-7 text-gray-300">
              {product.description || 'No description available.'}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              dispatch(
                addToCart({
                  productId: product.id,
                  name: product.name,
                  price: product.price,
                  stock: product.stock,
                  imageUrl: product.images[0]?.url,
                })
              )
            }
            disabled={product.stock <= 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-6 py-3 text-base font-medium text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:bg-gray-600"
          >
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </section>

      <ReviewList reviews={product.reviews} />
    </div>
  );
}
