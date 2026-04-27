// src/constants/messages.ts
export const AUTH_MESSAGES = {
  USER_CREATED: 'auth.user_created',
  LOGIN_SUCCESS: 'auth.login_success',
  LOGGED_OUT: 'auth.logged_out',
  PASSWORD_RESET_LINK_SENT: 'auth.password_reset_link_sent',
  PASSWORD_RESET_SUCCESS: 'auth.password_reset_success',
  AUTH_REQUIRED: 'auth.authentication_required',
  INVALID_OR_EXPIRED_TOKEN: 'auth.invalid_or_expired_token',
  INVALID_CREDENTIALS: 'auth.invalid_credentials',
  EMAIL_ALREADY_EXISTS: 'auth.email_already_exists',
  PASSWORD_RESET_NOT_ALLOWED_DOMAIN: 'auth.password_reset_not_allowed_domain',
} as const;
