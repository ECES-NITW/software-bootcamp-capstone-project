const fs = require("fs");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

const toNumber = (value) =>
  value === undefined || value === null || value === ""
    ? undefined
    : Number(value);
const toArray = (value) => [].concat(value ?? []);

const createProduct = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      rentPrice,
      deposit,
      exchangePreferences,
      budget,
      category,
      condition,
      location,
    } = req.body;

    const types = toArray(req.body.types);

    // Upload images to Cloudinary
    const imageData = [];

    for (const file of req.files ?? []) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "campus-marketplace/products",
        });

        imageData.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      } finally {
        fs.unlink(file.path, () => {});
      }
    }

    // Create Product
    const product = await Product.create({
      title,
      description,
      types,
      price: types.includes("sell") ? toNumber(price) : undefined,
      rentPrice: types.includes("rent") ? toNumber(rentPrice) : undefined,
      deposit: types.includes("rent") ? toNumber(deposit) : undefined,
      exchangePreferences: types.includes("exchange")
        ? exchangePreferences
        : undefined,
      budget: types.includes("looking-for") ? toNumber(budget) : undefined,
      category,
      condition,
      location,
      images: imageData,
      seller: req.user.id,
    });

    // Populate seller details
    const populatedProduct = await Product.findById(product._id).populate(
      "seller",
      "userName email",
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product.",
      error: error.message,
    });
  }
};

// Get All Products

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      condition,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
      sort = "newest",
    } = req.query;

    // Only show products that are currently available
    const filter = {
      status: "Available",
    };
    // Filter products by seller
    if (req.query.seller) {
      filter.seller = req.query.seller;
    }
    // Search
    if (search) {
      const pattern = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: pattern, $options: "i" } },
        { description: { $regex: pattern, $options: "i" } },
      ];
    }

    const requestedTypes = toArray(req.query.types);

    if (requestedTypes.length > 0) {
      filter.types = { $in: requestedTypes };
    }

    // Category Filter
    if (category) {
      filter.category = category;
    }

    // Condition Filter
    if (condition) {
      filter.condition = condition;
    }

    // Price Filter
    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) {
        filter.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter.price.$lte = Number(maxPrice);
      }
    }

    // Sorting
    let sortOption = {};

    switch (sort) {
      case "price":
      case "price-low":
        sortOption = { price: 1 };
        break;

      case "-price":
      case "price-high":
        sortOption = { price: -1 };
        break;

      case "oldest":
        sortOption = { createdAt: 1 };
        break;

      case "newest":
      case "recent":
      default:
        sortOption = { createdAt: -1 };
        break;
    }

    const currentPage = Math.max(1, Math.floor(Number(page)) || 1);
    const pageLimit = Math.min(200, Math.max(1, Math.floor(Number(limit)) || 10));

    const skip = (currentPage - 1) * pageLimit;

    const totalProducts = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("seller", "userName email")
      .sort(sortOption)
      .skip(skip)
      .limit(pageLimit);

    if (products.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No products found.",
        totalProducts: 0,
        currentPage,
        totalPages: 0,
        products: [],
      });
    }

    return res.status(200).json({
      success: true,
      totalProducts,
      currentPage,
      totalPages: Math.ceil(totalProducts / pageLimit),
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products.",
      error: error.message,
    });
  }
};

// Get My Products

// const getMyProducts = async (req, res) => {
//   try {
//     const products = await Product.find({
//       seller: req.user.id,
//     })
//       .populate("seller", "name email")
//       .sort({ createdAt: -1 });

//     return res.status(200).json({
//       success: true,
//       totalProducts: products.length,
//       products,
//     });
//   } catch (error) {
//     console.error("Get My Products Error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Failed to fetch your products.",
//       error: error.message,
//     });
//   }
// };
const getMyProducts = async (req, res) => {
  try {
    console.log("LOGGED IN USER ID:", req.user.id);

    const products = await Product.find({
      seller: req.user.id,
    })
      .populate("seller", "userName email")
      .sort({ createdAt: -1 });

    console.log(
      "MY PRODUCTS:",
      products.map((p) => ({
        id: p._id,
        title: p.title,
        seller: p.seller?._id,
      })),
    );

    return res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    console.error("Get My Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your products.",
      error: error.message,
    });
  }
};
// Get Product By ID

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "seller",
      "userName email",
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product.",
      error: error.message,
    });
  }
};

// Update Product

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to update this product.",
      });
    }

    // If new images are uploaded then upload new images and delete old images
    if (req.files && req.files.length > 0) {
      const imageData = [];

      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "campus-marketplace/products",
          });

          imageData.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        } finally {
          fs.unlink(file.path, () => {});
        }
      }

      const oldImages = product.images;
      product.images = imageData;

      for (const image of oldImages) {
        try {
          await cloudinary.uploader.destroy(image.public_id);
        } catch (err) {
          console.error("Failed to delete old image", image.public_id, err);
        }
      }
    }

    if (req.body.types !== undefined) {
      product.types = toArray(req.body.types);
    }

    // Update fields
    product.title = req.body.title || product.title;
    product.description = req.body.description || product.description;
    product.category = req.body.category || product.category;
    product.condition = req.body.condition || product.condition;
    product.location = req.body.location || product.location;

    const typeFields = [
      { field: "price", type: "sell", value: toNumber(req.body.price) },
      { field: "rentPrice", type: "rent", value: toNumber(req.body.rentPrice) },
      { field: "deposit", type: "rent", value: toNumber(req.body.deposit) },
      {
        field: "exchangePreferences",
        type: "exchange",
        value: req.body.exchangePreferences,
      },
      {
        field: "budget",
        type: "looking-for",
        value: toNumber(req.body.budget),
      },
    ];

    for (const { field, type, value } of typeFields) {
      if (!product.types.includes(type)) {
        product[field] = undefined;
      } else if (value !== undefined) {
        product[field] = value;
      }
    }

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate(
      "seller",
      "userName email",
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update product.",
      error: error.message,
    });
  }
};

// Delete Product

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this product.",
      });
    }

    // Delete all images from Cloudinary
    for (const image of product.images) {
      await cloudinary.uploader.destroy(image.public_id);
    }

    // Delete product from MongoDB
    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete product.",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
