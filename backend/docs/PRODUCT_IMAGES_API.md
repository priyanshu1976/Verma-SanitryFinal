# Product Images API Documentation

## Overview

This API allows you to manage multiple images for products. Each product can have an array of images with automatic ordering and cascade delete functionality.

## Authentication

All product operations require admin authentication:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

---

## 🆕 CREATE Product with Images

### Endpoint

```
POST /api/products
```

### Request Body

```javascript
{
  "itemCode": "SINK_001",
  "name": "Premium Bathroom Sink",
  "description": "High-quality ceramic sink",
  "price": 299.99,
  "categoryId": 15,
  "imageUrls": [
    "https://example.com/sink-front.jpg",
    "https://example.com/sink-side.jpg",
    "https://example.com/sink-top.jpg"
  ],
  "availableStock": 50
}
```

### Response

```javascript
{
  "id": 12345,
  "itemCode": "SINK_001",
  "name": "Premium Bathroom Sink",
  "description": "High-quality ceramic sink",
  "price": 299.99,
  "categoryId": 15,
  "availableStock": 50,
  "images": [
    {
      "id": 1,
      "imageUrl": "https://example.com/sink-front.jpg",
      "altText": "Product image 1",
      "sortOrder": 0
    },
    {
      "id": 2,
      "imageUrl": "https://example.com/sink-side.jpg",
      "altText": "Product image 2",
      "sortOrder": 1
    },
    {
      "id": 3,
      "imageUrl": "https://example.com/sink-top.jpg",
      "altText": "Product image 3",
      "sortOrder": 2
    }
  ],
  "createdAt": "2025-08-05T10:30:00Z"
}
```

### Frontend Code Example

```javascript
const createProductWithImages = async (productData) => {
  const response = await fetch("/api/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...productData,
      imageUrls: [
        "https://cdn.example.com/product1.jpg",
        "https://cdn.example.com/product2.jpg",
        "https://cdn.example.com/product3.jpg",
      ],
    }),
  });

  const product = await response.json();
  console.log(`Created product with ${product.images.length} images`);
  return product;
};
```

---

## 📖 GET Product with Images

### Endpoint

```
GET /api/products/:id
```

### Response

```javascript
{
  "id": 12345,
  "itemCode": "SINK_001",
  "name": "Premium Bathroom Sink",
  "price": 299.99,
  "images": [
    {
      "id": 1,
      "imageUrl": "https://example.com/sink-front.jpg",
      "altText": "Product image 1",
      "sortOrder": 0
    },
    {
      "id": 2,
      "imageUrl": "https://example.com/sink-side.jpg",
      "altText": "Product image 2",
      "sortOrder": 1
    }
  ],
  "category": {
    "id": 15,
    "name": "Bathroom Fixtures"
  }
}
```

### Frontend Code Example

```javascript
const getProductWithImages = async (productId) => {
  const response = await fetch(`/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const product = await response.json();

  // Display images in your UI
  product.images.forEach((image, index) => {
    console.log(`Image ${index + 1}: ${image.imageUrl}`);
  });

  return product;
};
```

---

## ✏️ UPDATE Product Images

### Endpoint

```
PUT /api/products/:id
```

### Request Body (Replace all images)

```javascript
{
  "name": "Updated Product Name",
  "imageUrls": [
    "https://example.com/new-image-1.jpg",
    "https://example.com/new-image-2.jpg"
  ]
}
```

### Response

```javascript
{
  "id": 12345,
  "name": "Updated Product Name",
  "images": [
    {
      "id": 4,
      "imageUrl": "https://example.com/new-image-1.jpg",
      "altText": "Product image 1",
      "sortOrder": 0
    },
    {
      "id": 5,
      "imageUrl": "https://example.com/new-image-2.jpg",
      "altText": "Product image 2",
      "sortOrder": 1
    }
  ]
}
```

### Frontend Code Example

```javascript
const updateProductImages = async (productId, newImageUrls) => {
  const response = await fetch(`/api/products/${productId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imageUrls: newImageUrls,
    }),
  });

  const updatedProduct = await response.json();
  console.log(`Updated product now has ${updatedProduct.images.length} images`);
  return updatedProduct;
};
```

---

## 🗑️ DELETE Product (Cascade Delete Images)

### Endpoint

```
DELETE /api/products/:id
```

### Response

```javascript
{
  "message": "Product deleted successfully"
}
```

**Note**: When you delete a product, ALL associated images are automatically deleted from the database (CASCADE DELETE).

### Frontend Code Example

```javascript
const deleteProduct = async (productId) => {
  const response = await fetch(`/api/products/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const result = await response.json();
  console.log("Product and all images deleted");
  return result;
};
```

---

## 📋 GET All Products with Images

### Endpoint

```
GET /api/products
```

### Response

```javascript
[
  {
    id: 12345,
    name: "Product 1",
    price: 299.99,
    images: [
      {
        id: 1,
        imageUrl: "https://example.com/product1-1.jpg",
        sortOrder: 0,
      },
      {
        id: 2,
        imageUrl: "https://example.com/product1-2.jpg",
        sortOrder: 1,
      },
    ],
  },
  {
    id: 12346,
    name: "Product 2",
    price: 199.99,
    images: [
      {
        id: 3,
        imageUrl: "https://example.com/product2-1.jpg",
        sortOrder: 0,
      },
    ],
  },
];
```

---

## 🎯 Key Points for Frontend Development

### ✅ What Works

- Send `imageUrls` array when creating products
- Send `imageUrls` array when updating products
- Receive `images` array in all responses
- Images are automatically ordered (sortOrder: 0, 1, 2...)
- Automatic alt text generation ("Product image 1", "Product image 2"...)
- Cascade delete - deleting product removes all images

### 📝 Important Notes

1. **Parameter Name**: Always use `imageUrls` (not `images`) when sending data
2. **Response Name**: You'll receive `images` array in responses
3. **Order Matters**: First URL becomes sortOrder 0, second becomes 1, etc.
4. **Complete Replacement**: Sending `imageUrls` in update replaces ALL existing images
5. **Empty Array**: Send `imageUrls: []` to remove all images from a product

### 🚨 Error Handling

```javascript
try {
  const product = await createProductWithImages(productData);
  console.log("Success:", product);
} catch (error) {
  if (error.response?.status === 400) {
    console.error("Invalid data:", error.response.data.message);
  } else if (error.response?.status === 401) {
    console.error("Authentication required");
  }
}
```

### 💡 Best Practices

1. **Validate URLs**: Ensure image URLs are valid before sending
2. **Handle Loading**: Show loading states while uploading
3. **Optimize Images**: Use appropriate image sizes/formats
4. **Error Feedback**: Show clear error messages to users
5. **Preview**: Allow users to preview images before saving

---

## 🧪 Test the API

You can test with curl:

```bash
# Create product with images
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemCode": "TEST_001",
    "name": "Test Product",
    "price": 99.99,
    "categoryId": 15,
    "imageUrls": [
      "https://example.com/test1.jpg",
      "https://example.com/test2.jpg"
    ],
    "availableStock": 10
  }'

# Get product with images
curl -X GET http://localhost:3000/api/products/PRODUCT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ✨ Ready to Use!

Your image array functionality is fully operational. The frontend can now:

- ✅ Send image URL arrays and receive properly formatted responses
- ✅ Create, read, update, and delete products with multiple images
- ✅ Rely on automatic cascade deletion
- ✅ Get properly ordered images with metadata

**Happy coding! 🚀**
