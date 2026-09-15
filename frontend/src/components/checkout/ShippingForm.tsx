/**
 * ============================================================
 * Shipping Form — src/components/checkout/ShippingForm.tsx
 * ============================================================
 * Step 1 of the checkout flow.
 *
 * Responsibilities:
 *   - Collect shipping address details
 *   - Validate the address with Zod
 *   - Manage form state with React Hook Form
 *   - Restore previously entered values through defaultValues
 * ============================================================
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
}

const shippingSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name is too long'),

  address: z
    .string()
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(250, 'Address is too long'),

  city: z.string().trim().min(2, 'City must be at least 2 characters').max(100, 'City is too long'),

  state: z
    .string()
    .trim()
    .min(2, 'State must be at least 2 characters')
    .max(100, 'State is too long'),

  pin: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),

  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Phone must be exactly 10 digits'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

type ShippingFormProps = {
  readonly initialValues?: ShippingAddress;
  readonly onSubmit: (data: ShippingAddress) => void;
};

export function ShippingForm({ initialValues, onSubmit }: ShippingFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),

    // CheckoutPage stores the submitted address locally.
    // These values restore the form when the user returns to Step 1.
    defaultValues: initialValues ?? {
      fullName: '',
      address: '',
      city: '',
      state: '',
      pin: '',
      phone: '',
    },
  });

  const handleFormSubmit = (values: ShippingFormValues) => {
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Shipping Address</h2>

        <p className="mt-1 text-sm text-gray-500">
          Enter the address where you want your order delivered.
        </p>
      </div>

      <div className="space-y-4">
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Full Name"
              placeholder="Enter your full name"
              autoComplete="name"
              error={errors.fullName?.message}
            />
          )}
        />

        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              label="Address"
              placeholder="House no., street, area"
              autoComplete="street-address"
              error={errors.address?.message}
            />
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Controller
            name="city"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="City"
                placeholder="Enter city"
                autoComplete="address-level2"
                error={errors.city?.message}
              />
            )}
          />

          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="State"
                placeholder="Enter state"
                autoComplete="address-level1"
                error={errors.state?.message}
              />
            )}
          />

          <Controller
            name="pin"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="PIN"
                placeholder="6-digit PIN"
                inputMode="numeric"
                maxLength={6}
                autoComplete="postal-code"
                error={errors.pin?.message}
              />
            )}
          />

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                label="Phone"
                placeholder="10-digit phone number"
                inputMode="tel"
                maxLength={10}
                autoComplete="tel"
                error={errors.phone?.message}
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-5">
        <Button type="submit">Continue to Summary</Button>
      </div>
    </form>
  );
}
