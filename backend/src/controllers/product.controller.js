const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const cloudinary =
  require("../utils/cloudinary").default || require("../utils/cloudinary");
// 🛍️ Get all products (with optional filters and pagination)
exports.getAllProducts = async (req, res) => {
  try {
    const {
      category,
      categoryId,
      search,
      isFeatured,
      isBestseller,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Convert to integers
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 items per page (reduced from 100)
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const whereClause = {
      AND: [
        category ? { categoryId: parseInt(category) } : {},
        categoryId ? { categoryId: parseInt(categoryId) } : {},
        search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { itemCode: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        isFeatured !== undefined ? { isFeatured: isFeatured === "true" } : {},
        isBestseller !== undefined
          ? { isBestseller: isBestseller === "true" }
          : {},
      ].filter((condition) => Object.keys(condition).length > 0),
    };

    // Get total count for pagination
    const totalProducts = await prisma.product.count({
      where: whereClause,
    });

    // Get products with pagination
    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: skip,
      take: limitNum,
    });

    // Transform response to match frontend expectations
    const transformedProducts = products.map((product) => ({
      ...product,
      image_url: product.imageUrl, // Frontend expects image_url
      stock_quantity: product.availableStock, // Frontend expects stock_quantity
      original_price: product.originalPrice, // Frontend expects original_price
      reviews_count: product.reviewsCount || 0, // Frontend expects reviews_count
    }));

    // Return paginated response
    const response = {
      products: transformedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalProducts / limitNum),
        totalProducts: totalProducts,
        hasNextPage: pageNum < Math.ceil(totalProducts / limitNum),
        hasPreviousPage: pageNum > 1,
        limit: limitNum,
      },
    };

    console.log(
      `Returning ${transformedProducts.length} products (page ${pageNum}/${response.pagination.totalPages})`
    );
    return res.json(response);
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    return res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// 🛍️ Get single product by ID
exports.getProductById = async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(req.params.id) },
    include: { category: true },
  });

  if (!product) return res.status(404).json({ message: "Product not found" });

  // Transform response to match frontend expectations
  const transformedProduct = {
    ...product,
    image_url: product.imageUrl,
    stock_quantity: product.availableStock,
    original_price: product.originalPrice,
    reviews_count: product.reviewsCount || 0,
  };

  res.json(transformedProduct);
};

