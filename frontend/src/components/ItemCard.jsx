import { useNavigate } from "react-router-dom";
import useUser from "../hooks/useUser";
import {
    listingPrice,
    PLACEHOLDER_IMAGE,
    useUpdateProduct,
} from "../hooks/useProducts";
import { useWishlistIds, useToggleWishlist } from "../hooks/useWishlist";

const TYPE_PRIORITY = ["sell", "rent", "exchange"];

const STATUS_BADGE_STYLES = {
    Sold: { background: "#3f3f46", color: "#ffffff", borderColor: "#3f3f46" },
    Reserved: {
        background: "#fef3c7",
        color: "#b45309",
        borderColor: "#fcd34d",
    },
};

const ItemCard = ({ product }) => {
    const navigate = useNavigate();
    const image = product.images?.[0]?.url;

    const types = product.types ?? [];
    const primaryType = TYPE_PRIORITY.find((type) => types.includes(type));
    const secondaryTypes = TYPE_PRIORITY.filter(
        (type) => types.includes(type) && type !== primaryType,
    );

    const { data: user } = useUser();
    const { data: wishlistIds } = useWishlistIds();
    const toggleWishlistMutation = useToggleWishlist();
    const updateProductMutation = useUpdateProduct();

    const isWishlisted = Boolean(wishlistIds?.includes(String(product._id)));
    const isOwner = Boolean(
        user &&
            String(product.seller?._id ?? product.seller) ===
                String(user.user_id),
    );
    const status = product.status ?? "Available";

    const openDetail = () => navigate(`/item/${product._id}`);
    const openChat = (e) => {
        e.stopPropagation();
        navigate(`/item/${product._id}`, { state: { showChat: true } });
    };
    const toggleWishlist = (e) => {
        e.stopPropagation();
        toggleWishlistMutation.mutate(product._id);
    };
    const toggleSold = (e) => {
        e.stopPropagation();
        const formData = new FormData();
        formData.append(
            "status",
            status === "Available" ? "Sold" : "Available",
        );
        updateProductMutation.mutate({ id: product._id, formData });
    };

    const renderPrimaryPrice = () => {
        if (primaryType === "sell") {
            return <>₹{product.price}</>;
        }
        if (primaryType === "rent") {
            return (
                <>
                    ₹{product.rentPrice} <span>/week</span>
                </>
            );
        }
        if (primaryType === "exchange") {
            return <>Exchange</>;
        }
        return <>₹{listingPrice(product)}</>;
    };

    return (
        <div
            className="productCard"
            style={{ cursor: "pointer" }}
            onClick={openDetail}
        >
            <div className="cardImageWrapper">
                <img
                    className="cardImage"
                    src={image || PLACEHOLDER_IMAGE}
                    alt={product.title}
                />
                {status !== "Available" ? (
                    <span
                        className="cardBadge"
                        style={STATUS_BADGE_STYLES[status]}
                    >
                        {status}
                    </span>
                ) : (
                    product.condition && (
                        <span className="cardBadge badge-rent">
                            {product.condition}
                        </span>
                    )
                )}
            </div>
            <div className="cardBody">
                <span className="cardCategory">{product.category}</span>
                <h3 className="cardTitle" title={product.title}>
                    {product.title}
                </h3>
                <p className="cardDesc">{product.description}</p>
                <div className="cardFooter">
                    <div className="cardPrice">{renderPrimaryPrice()}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        {isOwner ? (
                            <button
                                className="btn"
                                onClick={toggleSold}
                                disabled={updateProductMutation.isPending}
                                style={{
                                    padding: "6px 14px",
                                    fontSize: "0.8rem",
                                    background: "var(--bg-secondary)",
                                    border: "1.5px solid var(--border-color)",
                                    color: "var(--primary)",
                                }}
                            >
                                {updateProductMutation.isPending
                                    ? "Updating..."
                                    : status === "Available"
                                      ? "Mark Sold"
                                      : "Mark Available"}
                            </button>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
                {secondaryTypes.length > 0 && (
                    <div className="listingTypeRow">
                        {secondaryTypes.map((type) => (
                            <span key={type} className={`listingTypeTag tag-${type}`}>
                                {type === "rent"
                                    ? `Rent ₹${product.rentPrice}/week`
                                    : "Available for exchange"}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ItemCard;
