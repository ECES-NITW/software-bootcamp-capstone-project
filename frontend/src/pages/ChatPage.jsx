import { useState } from "react";
import { useConversations } from "../hooks/useChat";
import Chat from "../components/Chat";

// The other participant, from the current user's perspective. When I'm the buyer
// the other party is the seller, and vice-versa.
const otherPartyOf = (conv) =>
    conv.role === "buyer" ? conv.seller : conv.buyer;

function ChatPage() {
    const { data: conversationsData, isLoading, isError } = useConversations();
    const conversations = conversationsData?.conversations;

    // A user can be a buyer in some chats and a seller in others; this toggles
    // which side of their inbox is shown. Defaults to the buyer side.
    const [view, setView] = useState("buyer");
    const [selectedConvId, setSelectedConvId] = useState(null);

    const switchView = (next) => {
        setView(next);
        setSelectedConvId(null); // the selected chat may not exist in the other tab
    };

    const shown = conversations?.filter((c) => c.role === view) ?? [];
    const activeConv = conversations?.find((c) => c._id === selectedConvId);
    const activeOther = activeConv && otherPartyOf(activeConv);
    const activeProduct = activeConv?.product;

    return (
        <div style={{ animation: "fadeInUp 0.4s ease-out" }}>
            <div style={{ marginBottom: "24px" }}>
                <h1
                    style={{
                        fontFamily: "Lora, serif",
                        fontSize: "2rem",
                        fontWeight: 700,
                    }}
                >
                    💬 Messages Hub
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                    Negotiate rentals, coordinate swaps, and complete escrow
                    transfers.
                </p>
            </div>

            <div className="chatContainer">
                <div className="chatSidebar">
                    <div className="chatListHeader">Conversations</div>

                    <div
                        style={{
                            display: "flex",
                            background: "var(--bg-input)",
                            padding: "4px",
                            borderRadius: "12px",
                            margin: "12px 16px",
                        }}
                    >
                        <button
                            className={`toggleTab ${view === "buyer" ? "active-rent" : ""}`}
                            style={{ flex: 1, padding: "8px 0" }}
                            onClick={() => switchView("buyer")}
                        >
                            🛍️ Buying
                        </button>
                        <button
                            className={`toggleTab ${view === "seller" ? "active-rent" : ""}`}
                            style={{ flex: 1, padding: "8px 0" }}
                            onClick={() => switchView("seller")}
                        >
                            🏷️ Selling
                        </button>
                    </div>

                    {isLoading ? (
                        <p
                            style={{
                                padding: "16px",
                                color: "var(--text-muted)",
                                fontSize: "0.88rem",
                            }}
                        >
                            Loading conversations...
                        </p>
                    ) : isError ? (
                        <p
                            style={{
                                padding: "16px",
                                color: "var(--text-muted)",
                                fontSize: "0.88rem",
                            }}
                        >
                            Could not load conversations.
                        </p>
                    ) : shown.length === 0 ? (
                        <p
                            style={{
                                padding: "16px",
                                color: "var(--text-muted)",
                                fontSize: "0.88rem",
                            }}
                        >
                            No {view === "buyer" ? "buying" : "selling"} conversations
                            yet.
                        </p>
                    ) : (
                        <div className="chatList">
                            {shown.map((conv) => {
                                const other = otherPartyOf(conv);
                                const name = other?.userName ?? "User";
                                const product = conv.product;
                                return (
                                    <div
                                        key={conv._id}
                                        className={`chatItem ${selectedConvId === conv._id ? "active" : ""}`}
                                        onClick={() => setSelectedConvId(conv._id)}
                                    >
                                        {other?.profilePic ? (
                                            <img
                                                src={other.profilePic}
                                                alt={name}
                                                className="navAvatar"
                                                style={{ flexShrink: 0, objectFit: "cover" }}
                                            />
                                        ) : (
                                            <div
                                                className="navAvatar"
                                                style={{ flexShrink: 0 }}
                                            >
                                                {name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="chatItemInfo">
                                            <div className="chatItemName">{name}</div>
                                            {product?.title && (
                                                <div
                                                    className="chatItemMessage"
                                                    style={{ color: "var(--primary)" }}
                                                >
                                                    {product.title}
                                                </div>
                                            )}
                                            <div className="chatItemMessage">
                                                {conv.lastMessage || "No messages yet"}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="chatMain">
                    {selectedConvId && activeConv ? (
                        <>
                            <div className="chatHeader">
                                {activeOther?.profilePic ? (
                                    <img
                                        src={activeOther.profilePic}
                                        alt={activeOther.userName}
                                        className="navAvatar"
                                        style={{ objectFit: "cover" }}
                                    />
                                ) : (
                                    <div className="navAvatar">
                                        {(activeOther?.userName ?? "User")
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </div>
                                )}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>
                                        {activeOther?.userName ?? "User"}
                                    </h3>
                                    {activeProduct?.title && (
                                        <span
                                            style={{
                                                color: "var(--text-muted)",
                                                fontSize: "0.72rem",
                                            }}
                                        >
                                            {activeProduct.title}
                                            {activeProduct.price != null
                                                ? ` · $${activeProduct.price}`
                                                : ""}
                                        </span>
                                    )}
                                </div>
                                {activeProduct?.images?.[0]?.url && (
                                    <img
                                        src={activeProduct.images[0].url}
                                        alt={activeProduct.title}
                                        style={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: 8,
                                            objectFit: "cover",
                                        }}
                                    />
                                )}
                            </div>
                            <Chat conversationId={selectedConvId} />
                        </>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                gap: "16px",
                            }}
                        >
                            <span style={{ fontSize: "3rem" }}>💬</span>
                            <p style={{ color: "var(--text-muted)" }}>
                                Select a conversation to start messaging
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ChatPage;
