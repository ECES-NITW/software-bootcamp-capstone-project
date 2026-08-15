const express = require("express");
const router = express.Router();

const {
  createProduct,
  getProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

router.get("/", getProducts);
router.get("/my", authMiddleware, getMyProducts);
router.get("/:id", getProductById);
// Protected Routes
router.post("/", authMiddleware, upload.array("images", 5), createProduct);

router.put("/:id", authMiddleware, upload.array("images", 5), updateProduct);

router.delete("/:id", authMiddleware, deleteProduct);

module.exports = router;
