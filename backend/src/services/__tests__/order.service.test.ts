import type { OrderStatus } from '../../models/order.model';
import { OrderService } from '../order.service';
import { OrderModel } from '../../models/order.model';
import { withTransaction } from '../../config/database';

jest.mock('../../models/order.model', () => ({
  OrderModel: {
    create: jest.fn(),
    createItem: jest.fn(),
    findByIdForUser: jest.fn(),
    findByUser: jest.fn(),
    countByUser: jest.fn(),
    updateStatus: jest.fn(),
  },
}));

jest.mock('../../config/database', () => ({
  withTransaction: jest.fn(),
}));

jest.mock('../../config/socket', () => ({
  getIO: jest.fn(),
}));

describe('OrderService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('throws 409 when stock is insufficient', async () => {
    (withTransaction as jest.Mock).mockImplementation(async (callback) => {
      const client = {
        query: jest.fn().mockResolvedValue({
          rows: [
            {
              id: 'product-1',
              name: 'Laptop',
              price: '1000.00',
              stock: 2,
              isActive: true,
            },
          ],
        }),
      };

      return callback(client);
    });

    await expect(
      OrderService.create('user-1', [
        { productId: 'product-1', quantity: 5 },
      ])
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'INSUFFICIENT_STOCK',
    });

    expect(OrderModel.create).not.toHaveBeenCalled();
  });

  it('propagates order item failure so the transaction can roll back', async () => {
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rows: [
            {
              id: 'product-1',
              name: 'Laptop',
              price: '1000.00',
              stock: 10,
              isActive: true,
            },
          ],
        })
        .mockResolvedValueOnce({ rows: [] }),
    };

    (withTransaction as jest.Mock).mockImplementation(async (callback) =>
      callback(client)
    );

    (OrderModel.create as jest.Mock).mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
    });

    (OrderModel.createItem as jest.Mock).mockRejectedValue(
      new Error('order_items insert failed')
    );

    await expect(
      OrderService.create('user-1', [
        { productId: 'product-1', quantity: 1 },
      ])
    ).rejects.toThrow('order_items insert failed');

    expect(OrderModel.create).toHaveBeenCalled();
    expect(OrderModel.createItem).toHaveBeenCalled();
  });
});

describe('OrderService additional coverage', () => {
  it('creates an order successfully and updates stock', async () => {
    const client = {
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rows: [{
            id: 'product-1',
            name: 'Laptop',
            price: '1000.00',
            stock: 10,
            isActive: true,
          }],
        })
        .mockResolvedValueOnce({ rows: [] }),
    };

    (withTransaction as jest.Mock).mockImplementation(async (callback) => callback(client));
    (OrderModel.create as jest.Mock).mockResolvedValue({ id: 'order-1', userId: 'user-1' });
    (OrderModel.createItem as jest.Mock).mockResolvedValue(undefined);
    (OrderModel.findByIdForUser as jest.Mock).mockResolvedValue({
      id: 'order-1',
      userId: 'user-1',
    });

    const result = await OrderService.create('user-1', [
      { productId: 'product-1', quantity: 2 },
    ]);

    expect(result.id).toBe('order-1');
    expect(client.query).toHaveBeenCalledTimes(2);
    expect(OrderModel.createItem).toHaveBeenCalled();
  });

  it('rejects inactive or missing products', async () => {
    const client = {
      query: jest.fn().mockResolvedValue({
        rows: [{
          id: 'product-1',
          name: 'Laptop',
          price: '1000.00',
          stock: 10,
          isActive: false,
        }],
      }),
    };

    (withTransaction as jest.Mock).mockImplementation(async (callback) => callback(client));

    await expect(OrderService.create('user-1', [
      { productId: 'product-1', quantity: 1 },
    ])).rejects.toMatchObject({ statusCode: 409 });

    expect(OrderModel.create).not.toHaveBeenCalled();
  });

  it('lists user orders with pagination', async () => {
    (OrderModel.findByUser as jest.Mock).mockResolvedValue([]);
    (OrderModel.countByUser as jest.Mock).mockResolvedValue(5);

    const result = await OrderService.list('user-1', 2, 2);

    expect(result.pagination).toEqual({
      page: 2,
      limit: 2,
      total: 5,
      totalPages: 3,
    });
  });

  it('gets an order by id', async () => {
    const order = { id: 'order-1', userId: 'user-1' };
    (OrderModel.findByIdForUser as jest.Mock).mockResolvedValue(order);

    await expect(OrderService.getById('order-1', 'user-1')).resolves.toEqual(order);
  });

  it('throws 404 for missing order', async () => {
    (OrderModel.findByIdForUser as jest.Mock).mockResolvedValue(null);

    await expect(OrderService.getById('missing', 'user-1'))
      .rejects.toMatchObject({ statusCode: 404 });
  });

  it('rejects invalid order status', async () => {
    await expect(OrderService.updateStatus('order-1', 'invalid' as OrderStatus))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('updates order status and emits socket event', async () => {
    const order = { id: 'order-1', userId: 'user-1', status: 'shipped' };
    (OrderModel.updateStatus as jest.Mock).mockResolvedValue(order);

    const { getIO } = require('../../config/socket');
    const emit = jest.fn();
    (getIO as jest.Mock).mockReturnValue({
      to: jest.fn().mockReturnValue({ emit }),
    });

    const result = await OrderService.updateStatus('order-1', 'shipped');

    expect(result).toEqual(order);
    expect(emit).toHaveBeenCalledWith('order:status-updated', {
      orderId: 'order-1',
      status: 'shipped',
    });
  });

  it('throws 404 when updating a missing order', async () => {
    (OrderModel.updateStatus as jest.Mock).mockResolvedValue(null);

    await expect(OrderService.updateStatus('order-1', 'shipped'))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});