// 🛍️ Create new product (Admin only)
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      imageUrl,
      image_url, // Accept both formats
      price,
      originalPrice,
      original_price, // Accept both formats
      isFeatured,
      isBestseller,
      categoryId,
      availableStock,
      stockQuantity, // Accept both formats
      stock_quantity, // Accept both formats
      rating,
      reviewsCount,
      reviews_count, // Accept both formats
      taxPercent,
      // CSV fields
      itemCode,
      brandGroup,
      sdp,
      nrp,
      mrp,
      hsn,
      sgst,
      cgst,
      igst,
      cess,
    } = req.body;
    let finalImageUrl = image_url || imageUrl;
    // If file is uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      const result = await cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) throw error;
          return result;
        })
        .end(req.file.buffer);
      finalImageUrl = result.secure_url;
    }
    const finalOriginalPrice = original_price || originalPrice;
    const finalStockQuantity =
      stock_quantity || stockQuantity || availableStock;
    const finalReviewsCount = reviews_count || reviewsCount;
    // Validate required fields
    if (!name || !categoryId) {
      return res.status(400).json({
        message: "Name and categoryId are required",
      });
    }

    // Generate itemCode if not provided (required field)
    const finalItemCode =
      itemCode ||
      `ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Build data object carefully to avoid undefined values
    const productData = {
      name: String(name),
      description: description ? String(description) : null,
      price: parseFloat(price) || 0,
      categoryId: parseInt(categoryId),
      itemCode: String(finalItemCode), // Always provide itemCode
      isFeatured: !!isFeatured,
      isBestseller: !!isBestseller,
      rating: parseFloat(rating) || 0,
      availableStock: parseInt(finalStockQuantity) || 0,
      stockQuantity: parseInt(finalStockQuantity) || 0,
      reviewsCount: parseInt(finalReviewsCount) || 0,
      taxPercent: parseFloat(taxPercent) || 0,
    };

    // Only add optional fields if they have values
    if (finalOriginalPrice)
      productData.originalPrice = parseFloat(finalOriginalPrice);
    if (finalImageUrl) productData.imageUrl = String(finalImageUrl);
    if (brandGroup) productData.brandGroup = String(brandGroup);
    if (sdp) productData.sdp = parseFloat(sdp);
    if (nrp) productData.nrp = parseFloat(nrp);
    if (mrp) productData.mrp = parseFloat(mrp);
    if (hsn) productData.hsn = String(hsn);
    if (sgst) productData.sgst = parseFloat(sgst);
    if (cgst) productData.cgst = parseFloat(cgst);
    if (igst) productData.igst = parseFloat(igst);
    if (cess) productData.cess = parseFloat(cess);

    const product = await prisma.product.create({
      data: productData,
    });
    const transformedProduct = {
      ...product,
      image_url: product.imageUrl,
      stock_quantity: product.availableStock,
      original_price: product.originalPrice,
      reviews_count: product.reviewsCount,
    };
    res.status(201).json(transformedProduct);
  } catch (err) {
    console.error("Error creating product:", err);
    console.error("Request body:", req.body);
    res.status(500).json({
      message: "Error creating product",
      error: err.message,
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
};

// 🛍️ Update product (Admin only)
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      imageUrl,
      image_url,
      price,
      originalPrice,
      original_price,
      isFeatured,
      isBestseller,
      categoryId,
      availableStock,
      stockQuantity,
      stock_quantity,
      rating,
      reviewsCount,
      reviews_count,
      taxPercent,
      // CSV fields
      itemCode,
      brandGroup,
      sdp,
      nrp,
      mrp,
      hsn,
      sgst,
      cgst,
      igst,
      cess,
    } = req.body;
    let finalImageUrl = image_url || imageUrl;
    // If file is uploaded, upload to Cloudinary
    if (req.file && req.file.buffer) {
      const result = await cloudinary.uploader
        .upload_stream({ resource_type: "image" }, (error, result) => {
          if (error) throw error;
          return result;
        })
        .end(req.file.buffer);
      finalImageUrl = result.secure_url;
    }
    const finalOriginalPrice = original_price || originalPrice;
    const finalStockQuantity =
      stock_quantity || stockQuantity || availableStock;
    const finalReviewsCount = reviews_count || reviewsCount;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (finalImageUrl !== undefined) updateData.imageUrl = finalImageUrl;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (finalOriginalPrice !== undefined)
      updateData.originalPrice = parseFloat(finalOriginalPrice);
    if (isFeatured !== undefined) updateData.isFeatured = !!isFeatured;
    if (isBestseller !== undefined) updateData.isBestseller = !!isBestseller;
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (finalStockQuantity !== undefined) {
      updateData.availableStock = parseInt(finalStockQuantity);
      updateData.stockQuantity = parseInt(finalStockQuantity);
    }
    if (rating !== undefined) updateData.rating = parseFloat(rating);
    if (finalReviewsCount !== undefined)
      updateData.reviewsCount = parseInt(finalReviewsCount);
    if (taxPercent !== undefined)
      updateData.taxPercent = parseFloat(taxPercent);

    // CSV fields
    if (itemCode !== undefined) updateData.itemCode = itemCode;
    if (brandGroup !== undefined) updateData.brandGroup = brandGroup;
    if (sdp !== undefined) updateData.sdp = parseFloat(sdp);
    if (nrp !== undefined) updateData.nrp = parseFloat(nrp);
    if (mrp !== undefined) updateData.mrp = parseFloat(mrp);
    if (hsn !== undefined) updateData.hsn = hsn;
    if (sgst !== undefined) updateData.sgst = parseFloat(sgst);
    if (cgst !== undefined) updateData.cgst = parseFloat(cgst);
    if (igst !== undefined) updateData.igst = parseFloat(igst);
    if (cess !== undefined) updateData.cess = parseFloat(cess);
    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
    const transformedProduct = {
      ...product,
      image_url: product.imageUrl,
      stock_quantity: product.availableStock,
      original_price: product.originalPrice,
      reviews_count: product.reviewsCount,
    };
    res.json(transformedProduct);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating product" });
  }
};

// 🛍️ Delete product (Admin only)
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  await prisma.product.delete({ where: { id: parseInt(id) } });
  res.json({ message: "Product deleted" });
};

// 🛍️ Simple product list (for backward compatibility)
exports.getSimpleProducts = async (req, res) => {
  try {
    const { categoryId, search, limit = 10 } = req.query;

    const limitNum = Math.min(parseInt(limit), 20); // Max 20 for simple endpoint

    const whereClause = {};
    if (categoryId) whereClause.categoryId = parseInt(categoryId);
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { itemCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { category: true },
      take: limitNum,
      orderBy: { createdAt: "desc" },
    });

    // Transform response to match frontend expectations
    const transformedProducts = products.map((product) => ({
      ...product,
      image_url: product.imageUrl,
      stock_quantity: product.availableStock,
      original_price: product.originalPrice,
      reviews_count: product.reviewsCount || 0,
    }));

    res.json(transformedProducts);
  } catch (error) {
    console.error("Error in getSimpleProducts:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
};
