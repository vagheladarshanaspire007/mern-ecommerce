# API Reference

This guide describes the API surface used by the project in a developer-friendly way. It focuses on the request and response shapes you need while building against the backend.

## Base URLs

- API base URL: `http://localhost:5000/api/v1`
- Health endpoints: `http://localhost:5000/api/health`

## Conventions

- Protected endpoints require `Authorization: Bearer <access-token>`
- Some auth flows also use a `refreshToken` cookie
- Request validation is handled before controller logic runs
- A few endpoints in the current codebase are still placeholders; where that matters, it is called out clearly

## Health

### GET `/api/health`

Checks whether the backend process is alive.

Response `200`

```json
{
  "status": "ok",
  "timestamp": "2026-04-29T10:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### GET `/api/health/ready`

Checks whether PostgreSQL and Redis are ready.

Healthy response `200`

```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "redis": "ok"
  },
  "timestamp": "2026-04-29T10:00:00.000Z"
}
```

Degraded response `503`

```json
{
  "status": "degraded",
  "checks": {
    "database": "error",
    "redis": "ok"
  },
  "timestamp": "2026-04-29T10:00:00.000Z"
}
```

## Auth

### User Shape

Successful auth endpoints return a user object like this:

```json
{
  "id": "a3a8a8d1-1111-4d92-9c52-123456789abc",
  "firstName": "Ava",
  "lastName": "Shah",
  "email": "ava@example.com",
  "address": null,
  "role": "user",
  "image": null,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

### POST `/api/v1/auth/register`

Creates a new account.

Request body:

```json
{
  "firstName": "Ava",
  "lastName": "Shah",
  "email": "ava@example.com",
  "password": "StrongPass1"
}
```

Success response `201`

```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "a3a8a8d1-1111-4d92-9c52-123456789abc",
    "firstName": "Ava",
    "lastName": "Shah",
    "email": "ava@example.com",
    "address": null,
    "role": "user",
    "image": null,
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  },
  "accessToken": "jwt-access-token"
}
```

Note: a `refreshToken` cookie is also set on success.

### POST `/api/v1/auth/login`

Logs a user in.

Request body:

```json
{
  "email": "ava@example.com",
  "password": "StrongPass1",
  "rememberMe": false
}
```

Success response `200`

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "a3a8a8d1-1111-4d92-9c52-123456789abc",
    "firstName": "Ava",
    "lastName": "Shah",
    "email": "ava@example.com",
    "address": null,
    "role": "user",
    "image": null,
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  },
  "accessToken": "jwt-access-token"
}
```

Rate-limited response `429`

```json
{
  "success": false,
  "error": {
    "code": "AUTH_RATE_LIMIT_EXCEEDED",
    "message": "Too many login attempts. Please wait 15 minutes."
  }
}
```

### POST `/api/v1/auth/refresh`

Refreshes the access token using the `refreshToken` cookie.

Success response `200`

```json
{
  "success": true,
  "accessToken": "jwt-access-token"
}
```

Failure response `401`

```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### POST `/api/v1/auth/logout`

Logs the user out and clears the refresh cookie.

Success response `200`

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### GET `/api/v1/auth/me`

Returns the current authenticated user.

Success response `200`

```json
{
  "success": true,
  "user": {
    "id": "a3a8a8d1-1111-4d92-9c52-123456789abc",
    "firstName": "Ava",
    "lastName": "Shah",
    "email": "ava@example.com",
    "address": null,
    "role": "user",
    "image": null,
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  }
}
```

### POST `/api/v1/auth/forgot-password`

Starts the password reset flow.

Request body:

```json
{
  "email": "ava@example.com"
}
```

Success response `200`

```json
{
  "success": true,
  "message": "Password reset link sent"
}
```

### POST `/api/v1/auth/reset-password`

Sets a new password using a reset token.

Request body:

```json
{
  "token": "reset-token",
  "password": "StrongPass1"
}
```

