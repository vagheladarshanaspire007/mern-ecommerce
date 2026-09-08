import toast from 'react-hot-toast';

import { useAppDispatch } from '@/store';
import { updateQuantity } from '@/store/slices/cartSlice';

export function useCartActions() {
  const dispatch = useAppDispatch();

  const handleIncrease = (
    productId: string,
    quantity: number,
    stock: number
  ) => {
    if (quantity >= stock) {
      toast.error(`Only ${stock} item(s) available in stock.`);
      return;
    }

    dispatch(
      updateQuantity({
        productId,
        quantity: quantity + 1,
      })
    );
  };

  const handleDecrease = (productId: string, quantity: number) => {
    dispatch(
      updateQuantity({
        productId,
        quantity: quantity - 1,
      })
    );
  };

  return {
    handleIncrease,
    handleDecrease,
  };
}