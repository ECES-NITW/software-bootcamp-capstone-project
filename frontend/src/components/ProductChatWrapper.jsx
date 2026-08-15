import { useProductConversation } from "../hooks/useChat";
import Chat from "./Chat";

const ProductChatWrapper = ({ productId, productInfo, contactInfo, onClose }) => {
    const { data: conversation, isLoading, isError } =
        useProductConversation(productId);

    const conversationId = conversation?.conversationId;

    const name = contactInfo?.userName ?? "Seller";
    const avatar = contactInfo?.profilePic;
    const productTitle = productInfo?.title;
    const productPrice = productInfo?.price;
    const productImg = productInfo?.images?.[0]?.url;

    return (
        <div className="chatMain">
            <div className="chatHeader">
                {avatar ? (
                    <img
                        src={avatar}
                        alt={name}
                        className="navAvatar"
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div className="navAvatar">
                        {name.substring(0, 2).toUpperCase()}
                    </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{name}</h3>
                    {productTitle && (
                        <span
                            style={{
                                color: "var(--text-muted)",
                                fontSize: "0.72rem",
                            }}
                        >
                            {productTitle}
                            {productPrice != null ? ` · ₹${productPrice}` : ""}
                        </span>
                    )}
                </div>
                {productImg && (
                    <img
                        src={productImg}
                        alt={productTitle}
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            objectFit: "cover",
                        }}
                    />
                )}
                {onClose && (
                    <button
                        className="chatCloseBtn"
                        onClick={onClose}
                        aria-label="Close chat"
                    >
                        ✕
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="chatMessages">
                    <p style={{ color: "var(--text-muted)" }}>
                        Loading conversation...
                    </p>
                </div>
            ) : isError ? (
                <div className="chatMessages">
                    <p style={{ color: "var(--text-muted)" }}>
                        Could not load this conversation.
                    </p>
                </div>
            ) : (
                <Chat conversationId={conversationId} />
            )}
        </div>
    );
};

export default ProductChatWrapper;
