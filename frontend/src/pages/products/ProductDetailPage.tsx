import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { ImageGallery } from '@/components/ui/ImageGallery';
import { StarRating } from '@/components/ui/StarRating';
import { ProductReview, ReviewList } from '@/components/ui/ReviewList';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/PageLoader';
import { productService, type Product } from '@/services/product.service';
import { addToCart } from '@/store/slices/cartSlice';
import { useAppDispatch } from '@/store';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await productService.getProduct(id);
        setProduct(data);
      } catch {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

  useEffect(() => {
    if (!product) {
      return;
    }

    const loadReviews = async () => {
      try {
        setReviewsLoading(true);

        const data = await productService.getProductReviews(product.id, 1);

        setReviews(data.reviews);
        setHasMoreReviews(data.hasMore);
        setReviewPage(1);
      } catch {
        toast.error('Failed to load reviews');
        setReviews([]);
        setHasMoreReviews(false);
      } finally {
        setReviewsLoading(false);
      }
    };

    void loadReviews();
  }, [product]);

  const handleAddToCart = () => {
    if (!product) {
      return;
    }

    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: product.imageUrls[0],
      })
    );

    toast.success('Product added to cart');
  };

  const handleLoadMoreReviews = async () => {
    if (!product || reviewsLoading) {
      return;
    }

    try {
      setReviewsLoading(true);

      const nextPage = reviewPage + 1;
      const data = await productService.getProductReviews(product.id, nextPage);

      setReviews((currentReviews) => [...currentReviews, ...data.reviews]);

      setReviewPage(nextPage);
      setHasMoreReviews(data.hasMore);
    } catch {
      toast.error('Failed to load more reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-lg border p-8 text-center">
          <h1 className="text-xl font-semibold">Product not found</h1>
          <Link to="/products" className="mt-4 inline-block text-sm underline">
            Back to products
          </Link>
        </div>
      </main>
    );
  }

  const averageRating = product.averageRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;
  const isInStock = product.stock > 0;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-gray-500">
          <li>
            <Link to="/" className="hover:text-gray-900">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/products" className="hover:text-gray-900">
              Products
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-gray-900">{product.name}</li>
        </ol>
      </nav>

      {/* Product Details */}
      <section className="grid gap-8 lg:grid-cols-2">
        <ImageGallery images={product.imageUrls} productName={product.name} />

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-4 flex items-center gap-3">
            <StarRating rating={averageRating} showValue />
            <span className="text-sm text-gray-500">
              ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
            </span>
          </div>

          <p className="mt-6 text-3xl font-bold text-gray-900">
            ₹{Number(product.price).toFixed(2)}
          </p>

          <div className="mt-4">
            <div className="mt-4">
              <Badge variant={isInStock ? 'success' : 'danger'}>
                {isInStock ? `${product.stock} in stock` : 'Out of stock'}
              </Badge>
            </div>
          </div>

          {product.description && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-line text-gray-600">{product.description}</p>
            </div>
          )}

          <div className="mt-8">
            <Button type="button" onClick={handleAddToCart} disabled={!isInStock}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mt-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>
          <p className="mt-1 text-sm text-gray-500">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>

        <ReviewList
          reviews={reviews}
          loading={reviewsLoading}
          hasMore={hasMoreReviews}
          onLoadMore={handleLoadMoreReviews}
        />
      </section>
    </main>
  );
}
