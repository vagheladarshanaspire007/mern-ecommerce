export const testUser = { userId: 'u1', role: 'user' };

export const testShippingAddress = {
  fullName: 'Jane Doe',
  address: 'Street',
  city: 'City',
  state: 'State',
  pin: '123456',
  phone: '9999999999',
};

export const testOrderItem = { productId: 'p1', quantity: 1 };

// test/utils/mockOrderQueries.ts

export const mockProductRow = (overrides = {}) => ({
  id: 'p1',
  name: 'Widget',
  price: '10',
  stock: 5,
  ...overrides,
});

export const mockOrderRow = (overrides = {}) => ({
  id: 'o1',
  user_id: 'u1',
  status: 'pending',
  total_amount: '10',
  shipping_full_name: 'Jane',
  shipping_address: 'Street',
  shipping_city: 'City',
  shipping_state: 'State',
  shipping_pin: '000000',
  shipping_phone: '9999999999',
  created_at: 'now',
  updated_at: 'now',
  ...overrides,
});

export const mockOrderItemRow = (overrides = {}) => ({
  id: 'oi1',
  order_id: 'o1',
  product_id: 'p1',
  product_name: 'Widget',
  quantity: 1,
  unit_price: '10',
  total_price: '10',
  created_at: 'now',
  ...overrides,
});
