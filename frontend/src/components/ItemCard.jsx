import { useNavigate } from "react-router-dom";

const RATING_PLACEHOLDER = 4.5;

const ItemCard = ({ product }) => {
    const navigate = useNavigate();
    const image = product.images?.[0]?.url;

    const openDetail = () => navigate(`/item/${product._id}`);
    const openChat = (e) => {
        e.stopPropagation();
        navigate(`/item/${product._id}`, { state: { showChat: true } });
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
                    <div className="cardPrice">${product.price}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "0.8rem", color: "#b58d63" }}>
                            ★ {RATING_PLACEHOLDER}
                        </span>
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
