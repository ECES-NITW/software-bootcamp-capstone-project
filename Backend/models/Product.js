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

    types: {
      type: [String],
      required: true,
      enum: {
        values: ["sell", "rent", "exchange", "looking-for"],
      },
      validate: {
        validator: (types) => Array.isArray(types) && types.length > 0,
      },
    },

    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      required: [
        function () {
          return this.types.includes("sell");
        },
        "Price is required for items listed for sale.",
      ],
    },

    rentPrice: {
      type: Number,
      min: [0, "Rent price cannot be negative"],
      required: [
        function () {
          return this.types.includes("rent");
        },
        "Rent price is required for items listed for rent.",
      ],
    },

    deposit: {
      type: Number,
      min: [0, "Deposit cannot be negative"],
      default: undefined,
    },

    exchangePreferences: {
      type: String,
      trim: true,
      required: [
        function () {
          return this.types.includes("exchange");
        },
        "Preferred trade item(s) are required for items listed for exchange.",
      ],
    },

    budget: {
      type: Number,
      min: [0, "Budget cannot be negative"],
      required: [
        function () {
          return this.types.includes("looking-for");
        },
        "Budget is required for looking-for requests.",
      ],
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

productSchema.index({ types: 1 });

productSchema.index({ seller: 1 });

productSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Product", productSchema);
