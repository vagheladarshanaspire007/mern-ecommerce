export const AUTH_MESSAGES = {
  USER_CREATED: 'auth.user_created',
  LOGIN_SUCCESS: 'auth.login_success',
  LOGGED_OUT: 'auth.logged_out',
  RESET_LINK_SENT: 'auth.reset_link_sent',
  RESET_SUCCESS: 'auth.reset_success',
  AUTH_REQUIRED: 'auth.authentication_required',
  INVALID_OR_EXPIRED_TOKEN: 'auth.invalid_or_expired_token',
  INVALID_CREDENTIALS: 'auth.invalid_credentials',
  EMAIL_ALREADY_EXISTS: 'auth.email_already_exists',
} as const;
export const ORDER_MESSAGES = {
  ORDER_CREATED: 'orders.order_created',
  ORDER_NOT_FOUND: 'orders.order_not_found',
  INSUFFICIENT_STOCK: 'orders.insufficient_stock',
  UNAUTHORIZED: 'orders.unauthorized',
  FORBIDDEN: 'orders.forbidden',
} as const;
