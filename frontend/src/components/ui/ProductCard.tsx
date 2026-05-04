import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';
import type { Product } from '@/types/auth.types';
import { DEFAULT_IMAGE_PLACEHOLDER, resolveImageUrl } from '@/utils/resolveImageUrl';

type ProductCardProps = {
  product: Product;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'INR',
});

function ProductCardComponent({ product }: Readonly<ProductCardProps>) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItem = useAppSelector((state) =>
    state.cart.items.find((item) => item.productId === product.id)
  );

  const isInStock = product?.stock > 0;
  const imageSrc = resolveImageUrl(product.imageUrls?.[0]);

  const handleAddToCart = () => {
    if (!isInStock) {
      toast.error('This product is out of stock.');
      return;
    }

    if (cartItem && cartItem.quantity >= cartItem.stock) {
      toast.error(`Only ${cartItem.stock} item(s) available in stock.`);
      return;
    }

    dispatch(
      addToCart({
        productId: product.id,
        name: product.name,
        price: Number(product.price),
        imageUrl: imageSrc,
        stock: product.stock,
      })
    );
    toast.success(`${product.name} added to cart.`);
  };

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-slate-950/25 ring-1 ring-transparent transition duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-950/20 hover:ring-cyan-400/20">
      <button
        type="button"
        onClick={() => navigate(`/products/${product.id}`)}
        aria-label={`View details for ${product.name}`}
        className="flex flex-1 flex-col text-left outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <div className="relative overflow-hidden">
          <img
            src={imageSrc}
            alt={product.name}
            loading="lazy"
            width={600}
            height={400}
            className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            onError={(event) => {
              event.currentTarget.src = DEFAULT_IMAGE_PLACEHOLDER;
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-5 text-slate-100">
              {product.name}
            </h3>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                isInStock ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
              }`}
            >
              {isInStock ? 'In stock' : 'Out of stock'}
            </span>
          </div>

          <p className="text-xl font-bold tracking-tight text-white">
            {currencyFormatter.format(Number(product.price))}
          </p>
        </div>
      </button>

      <div className="px-4 pb-4">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isInStock}
          className="mt-auto w-full cursor-pointer rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-xl shadow-slate-950/25">
      <div className="h-48 w-full bg-slate-800" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-800" />
        <div className="h-4 w-1/2 rounded bg-slate-800" />
        <div className="h-10 w-full rounded-xl bg-slate-800" />
      </div>
    </div>
  );
}

const ProductCard = memo(ProductCardComponent);

export { ProductCardSkeleton };
export default ProductCard;
