import { createOrderController } from '../../controllers/order.controller';

type MockRes = {
  status: jest.MockedFunction<(code: number) => MockRes>;
  json: jest.MockedFunction<(body: unknown) => MockRes>;
};

const createMockRes = (): MockRes => {
  const res = {} as MockRes;
  res.status = jest.fn<MockRes, [number]>(() => res);
  res.json = jest.fn<MockRes, [unknown]>(() => res);
  return res;
};

jest.mock('../../services/order.service', () => ({
  createOrderService: jest.fn(),
  getOrderDetailService: jest.fn(),
  listOrdersService: jest.fn(),
  updateOrderStatusService: jest.fn(),
}));

describe('order.routes', () => {
  it('POST /orders success', async () => {
    const res = createMockRes();
    const req = {
      user: { userId: 'u1', role: 'user' },
      body: {
        items: [{ productId: 'p1', quantity: 1 }],
        shippingAddress: {
          fullName: 'Jane Doe',
          address: 'Street',
          city: 'City',
          state: 'State',
          pin: '123456',
          phone: '9999999999',
        },
      },
    } as Parameters<typeof createOrderController>[0];
    const service = await import('../../services/order.service');
    const createOrderMock = service.createOrderService as jest.MockedFunction<
      typeof service.createOrderService
    >;
    createOrderMock.mockResolvedValue({
      order: {
        id: 'o1',
        userId: 'u1',
        status: 'pending',
        totalAmount: 10,
        shippingAddress: {
          fullName: 'Jane Doe',
          address: 'Street',
          city: 'City',
          state: 'State',
          pin: '123456',
          phone: '9999999999',
        },
        createdAt: 'now',
        updatedAt: 'now',
        itemCount: 1,
        items: [],
      },
    } as Awaited<ReturnType<typeof service.createOrderService>>);

    await createOrderController(req, res as unknown as Parameters<typeof createOrderController>[1]);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('POST /orders stock failure', async () => {
    const res = createMockRes();
    const req = {
      user: { userId: 'u1', role: 'user' },
      body: {
        items: [{ productId: 'p1', quantity: 5 }],
        shippingAddress: {
          fullName: 'Jane Doe',
          address: 'Street',
          city: 'City',
          state: 'State',
          pin: '123456',
          phone: '9999999999',
        },
      },
    } as Parameters<typeof createOrderController>[0];
    const service = await import('../../services/order.service');
    const createOrderMock = service.createOrderService as jest.MockedFunction<
      typeof service.createOrderService
    >;
    createOrderMock.mockRejectedValue({ statusCode: 409 });

    await expect(
      createOrderController(req, res as unknown as Parameters<typeof createOrderController>[1])
    ).rejects.toBeDefined();
  });
});
