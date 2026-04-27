import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import type { ShippingAddress } from '@/types/checkout.types';

const shippingSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  address: z.string().trim().min(5, 'Address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  pin: z.string().regex(/^\d{6}$/, 'PIN must be 6 digits'),
  phone: z.string().regex(/^\d{10}$/, 'Phone must be 10 digits'),
});

interface ShippingFormProps {
  defaultValues: ShippingAddress;
  onSubmit: (values: ShippingAddress) => void;
}

const inputClasses =
  'mt-2 w-full rounded-3xl border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white shadow-md outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20';

const errorClasses = 'mt-2 text-sm text-rose-300';

export function ShippingForm({ defaultValues, onSubmit }: Readonly<ShippingFormProps>) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddress>({
    resolver: zodResolver(shippingSchema),
    defaultValues,
  });

  return (
    <section className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-md sm:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white">Shipping Address</h2>
        <p className="mt-2 text-sm text-gray-300">Enter the delivery details for this order.</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label className="text-sm font-medium text-gray-300" htmlFor="fullName">
            Full Name
          </label>
          <input id="fullName" className={inputClasses} {...register('fullName')} />
          {errors.fullName ? <p className={errorClasses}>{errors.fullName.message}</p> : null}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300" htmlFor="address">
            Address
          </label>
          <textarea id="address" rows={4} className={inputClasses} {...register('address')} />
          {errors.address ? <p className={errorClasses}>{errors.address.message}</p> : null}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-300" htmlFor="city">
              City
            </label>
            <input id="city" className={inputClasses} {...register('city')} />
            {errors.city ? <p className={errorClasses}>{errors.city.message}</p> : null}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300" htmlFor="state">
              State
            </label>
            <input id="state" className={inputClasses} {...register('state')} />
            {errors.state ? <p className={errorClasses}>{errors.state.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-gray-300" htmlFor="pin">
              PIN
            </label>
            <input id="pin" inputMode="numeric" className={inputClasses} {...register('pin')} />
            {errors.pin ? <p className={errorClasses}>{errors.pin.message}</p> : null}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300" htmlFor="phone">
              Phone
            </label>
            <input id="phone" inputMode="tel" className={inputClasses} {...register('phone')} />
            {errors.phone ? <p className={errorClasses}>{errors.phone.message}</p> : null}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 sm:w-auto"
          >
            Continue to Summary
          </button>
        </div>
      </form>
    </section>
  );
}
