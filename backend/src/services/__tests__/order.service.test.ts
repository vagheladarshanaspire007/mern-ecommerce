import type { PoolClient } from 'pg';
import type * as Database from '../../config/database';
import {
  mockOrderItemRow,
  mockOrderRow,
  mockProductRow,
  testOrderItem,
  testShippingAddress,
} from '../../test/utils/testData';

type TransactionCallback = Parameters<typeof Database.withTransaction>[0];

const mockWithTransaction = jest.fn() as jest.MockedFunction<typeof Database.withTransaction>;
const mockGetIO = jest.fn() as jest.MockedFunction<typeof import('../../config/socket').getIO>;
const mockEmit = jest.fn(() => true) as jest.MockedFunction<(...args: unknown[]) => boolean>;

jest.mock('../../config/database', () => ({
  withTransaction: mockWithTransaction,
}));

jest.mock('../../config/socket', () => ({
  getIO: mockGetIO,
}));

jest.mock('../../utils/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('../../constants/messages', () => ({
  ORDER_MESSAGES: {
    INSUFFICIENT_STOCK: 'orders.insufficient_stock',
    ORDER_NOT_FOUND: 'orders.order_not_found',
    FORBIDDEN: 'orders.forbidden',
    UNAUTHORIZED: 'orders.unauthorized',
  },
}));

import * as orderService from '../order.service';