Success response `200`

```json
{
  "success": true,
  "message": "Password reset successful"
}
```

## Products

### Category Shape

```json
{
  "id": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
  "name": "Electronics",
  "slug": "electronics"
}
```

### Product List Item Shape

```json
{
  "id": "f86b4f5a-1111-44be-90f3-123456789abc",
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones",
  "imageUrls": ["https://example.com/headphones-1.jpg"],
  "price": "1999.00",
  "stock": 25,
  "categoryId": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
  "category": {
    "id": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
    "name": "Electronics",
    "slug": "electronics"
  },
  "isActive": true,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z"
}
```

### Product Detail Shape

```json
{
  "id": "f86b4f5a-1111-44be-90f3-123456789abc",
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones",
  "imageUrls": ["https://example.com/headphones-1.jpg"],
  "price": "1999.00",
  "stock": 25,
  "categoryId": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
  "category": {
    "id": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
    "name": "Electronics",
    "slug": "electronics"
  },
  "isActive": true,
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z",
  "averageRating": 4.5,
  "reviewCount": 18
}
```

### GET `/api/v1/products/categories`

Returns all product categories.

Success response `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
      "name": "Electronics",
      "slug": "electronics"
    }
  ]
}
```

### GET `/api/v1/products`

Returns a filtered, paginated product list.

Supported query params:

- `search`
- `minPrice`
- `maxPrice`
- `categoryId`
- `inStock`
- `limit`
- `cursor`

Example request:

```http
GET /api/v1/products?search=headphones&minPrice=1000&maxPrice=5000&inStock=true&limit=20
```

Success response `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "f86b4f5a-1111-44be-90f3-123456789abc",
      "name": "Wireless Headphones",
      "description": "Noise-cancelling over-ear headphones",
      "imageUrls": ["https://example.com/headphones-1.jpg"],
      "price": "1999.00",
      "stock": 25,
      "categoryId": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
      "category": {
        "id": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
        "name": "Electronics",
        "slug": "electronics"
      },
      "isActive": true,
      "createdAt": "2026-04-29T10:00:00.000Z",
      "updatedAt": "2026-04-29T10:00:00.000Z"
    }
  ],
  "pagination": {
    "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTA0LTI5VDEwOjAwOjAwLjAwMFoiLCJpZCI6ImY4NmI0ZjVhLTExMTEtNDRiZS05MGYzLTEyMzQ1Njc4OWFiYyJ9",
    "hasMore": true,
    "limit": 20
  },
  "cached": false
}
```

### GET `/api/v1/products/:id`

Returns one product by ID.

Success response `200`

```json
{
  "success": true,
  "data": {
    "id": "f86b4f5a-1111-44be-90f3-123456789abc",
    "name": "Wireless Headphones",
    "description": "Noise-cancelling over-ear headphones",
    "imageUrls": ["https://example.com/headphones-1.jpg"],
    "price": "1999.00",
    "stock": 25,
    "categoryId": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
    "category": {
      "id": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
      "name": "Electronics",
      "slug": "electronics"
    },
    "isActive": true,
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z",
    "averageRating": 4.5,
    "reviewCount": 18
  }
}
```

### POST `/api/v1/products`

Creates a product. Admin access required.

Request body:

```json
{
  "name": "Wireless Headphones",
  "description": "Noise-cancelling over-ear headphones",
  "imageUrls": ["https://example.com/headphones-1.jpg"],
  "price": 1999,
  "stock": 25,
  "categoryId": "6a0d8f27-1111-4c4a-8d8f-123456789abc"
}
```

Success response `201`

```json
{
  "success": true,
  "data": {
    "id": "f86b4f5a-1111-44be-90f3-123456789abc",
    "name": "Wireless Headphones",
    "description": "Noise-cancelling over-ear headphones",
    "imageUrls": ["https://example.com/headphones-1.jpg"],
    "price": "1999.00",
    "stock": 25,
    "categoryId": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
    "category": {
      "id": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
      "name": "Electronics",
      "slug": "electronics"
    },
    "isActive": true,
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  }
}
```

