import { Minus, Plus, Trash2 } from 'lucide-react';

import type { CartItem as CartItemType } from '@/store/slices/cartSlice';

interface CartItemProps {
  readonly item: CartItemType;
  readonly onIncrease: () => void;
  readonly onDecrease: () => void;
  readonly onRemove: () => void;
}

export function CartItem({ item, onIncrease, onDecrease, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 border-b border-gray-200 py-4">
      {/* Product Image */}
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-500">
            No image
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">{item.name}</h3>

        <p className="mt-1 text-sm text-gray-600">
          ₹{item.price.toFixed(2)} × {item.quantity}
        </p>

        {/* Quantity Controls */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={onDecrease}
            aria-label={`Decrease quantity of ${item.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-700 transition hover:bg-gray-100"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span
            className="min-w-8 text-center text-sm font-medium"
            aria-label={`Quantity: ${item.quantity}`}
          >
            {item.quantity}
          </span>

          <button
            type="button"
            onClick={onIncrease}
            aria-label={`Increase quantity of ${item.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 text-gray-700 transition hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </button>

          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${item.name} from cart`}
            className="ml-2 flex h-8 w-8 items-center justify-center rounded-md text-red-600 transition hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Item Total */}
      <p className="shrink-0 text-sm font-semibold text-gray-900">
        ₹{(item.price * item.quantity).toFixed(2)}
      </p>
    </div>
  );
}
