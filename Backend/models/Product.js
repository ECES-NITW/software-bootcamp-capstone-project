const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: [0, "Price cannot be negative"],
    },
    listingType: {
      type: String,
      enum: ["sell", "rent", "exchange"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Electronics",
        "Books",
        "Furniture",
        "Clothing",
        "Sports",
        "Accessories",
        "Stationery",
        "Others",
      ],
    },

    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Good", "Fair"],
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    location: {
      type: String,
      default: "NIT Warangal",
      trim: true,
    },

    status: {
      type: String,
      enum: ["Available", "Sold", "Reserved"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  },
);

productSchema.index({ title: "text", description: "text" });

productSchema.index({
  category: 1,
  condition: 1,
  price: 1,
});

productSchema.index({ seller: 1 });

productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
