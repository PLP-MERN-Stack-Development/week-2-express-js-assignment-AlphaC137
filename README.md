# Express.js RESTful API Assignment - Week 2

A complete RESTful API built with Express.js featuring CRUD operations, custom middleware, error handling, and advanced features like filtering, pagination, and search.

## Features

- **Complete CRUD Operations** for products
- **Custom Middleware** for logging, authentication, and validation
- **Comprehensive Error Handling** with custom error classes
- **Advanced Features**: filtering, pagination, search, and statistics
- **RESTful Architecture** following best practices
- **In-memory Database** for easy testing and development

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

4. **Access the API**
   - Server runs on: `http://localhost:3000`
   - API documentation: `http://localhost:3000/`

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Protected routes require an API key in the request headers:
```
x-api-key: your-secret-api-key
```

### Endpoints

#### **GET /** 
Get API documentation and available endpoints.

**Response:**
```json
{
  "message": "Welcome to the Product API!",
  "endpoints": { ... },
  "note": "Protected routes require x-api-key header"
}
```

---

#### **GET /api/products**
Get all products with optional filtering and pagination.

**Query Parameters:**
- `category` (string): Filter by product category
- `inStock` (boolean): Filter by stock status (`true`/`false`)
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of products per page (default: 10)

**Example Request:**
```
GET /api/products?category=electronics&page=1&limit=5
```

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalProducts": 8,
    "productsPerPage": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### **GET /api/products/:id**
Get a specific product by ID.

**Example Request:**
```
GET /api/products/1
```

**Response:**
```json
{
  "id": "1",
  "name": "Laptop",
  "description": "High-performance laptop with 16GB RAM",
  "price": 1200,
  "category": "electronics",
  "inStock": true
}
```

---

#### **POST /api/products** 
Create a new product (requires authentication).

**Headers:**
```
Content-Type: application/json
x-api-key: your-secret-api-key
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "inStock": true
}
```

**Response:**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": "generated-uuid",
    "name": "New Product",
    "description": "Product description",
    "price": 99.99,
    "category": "electronics",
    "inStock": true
  }
}
```

---

#### **PUT /api/products/:id** 
Update an existing product (requires authentication).

**Headers:**
```
Content-Type: application/json
x-api-key: your-secret-api-key
```

**Request Body:**
```json
{
  "name": "Updated Product",
  "description": "Updated description",
  "price": 149.99,
  "category": "electronics",
  "inStock": false
}
```

---

#### **DELETE /api/products/:id** 
Delete a product (requires authentication).

**Headers:**
```
x-api-key: your-secret-api-key
```

**Response:**
```json
{
  "message": "Product deleted successfully",
  "product": { ... }
}
```

---

#### **GET /api/products/search**
Search products by name or description.

**Query Parameters:**
- `q` (string, required): Search term

**Example Request:**
```
GET /api/products/search?q=laptop
```

**Response:**
```json
{
  "searchTerm": "laptop",
  "results": [...],
  "count": 2
}
```

---

#### **GET /api/stats**
Get product statistics and analytics.

**Response:**
```json
{
  "total": 5,
  "byCategory": {
    "electronics": 3,
    "kitchen": 1,
    "furniture": 1
  },
  "inStock": 4,
  "outOfStock": 1,
  "totalValue": 2500,
  "averagePrice": 500,
  "priceRange": {
    "min": 50,
    "max": 1200
  }
}
```

## Testing Examples

### Using curl

**Get all products:**
```bash
curl http://localhost:3000/api/products
```

**Create a new product:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key" \
  -d '{
    "name": "Test Product",
    "description": "A test product",
    "price": 29.99,
    "category": "test",
    "inStock": true
  }'
```

**Search products:**
```bash
curl "http://localhost:3000/api/products/search?q=laptop"
```

### Using Postman/Insomnia

1. **Import the API endpoints** using the documentation above
2. **Set up environment variables:**
   - `base_url`: `http://localhost:3000`
   - `api_key`: `your-secret-api-key`
3. **Test all CRUD operations** with the provided examples

## Project Structure

```
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── README.md          # This documentation
├── .env.example       # Environment variables template
└── Week2-Assignment.md # Assignment requirements
```

## Middleware Implementation

### Custom Logger Middleware
Logs all incoming requests with timestamp, method, and URL.

### Authentication Middleware
Protects sensitive routes (POST, PUT, DELETE) by validating API key in headers.

### Validation Middleware
Validates product data for creation and updates:
- Name: Required, non-empty string
- Description: Required, non-empty string  
- Price: Required, positive number
- Category: Required, non-empty string
- inStock: Optional boolean

### Error Handling Middleware
- Custom error classes for different error types
- Proper HTTP status codes
- Detailed error messages
- Global error catching for async routes

## Error Handling

The API implements comprehensive error handling:

- **400 Bad Request**: Invalid input data, validation errors
- **401 Unauthorized**: Missing or invalid API key
- **404 Not Found**: Product or route not found
- **500 Internal Server Error**: Unexpected server errors

## Advanced Features

### Filtering
Filter products by:
- Category: `?category=electronics`
- Stock status: `?inStock=true`

### Pagination
Navigate large datasets:
- Page number: `?page=2`
- Items per page: `?limit=5`

### Search
Search across product names and descriptions:
- Search term: `?q=laptop`

### Statistics
Get insights about your product catalog:
- Total counts by category
- Stock status distribution
- Price analytics

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
API_KEY=your-secret-api-key
NODE_ENV=development
```