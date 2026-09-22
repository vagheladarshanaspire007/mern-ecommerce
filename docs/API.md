# API Reference

Base URL: `http://localhost:5000/api/v1`

> Health endpoints are mounted outside the versioned API prefix:
> `http://localhost:5000/api/health` and `http://localhost:5000/api/health/ready`

## Authentication

Authenticated requests use:

```http
Authorization: Bearer <accessToken>
```

The refresh token is sent as an HTTP-only `refreshToken` cookie.

## Endpoint Summary

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | No | Register a user |
| POST | `/auth/login` | No | Login |
| POST | `/auth/refresh` | Refresh token cookie | Refresh access token |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password |
| POST | `/auth/logout` | Yes | Logout |
| GET | `/auth/me` | Yes | Get current user |
| GET | `/products/categories` | No | List categories |
| GET | `/products` | Optional | List products |
| GET | `/products/:id` | Optional | Get product |
| POST | `/products` | Admin | Create product |
| PATCH | `/products/:id` | Admin | Update product |
| DELETE | `/products/:id` | Admin | Delete product |
| POST | `/orders` | Yes | Create order |
| GET | `/orders` | Yes | List orders |
| GET | `/orders/:id` | Yes | Get order |
| PATCH | `/orders/:id/status` | Admin | Update order status |
| GET | `/users/profile` | Yes | User profile — Out of Scope |
| PATCH | `/users/profile` | Yes | Update profile — Out of Scope |
| PATCH | `/users/change-password` | Yes | Change password — Out of Scope |
| GET | `/users` | Admin | List users — Out of Scope |
| DELETE | `/users/:id` | Admin | Delete user — Out of Scope |
| POST | `/upload/image` | Yes | Upload one image |
| POST | `/upload/images` | Yes | Multiple images — Out of Scope |
| GET | `/api/health` | No | Liveness check |
| GET | `/api/health/ready` | No | DB/Redis readiness check |

## Authentication API

### POST `/auth/register`

Register a new user.

**Request**

```json
{
  "email": "john@example.com",
  "password": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "confirmPassword": "Password123!"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "user": {},
    "accessToken": "<token>"
  }
}
```

### POST `/auth/login`

Authenticate a user.

**Request**

```json
{
  "email": "john@example.com",
  "password": "Password123!"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "user": {},
    "accessToken": "<token>"
  }
}
```

Login is rate-limited to 5 attempts per 15-minute window.

### POST `/auth/refresh`

Refresh an access token.

The refresh token is read from the `refreshToken` HTTP-only cookie.

**Request**

No request body is required.

Example request:

```http
POST /api/v1/auth/refresh
Cookie: refreshToken=<refresh-token>
```

### POST `/auth/forgot-password`

Request a password reset.

**Request**

```json
{
  "email": "john@example.com"
}
```

### POST `/auth/reset-password`

Reset a password using a reset token.

**Request**

```json
{
  "token": "<reset-token>",
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### POST `/auth/logout`

Requires authentication.

### GET `/auth/me`

Requires authentication.

**Response**

```json
{
  "success": true,
  "data": {
    "user": {}
  }
}
```

## Product API

### GET `/products/categories`

Returns available product categories.

**Response**

```json
{
  "success": true,
  "data": {
    "categories": []
  }
}
```

### GET `/products`

Authentication is optional.

**Example**

```http
GET /api/v1/products?page=1&limit=20
```

**Response**

```json
{
  "success": true,
  "data": [],
  "pagination": {}
}
```

### GET `/products/:id`

Returns one product.

**Response**

```json
{
  "success": true,
  "data": {
    "product": {}
  }
}
```

### POST `/products`

Admin authentication required.

**Request**

`categoryId` must be a valid category UUID.

```json
{
  "name": "Example Product",
  "description": "Product description",
  "price": 29.99,
  "stock": 100,
  "categoryId": "<category-uuid>"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "product": {}
  }
}
```

### PATCH `/products/:id`

Admin authentication required.

**Request**

```json
{
  "price": 24.99,
  "stock": 90
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "product": {}
  }
}
```

### DELETE `/products/:id`

Admin authentication required.

**Response**

```json
{
  "success": true,
  "data": {
    "message": "Product deleted successfully"
  }
}
```

## Order API

All order endpoints require authentication.

### POST `/orders`

Create an order.

**Request**

```json
{
  "items": [
    {
      "productId": "<product-id>",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "John Doe",
    "address": "123 Main Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pin": "400001",
    "phone": "9876543210"
  }
}
```

### GET `/orders`

List orders available to the authenticated user.

**Response**

```json
{
  "success": true,
  "data": [],
  "pagination": {}
}
```

### GET `/orders/:id`

Get a single order.

**Response**

```json
{
  "success": true,
  "data": {
    "order": {}
  }
}
```

### PATCH `/orders/:id/status`

Admin authentication required.

**Request**

```json
{
  "status": "processing"
}
```

The backend also emits the Socket.io event `order:status-updated` when an order status changes.

## User API

The following endpoints currently return HTTP `501` and are explicitly **Out of Scope** for this task:

- `GET /users/profile`
- `PATCH /users/profile`
- `PATCH /users/change-password`
- `GET /users`
- `DELETE /users/:id`

## Upload API

### POST `/upload/image`

Requires authentication.

Use `multipart/form-data` with the supported image file field.

### POST `/upload/images`

Currently returns HTTP `501`.

**Out of Scope:** multiple-image processing.

## Health API

### GET `/api/health`

Unauthenticated liveness check.

**Response**

```json
{
  "status": "ok",
  "timestamp": "2026-09-22T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### GET `/api/health/ready`

Checks PostgreSQL and Redis connectivity.

**Response**

```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "redis": "ok"
  },
  "timestamp": "2026-09-22T00:00:00.000Z"
}
```

## Rate Limits

| Area | Limit |
|---|---|
| General API | 100 requests / 15 minutes / IP |
| Login/Register | 5 attempts / 15 minutes |
| Password reset | 3 requests / hour |
| Upload | 50 requests / hour |

Rate-limit responses use HTTP `429`.

## Common HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Invalid request |
| 401 | Authentication required or invalid |
| 403 | Forbidden |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
| 501 | Out-of-scope endpoint |
