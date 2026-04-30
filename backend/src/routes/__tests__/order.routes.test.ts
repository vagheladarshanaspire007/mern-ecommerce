import { createOrderController } from '../../controllers/order.controller';
import { createMockRes } from '../../test/utils/mockRes';
import { testOrderItem, testShippingAddress, testUser } from '../../test/utils/testData';

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
      user: testUser,
      body: {
        items: [testOrderItem],
        shippingAddress: testShippingAddress,
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
        shippingAddress: testShippingAddress,
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
      user: testUser,
      body: {
        items: [testOrderItem],
        shippingAddress: testShippingAddress,
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
