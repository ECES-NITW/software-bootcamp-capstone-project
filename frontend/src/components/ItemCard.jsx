import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import { useWishlistIds, useToggleWishlist } from "../hooks/useWishlist";

const ItemCard = ({ product }) => {
    const navigate = useNavigate();
    const image = product.images?.[0]?.url;

    const { data: user } = useUser();
    const { data: wishlistIds } = useWishlistIds();
    const toggleWishlistMutation = useToggleWishlist();

    const isWishlisted = Boolean(wishlistIds?.includes(String(product._id)));

    const openDetail = () => navigate(`/item/${product._id}`);
    const openChat = (e) => {
        e.stopPropagation();
        navigate(`/item/${product._id}`, { state: { showChat: true } });
    };
    const toggleWishlist = (e) => {
        e.stopPropagation();
        toggleWishlistMutation.mutate(product._id);
    };

    return (
        <div
            className="productCard"
            style={{ cursor: "pointer" }}
            onClick={openDetail}
        >
            <div className="cardImageWrapper">
                {image ? (
                    <img className="cardImage" src={image} alt={product.title} />
                ) : (
                    <div className="cardImage cardImagePlaceholder">No image</div>
                )}
                {product.condition && (
                    <span className="cardBadge badge-rent">{product.condition}</span>
                )}
            </div>
            <div className="cardBody">
                <span className="cardCategory">{product.category}</span>
                <h3 className="cardTitle" title={product.title}>
                    {product.title}
                </h3>
                <p className="cardDesc">{product.description}</p>
                <div className="cardFooter">
                    <div className="cardPrice">₹{product.price}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {user && (
                            <button
                                className="cardChatBtn"
                                onClick={toggleWishlist}
                                disabled={toggleWishlistMutation.isPending}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                                style={
                                    isWishlisted
                                        ? { background: "rgba(220, 38, 38, 0.08)", borderColor: "#dc2626" }
                                        : undefined
                                }
                            >
                                {isWishlisted ? "❤️" : "🤍"}
                            </button>
                        )}
                        <button
                            className="cardChatBtn"
                            onClick={openChat}
                            title="Chat with seller"
                            aria-label="Chat with seller"
                        >
                            💬
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemCard;
