import { useProductConversation } from "../hooks/useChat";
import Chat from "./Chat";

const ProductChatWrapper = ({ productId }) => {
    const { data: conversation, isLoading, isError } =
        useProductConversation(productId);

    const conversationId = conversation?.conversationId;
    const lastMessage = conversation?.lastMessage ?? "";
    const contactName = conversation?.contactName ?? "Test";

    return (
        <div className="chatMain">
            <div className="chatHeader">
                <div className="navAvatar">
                    {contactName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{contactName}</h3>
                    {lastMessage && (
                        <span
                            style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}
                        >
                            {lastMessage}
                        </span>
                    )}
                </div>
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
