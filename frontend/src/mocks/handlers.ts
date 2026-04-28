import { delay, http, HttpResponse } from 'msw';

import { mockOrders } from '@/mocks/orders';

export const handlers = [
  http.get('/api/v1/orders/history', async () => {
    await delay(500);

    return HttpResponse.json({
      data: {
        items: mockOrders,
      },
    });
  }),
];