### PATCH `/api/v1/products/:id`

Updates one or more product fields. Admin access required.

Request body:

```json
{
  "price": 2499,
  "stock": 18
}
```

Success response `200`

```json
{
  "success": true,
  "data": {
    "id": "f86b4f5a-1111-44be-90f3-123456789abc",
    "name": "Wireless Headphones",
    "description": "Noise-cancelling over-ear headphones",
    "imageUrls": ["https://example.com/headphones-1.jpg"],
    "price": "2499.00",
    "stock": 18,
    "categoryId": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
    "category": {
      "id": "6a0d8f27-1111-4c4a-8d8f-123456789abc",
      "name": "Electronics",
      "slug": "electronics"
    },
    "isActive": true,
    "createdAt": "2026-04-29T10:00:00.000Z",
    "updatedAt": "2026-04-29T10:05:00.000Z"
  }
}
```

### DELETE `/api/v1/products/:id`

Deletes a product. Admin access required.

Success response `200`

```json
{
  "success": true,
  "data": "Product deleted successfully"
}
```

## Orders

### Order Detail Shape

```json
{
  "id": "c87d6f03-1111-4ad6-95dd-123456789abc",
  "userId": "a3a8a8d1-1111-4d92-9c52-123456789abc",
  "status": "pending",
  "totalAmount": 3998,
  "shippingAddress": {
    "fullName": "Ava Shah",
    "address": "221B Baker Street",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "pin": "380001",
    "phone": "9999999999"
  },
  "createdAt": "2026-04-29T10:00:00.000Z",
  "updatedAt": "2026-04-29T10:00:00.000Z",
  "itemCount": 1,
  "items": [
    {
      "id": "8b72b2df-1111-47bf-baa0-123456789abc",
      "orderId": "c87d6f03-1111-4ad6-95dd-123456789abc",
      "productId": "f86b4f5a-1111-44be-90f3-123456789abc",
      "productName": "Wireless Headphones",
      "quantity": 2,
      "unitPrice": 1999,
      "lineTotal": 3998,
      "createdAt": "2026-04-29T10:00:00.000Z"
    }
  ]
}
```

### POST `/api/v1/orders`

Creates an order for the logged-in user.

Request body:

```json
{
  "items": [
    {
      "productId": "f86b4f5a-1111-44be-90f3-123456789abc",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "fullName": "Ava Shah",
    "address": "221B Baker Street",
    "city": "Ahmedabad",
    "state": "Gujarat",
    "pin": "380001",
    "phone": "9999999999"
  }
}
```

