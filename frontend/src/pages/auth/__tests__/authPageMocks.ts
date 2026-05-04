import { vi } from 'vitest';

type AuthPageMocks = {
  toastSuccess: ReturnType<typeof vi.fn>;
  toastError: ReturnType<typeof vi.fn>;
  mockNavigate: ReturnType<typeof vi.fn>;
};

export const createAuthPageMocks = (): AuthPageMocks => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  mockNavigate: vi.fn(),
});

export const createHotToastMock = (mocks: AuthPageMocks) => ({
  default: {
    success: mocks.toastSuccess,
    error: mocks.toastError,
  },
});

export const createRouterDomMock = async (mocks: AuthPageMocks) => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mocks.mockNavigate,
  };
};

export const resetAuthPageMocks = (mocks: AuthPageMocks) => {
  mocks.toastSuccess.mockReset();
  mocks.toastError.mockReset();
  mocks.mockNavigate.mockReset();
};
