import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import { addToCart } from '@/store/slices/cartSlice';
import type { Product } from '@/types/auth.types';

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

  const isInStock = product.stock > 0;
  const imageSrc = product.imageUrls[0] || 'https://placehold.co/600x400?text=No+Image';

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
    <article
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-transparent transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-slate-300/60"
      onClick={() => navigate(`/products/${product.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(`/products/${product.id}`);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${product.name}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          width={600}
          height={400}
          className="h-48 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
        />
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/5 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-[0.95rem] font-semibold leading-5 text-slate-900">
            {product.name}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              isInStock ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isInStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>

        <p className="text-xl font-bold tracking-tight text-slate-900">
          {currencyFormatter.format(Number(product.price))}
        </p>

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleAddToCart();
          }}
          disabled={!isInStock}
          className="mt-auto rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-300"
          aria-label={`Add ${product.name} to cart`}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="h-48 w-full bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-slate-200" />
        <div className="h-4 w-1/2 rounded bg-slate-200" />
        <div className="h-10 w-full rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

const ProductCard = memo(ProductCardComponent);

export { ProductCardSkeleton };
export default ProductCard;
