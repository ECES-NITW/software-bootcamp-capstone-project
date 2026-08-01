const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");

const toggleWishlist = async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        const wishlist = await Wishlist.findOne({ productId, userId });

        if (wishlist) {
            await wishlist.deleteOne();

            return res.status(200).json({
                success: true,
                message: "Product removed from wishlist.",
                wishlisted: false,
                productId,
            });
        }

        const product = await Product.findById(productId).select("seller");
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found.",
            });
        }

        await Wishlist.create({
            userId,
            productId,
            sellerId: product.seller,
        });

        return res.status(201).json({
            success: true,
            message: "Product added to wishlist.",
            wishlisted: true,
            productId,
        });
    } catch (error) {

        return res.status(500).json({
            success: false,
            message: "Failed to update wishlist.",
            error: error.message,
        });
    }
};

const getWishlist = async (req, res) => {
    try {
        const userId = req.user.id;

        const wishlist = await Wishlist.find({ userId })
            .select("productId")
            .sort({ createdAt: -1 })
            .lean();

        const productIds = wishlist.map((item) => item.productId);

        return res.status(200).json({
            success: true,
            count: productIds.length,
            productIds,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch wishlist.",
            error: error.message,
        });
    }
};

module.exports = {
    toggleWishlist,
    getWishlist,
};
