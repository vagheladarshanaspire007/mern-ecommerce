import toast from 'react-hot-toast';
import { useAppDispatch } from '@/store';
import {
  removeFromCart,
  updateQuantity,
  type CartItem as CartItemData,
} from '@/store/slices/cartSlice';

type CartItemVariant = 'compact' | 'full';

interface CartItemProps {
  item: CartItemData;
  variant?: CartItemVariant;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'INR',
});

export default function CartItem({ item, variant = 'full' }: Readonly<CartItemProps>) {
  const dispatch = useAppDispatch();
  const isCompact = variant === 'compact';

  const handleIncrease = () => {
    if (item.quantity >= item.stock) {
      toast.error(`Only ${item.stock} item(s) available in stock.`);
      return;
    }

    dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }));
  };

  const handleDecrease = () => {
    if (item.quantity <= 1) return;
    dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }));
  };

  const handleRemove = () => {
    dispatch(removeFromCart(item.productId));
  };

  return (
    <article
      className={`flex gap-3 rounded-2xl border border-slate-200 bg-white ${
        isCompact ? 'p-3' : 'p-4 sm:p-5'
      }`}
    >
      <img
        src={item.imageUrl}
        alt={item.name}
        loading="lazy"
        width={96}
        height={96}
        className={`${isCompact ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24'} rounded-xl object-cover`}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
            {item.name}
          </h3>
          <button
            type="button"
            onClick={handleRemove}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
          >
            Remove
          </button>
        </div>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {currencyFormatter.format(item.price)}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-slate-300">
            <button
              type="button"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="h-8 w-8 text-base font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label={`Decrease quantity of ${item.name}`}
            >
              -
            </button>
            <span className="w-9 text-center text-sm font-semibold text-slate-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrease}
              disabled={item.quantity >= item.stock}
              className="h-8 w-8 text-base font-semibold text-slate-700 disabled:cursor-not-allowed disabled:text-slate-300"
              aria-label={`Increase quantity of ${item.name}`}
            >
              +
            </button>
          </div>

          {!isCompact && (
            <p className="text-sm font-semibold text-slate-900">
              {currencyFormatter.format(item.price * item.quantity)}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