describe('order.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetIO.mockReturnValue({
      to: () => ({
        emit: mockEmit,
      }),
    } as unknown as ReturnType<typeof mockGetIO>);
  });

  it('insufficient stock throws 409', async () => {
    mockWithTransaction.mockImplementation(async (cb: TransactionCallback) => {
      const client = {
        query: jest.fn().mockResolvedValue({
          rows: [mockProductRow({ stock: 1 })],
        }),
      } as Pick<PoolClient, 'query'>;
      return cb(client as unknown as PoolClient);
    });

    await expect(
      orderService.createOrderService({
        userId: 'u1',
        items: [{ ...testOrderItem, quantity: 5 }],
        shippingAddress: testShippingAddress,
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('transaction rolls back if order_items insert fails', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [mockProductRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderRow()] })
      .mockRejectedValueOnce(new Error('insert failed'));

    const client = { query };
    const begin = jest.fn();
    const commit = jest.fn();
    const rollback = jest.fn();

    mockWithTransaction.mockImplementation(async (cb: TransactionCallback) => {
      try {
        await begin();
        return await cb(client as unknown as PoolClient);
      } catch (error) {
        await rollback();
        throw error;
      } finally {
        await commit();
      }
    });

    await expect(
      orderService.createOrderService({
        userId: 'u1',
        items: [testOrderItem],
        shippingAddress: testShippingAddress,
      })
    ).rejects.toThrow('insert failed');
  });

  it('createOrderService empty items 400', async () => {
    mockWithTransaction.mockImplementation(async (cb: TransactionCallback) => {
      const client = { query: jest.fn() } as Pick<PoolClient, 'query'>;
      return cb(client as unknown as PoolClient);
    });

    await expect(
      orderService.createOrderService({
        userId: 'u1',
        items: [],
        shippingAddress: testShippingAddress,
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('createOrderService missing product 400', async () => {
    mockWithTransaction.mockImplementation(async (cb: TransactionCallback) => {
      const client = {
        query: jest.fn().mockResolvedValueOnce({ rows: [] }),
      } as Pick<PoolClient, 'query'>;
      return cb(client as unknown as PoolClient);
    });

    await expect(
      orderService.createOrderService({
        userId: 'u1',
        items: [testOrderItem],
        shippingAddress: testShippingAddress,
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('createOrderService success', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [mockProductRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderItemRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderItemRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderItemRow()] });

    mockWithTransaction.mockImplementation(async (cb: TransactionCallback) => {
      const client = { query } as Pick<PoolClient, 'query'>;
      return cb(client as unknown as PoolClient);
    });

    const result = await orderService.createOrderService({
      userId: 'u1',
      items: [testOrderItem],
      shippingAddress: testShippingAddress,
    });

    expect(result.order.id).toBeDefined();
    expect(result.order.itemCount).toBe(1);
  });

  it('createOrderService order load failure 500', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [mockProductRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderItemRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderItemRow()] })
      .mockResolvedValueOnce({ rows: [] });

    mockWithTransaction.mockImplementation(async (cb: TransactionCallback) =>
      cb({ query } as unknown as PoolClient)
    );

    await expect(
      orderService.createOrderService({
        userId: 'u1',
        items: [testOrderItem],
        shippingAddress: testShippingAddress,
      })
    ).rejects.toMatchObject({ statusCode: 500 });
  });

  it('listOrdersService success', async () => {
    const query = jest
      .fn()
      .mockResolvedValueOnce({ rows: [{ count: '1' }] })
      .mockResolvedValueOnce({ rows: [mockOrderRow()] })
      .mockResolvedValueOnce({ rows: [mockOrderItemRow()] });

    mockWithTransaction.mockImplementation(async (cb: TransactionCallback) =>
      cb({ query } as unknown as PoolClient)
    );

    const result = await orderService.listOrdersService('u1', 'admin', 1, 10);

    expect(result.total).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('getOrderDetailService forbidden and not found', async () => {
    mockWithTransaction.mockImplementationOnce(async (cb: TransactionCallback) =>
      cb({ query: jest.fn().mockResolvedValueOnce({ rows: [] }) } as unknown as PoolClient)
    );

    await expect(orderService.getOrderDetailService('u1', 'o1')).rejects.toMatchObject({
      statusCode: 404,
    });

    mockWithTransaction.mockImplementationOnce(async (cb: TransactionCallback) =>
      cb({
        query: jest.fn().mockResolvedValueOnce({
          rows: [mockOrderRow({ user_id: 'owner' })],
        }),
      } as unknown as PoolClient)
    );

    await expect(orderService.getOrderDetailService('u1', 'o1')).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it('getOrderDetailService success', async () => {
    mockWithTransaction.mockImplementationOnce(async (cb: TransactionCallback) =>
      cb({
        query: jest
          .fn()
          .mockResolvedValueOnce({ rows: [mockOrderRow()] })
          .mockResolvedValueOnce({ rows: [mockOrderItemRow()] }),
      } as unknown as PoolClient)
    );

    const result = await orderService.getOrderDetailService('u1', 'o1');

    expect(result.id).toBe('o1');
    expect(result.items).toHaveLength(1);
  });

  it('updateOrderStatusService success and failures', async () => {
    await expect(
      orderService.updateOrderStatusService({ orderId: 'o1', status: 'shipped', actorRole: 'user' })
    ).rejects.toMatchObject({ statusCode: 403 });

    mockWithTransaction.mockImplementationOnce(async (cb: TransactionCallback) =>
      cb({ query: jest.fn().mockResolvedValueOnce({ rows: [] }) } as unknown as PoolClient)
    );

    await expect(
      orderService.updateOrderStatusService({
        orderId: 'o1',
        status: 'shipped',
        actorRole: 'admin',
      })
    ).rejects.toMatchObject({ statusCode: 404 });

    mockWithTransaction.mockImplementationOnce(async (cb: TransactionCallback) =>
      cb({
        query: jest.fn().mockResolvedValueOnce({
          rows: [{ id: 'o1', user_id: 'u1', status: 'shipped' }],
        }),
      } as unknown as PoolClient)
    );

    const result = await orderService.updateOrderStatusService({
      orderId: 'o1',
      status: 'shipped',
      actorRole: 'admin',
    });

    expect(result).toEqual({ id: 'o1', userId: 'u1', status: 'shipped' });

    expect(mockEmit).toHaveBeenCalledWith('order:status-updated', {
      orderId: 'o1',
      status: 'shipped',
    });
  });
});
