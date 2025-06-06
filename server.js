// server.js - Complete Express.js RESTful API for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Custom Error Classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

// Custom Middleware Functions

// Logger middleware - logs request method, URL, and timestamp
const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

// Authentication middleware - checks for API key in headers
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== 'your-secret-api-key') {
    return res.status(401).json({ 
      error: 'Unauthorized: Invalid or missing API key. Include x-api-key header.' 
    });
  }
  next();
};

// Validation middleware for product creation and updates
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }
  
  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('Description is required and must be a non-empty string');
  }
  
  if (price === undefined || typeof price !== 'number' || price <= 0) {
    errors.push('Price is required and must be a positive number');
  }
  
  if (!category || typeof category !== 'string' || category.trim().length === 0) {
    errors.push('Category is required and must be a non-empty string');
  }
  
  if (inStock !== undefined && typeof inStock !== 'boolean') {
    errors.push('inStock must be a boolean value');
  }

  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors 
    });
  }
  
  next();
};

// Apply global middleware
app.use(loggerMiddleware);
app.use(bodyParser.json());

// Handle JSON parsing errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON format' });
  }
  next();
});

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  },
  {
    id: '4',
    name: 'Gaming Chair',
    description: 'Ergonomic gaming chair with lumbar support',
    price: 300,
    category: 'furniture',
    inStock: true
  },
  {
    id: '5',
    name: 'Wireless Headphones',
    description: 'Noise-cancelling wireless headphones',
    price: 150,
    category: 'electronics',
    inStock: true
  }
];

// Helper function to wrap async route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ROUTES

// Root route - Hello World
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Product API!',
    endpoints: {
      'GET /api/products': 'Get all products (supports filtering and pagination)',
      'GET /api/products/:id': 'Get a specific product',
      'POST /api/products': 'Create a new product',
      'PUT /api/products/:id': 'Update a product',
      'DELETE /api/products/:id': 'Delete a product',
      'GET /api/products/search': 'Search products by name',
      'GET /api/stats': 'Get product statistics'
    },
    note: 'Protected routes require x-api-key header with value: your-secret-api-key'
  });
});

// GET /api/products - Get all products with filtering and pagination
app.get('/api/products', asyncHandler((req, res) => {
  let filteredProducts = [...products];
  
  // Filter by category
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(p => 
      p.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }
  
  // Filter by inStock status
  if (req.query.inStock !== undefined) {
    const inStockFilter = req.query.inStock === 'true';
    filteredProducts = filteredProducts.filter(p => p.inStock === inStockFilter);
  }
  
  // Pagination
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  
  if (page < 1 || limit < 1) {
    return res.status(400).json({ error: 'Page and limit must be positive integers' });
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    products: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filteredProducts.length / limit),
      totalProducts: filteredProducts.length,
      productsPerPage: limit,
      hasNextPage: endIndex < filteredProducts.length,
      hasPrevPage: page > 1
    }
  });
}));

// GET /api/products/search - Search products by name
app.get('/api/products/search', asyncHandler((req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ 
      error: 'Search query parameter "q" is required' 
    });
  }
  
  const searchTerm = q.toLowerCase();
  const searchResults = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm) ||
    p.description.toLowerCase().includes(searchTerm)
  );
  
  res.json({
    searchTerm: q,
    results: searchResults,
    count: searchResults.length
  });
}));

// GET /api/stats - Get product statistics
app.get('/api/stats', asyncHandler((req, res) => {
  const stats = products.reduce((acc, product) => {
    // Count by category
    acc.byCategory[product.category] = (acc.byCategory[product.category] || 0) + 1;
    
    // Count by stock status
    if (product.inStock) {
      acc.inStock++;
    } else {
      acc.outOfStock++;
    }
    
    // Price statistics
    acc.totalValue += product.price;
    if (!acc.priceRange.min || product.price < acc.priceRange.min) {
      acc.priceRange.min = product.price;
    }
    if (!acc.priceRange.max || product.price > acc.priceRange.max) {
      acc.priceRange.max = product.price;
    }
    
    return acc;
  }, {
    total: products.length,
    byCategory: {},
    inStock: 0,
    outOfStock: 0,
    totalValue: 0,
    priceRange: { min: null, max: null },
    averagePrice: 0
  });
  
  stats.averagePrice = stats.total > 0 ? stats.totalValue / stats.total : 0;
  
  res.json(stats);
}));

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', asyncHandler((req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    throw new NotFoundError(`Product with ID ${req.params.id} not found`);
  }
  
  res.json(product);
}));

// POST /api/products - Create a new product (protected route)
app.post('/api/products', authMiddleware, validateProduct, asyncHandler((req, res) => {
  const { name, description, price, category, inStock = true } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim().toLowerCase(),
    inStock: Boolean(inStock)
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct
  });
}));

// PUT /api/products/:id - Update an existing product (protected route)
app.put('/api/products/:id', authMiddleware, validateProduct, asyncHandler((req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${req.params.id} not found`);
  }
  
  const { name, description, price, category, inStock } = req.body;
  
  const updatedProduct = {
    ...products[productIndex],
    name: name.trim(),
    description: description.trim(),
    price: Number(price),
    category: category.trim().toLowerCase(),
    inStock: Boolean(inStock)
  };
  
  products[productIndex] = updatedProduct;
  
  res.json({
    message: 'Product updated successfully',
    product: updatedProduct
  });
}));

// DELETE /api/products/:id - Delete a product (protected route)
app.delete('/api/products/:id', authMiddleware, asyncHandler((req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError(`Product with ID ${req.params.id} not found`);
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    message: 'Product deleted successfully',
    product: deletedProduct
  });
}));

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }
  
  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }
  
  // Handle specific error types
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  
  // Default server error
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
};

app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📖 API Documentation available at http://localhost:${PORT}/`);
  console.log(`🔑 Use API key "your-secret-api-key" in x-api-key header for protected routes`);
});

// Export the app for testing purposes
module.exports = app;