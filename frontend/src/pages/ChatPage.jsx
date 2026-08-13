import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useConversations, useProductConversation } from "../hooks/useChat";
import Chat from "../components/Chat";
import { useQueryClient } from "@tanstack/react-query";

function ChatPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const productId = location.state?.productId;
    const orderRequest = location.state?.orderRequest;
    const { data: stateConversation } = useProductConversation(productId);

    const { data: conversationsData, isLoading, isError } = useConversations();
    const conversations = conversationsData?.conversations;
    const queryClient = useQueryClient();

    const [view, setView] = useState("buyer");
    const [selectedConvId, setSelectedConvId] = useState(null);

    useEffect(() => {
        if (stateConversation?.conversationId) {
            setView("buyer");
            setSelectedConvId(stateConversation.conversationId);
        }
    }, [stateConversation]);

    const switchView = (next) => {
        setView(next);
        setSelectedConvId(null);
        queryClient.invalidateQueries({queryKey:["chat_conversations"]})
    };

    const getContactInfo = (conv) =>
        conv.role === "buyer" ? conv.seller : conv.buyer;

    const shown = conversations?.filter((c) => c.role === view) ?? [];
    const activeConv = conversations?.find((c) => c._id === selectedConvId);
    const activeOther = activeConv && getContactInfo(activeConv);
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

            <div
                className={`chatContainer ${selectedConvId && activeConv ? "mobile-chat-open" : ""}`}
            >
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
                            No {view === "buyer" ? "buying" : "selling"}{" "}
                            conversations yet.
                        </p>
                    ) : (
                        <div className="chatList">
                            {shown.map((conv) => {
                                const other = getContactInfo(conv);
                                const name = other?.userName ?? "User";
                                const product = conv.product;
                                return (
                                    <div
                                        key={conv._id}
                                        className={`chatItem ${selectedConvId === conv._id ? "active" : ""}`}
                                        onClick={() =>
                                            setSelectedConvId(conv._id)
                                        }
                                    >
                                        {other?.profilePic ? (
                                            <img
                                                src={other.profilePic}
                                                alt={name}
                                                className="navAvatar"
                                                style={{
                                                    flexShrink: 0,
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            <div
                                                className="navAvatar"
                                                style={{ flexShrink: 0 }}
                                            >
                                                {name
                                                    .substring(0, 2)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                        <div className="chatItemInfo">
                                            <div className="chatItemName">
                                                {name}
                                            </div>
                                            {product?.title && (
                                                <div
                                                    className="chatItemMessage"
                                                    style={{
                                                        color: "var(--primary)",
                                                    }}
                                                >
                                                    {product.title}
                                                </div>
                                            )}
                                            <div className="chatItemMessage">
                                                {conv.lastMessage ||
                                                    "No messages yet"}
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
                            <div
                                className="chatHeader"
                                onClick={() => {
                                    const pid = activeProduct?._id ?? activeConv?.productId;
                                    if (pid) navigate(`/item/${pid}`);
                                }}
                                style={{ cursor: activeProduct ? "pointer" : "default" }}
                                title={activeProduct ? "View product details" : undefined}
                            >
                                <button
                                    type="button"
                                    className="chatBackBtn"
                                    title="Back to conversations"
                                    aria-label="Back to conversations"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedConvId(null);
                                    }}
                                >
                                    &#8592;
                                </button>
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
                                    <h3
                                        style={{
                                            fontSize: "1rem",
                                            fontWeight: 700,
                                        }}
                                    >
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
                                {activeConv?.currentOffer != null && (
                                    <span
                                        className="chatOfferChip"
                                        title="Agreed price"
                                    >
                                        Agreed ₹{activeConv.currentOffer}
                                    </span>
                                )}
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
                            <Chat
                                conversationId={selectedConvId}
                                product={activeProduct}
                                role={activeConv?.role}
                                pendingRequest={
                                    activeProduct?._id === productId
                                        ? orderRequest
                                        : undefined
                                }
                            />
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
