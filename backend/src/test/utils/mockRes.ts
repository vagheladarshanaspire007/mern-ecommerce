export type MockRes = {
  status: jest.MockedFunction<(code: number) => MockRes>;
  json: jest.MockedFunction<(body: unknown) => MockRes>;
  cookie: jest.MockedFunction<(name: string, value: string, options?: unknown) => MockRes>;
  clearCookie: jest.MockedFunction<(name: string, options?: unknown) => MockRes>;
};

export const createMockRes = (): MockRes => {
  const res = {} as MockRes;
  res.status = jest.fn<MockRes, [number]>(() => res);
  res.json = jest.fn<MockRes, [unknown]>(() => res);
  res.cookie = jest.fn<MockRes, [string, string, unknown?]>(() => res);
  res.clearCookie = jest.fn<MockRes, [string, unknown?]>(() => res);
  return res;
};