Success response `201`

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "c87d6f03-1111-4ad6-95dd-123456789abc",
      "userId": "a3a8a8d1-1111-4d92-9c52-123456789abc",
      "status": "pending",
      "totalAmount": 3998,
      "shippingAddress": {
        "fullName": "Ava Shah",
        "address": "221B Baker Street",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pin": "380001",
        "phone": "9999999999"
      },
      "createdAt": "2026-04-29T10:00:00.000Z",
      "updatedAt": "2026-04-29T10:00:00.000Z",
      "itemCount": 1,
      "items": [
        {
          "id": "8b72b2df-1111-47bf-baa0-123456789abc",
          "orderId": "c87d6f03-1111-4ad6-95dd-123456789abc",
          "productId": "f86b4f5a-1111-44be-90f3-123456789abc",
          "productName": "Wireless Headphones",
          "quantity": 2,
          "unitPrice": 1999,
          "lineTotal": 3998,
          "createdAt": "2026-04-29T10:00:00.000Z"
        }
      ]
    }
  }
}
```

### GET `/api/v1/orders`

Returns the current user's orders.

Query params:

- `page`
- `limit`

Success response `200`

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "c87d6f03-1111-4ad6-95dd-123456789abc",
        "userId": "a3a8a8d1-1111-4d92-9c52-123456789abc",
        "status": "pending",
        "totalAmount": 3998,
        "shippingAddress": {
          "fullName": "Ava Shah",
          "address": "221B Baker Street",
          "city": "Ahmedabad",
          "state": "Gujarat",
          "pin": "380001",
          "phone": "9999999999"
        },
        "createdAt": "2026-04-29T10:00:00.000Z",
        "updatedAt": "2026-04-29T10:00:00.000Z",
        "itemCount": 1,
        "items": [
          {
            "id": "8b72b2df-1111-47bf-baa0-123456789abc",
            "orderId": "c87d6f03-1111-4ad6-95dd-123456789abc",
            "productId": "f86b4f5a-1111-44be-90f3-123456789abc",
            "productName": "Wireless Headphones",
            "quantity": 2,
            "unitPrice": 1999,
            "lineTotal": 3998,
            "createdAt": "2026-04-29T10:00:00.000Z"
          }
        ]
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "hasNextPage": false
    }
  }
}
```

### GET `/api/v1/orders/:id`

Returns a single order.

Success response `200`

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "c87d6f03-1111-4ad6-95dd-123456789abc",
      "userId": "a3a8a8d1-1111-4d92-9c52-123456789abc",
      "status": "pending",
      "totalAmount": 3998,
      "shippingAddress": {
        "fullName": "Ava Shah",
        "address": "221B Baker Street",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "pin": "380001",
        "phone": "9999999999"
      },
      "createdAt": "2026-04-29T10:00:00.000Z",
      "updatedAt": "2026-04-29T10:00:00.000Z",
      "itemCount": 1,
      "items": [
        {
          "id": "8b72b2df-1111-47bf-baa0-123456789abc",
          "orderId": "c87d6f03-1111-4ad6-95dd-123456789abc",
          "productId": "f86b4f5a-1111-44be-90f3-123456789abc",
          "productName": "Wireless Headphones",
          "quantity": 2,
          "unitPrice": 1999,
          "lineTotal": 3998,
          "createdAt": "2026-04-29T10:00:00.000Z"
        }
      ]
    }
  }
}
```

### PATCH `/api/v1/orders/:id/status`

Updates an order status. Admin access required.

Request body:

```json
{
  "status": "shipped"
}
```

Allowed values:

- `pending`
- `shipped`
- `delivered`
- `cancelled`

Success response `200`

```json
{
  "success": true,
  "data": {
    "orderId": "c87d6f03-1111-4ad6-95dd-123456789abc",
    "userId": "a3a8a8d1-1111-4d92-9c52-123456789abc",
    "status": "shipped"
  }
}
```

## Uploads

### POST `/api/v1/upload/image`

Uploads a single image.

Headers:

```http
Authorization: Bearer <access-token>
Content-Type: multipart/form-data
```

Success response `200`

```json
{
  "url": "https://example-bucket.s3.amazonaws.com/uploads/demo-image.jpg"
}
```

Missing file response `400`

```json
{
  "success": false,
  "error": {
    "code": "NO_FILE_UPLOADED",
    "message": "Please upload an image file"
  }
}
```

### POST `/api/v1/upload/images`

This endpoint is still a placeholder in the current codebase.

Current response `501`

```json
{
  "message": "TODO: Process multiple images",
  "files": []
}
```

## Current Placeholder Notes

Some endpoints described above are documented from the intended API contract, while the current branch still returns placeholder responses for parts of auth, products, users, and uploads. Where the current backend is not implemented yet, you may still see responses such as:

```json
{
  "message": "TODO: Implement login controller"
}
```

or:

```json
{
  "message": "TODO: Implement listProducts — use cursor pagination + Redis cache"
}
```
