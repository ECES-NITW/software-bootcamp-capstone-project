import { useState } from "react";
import { useConversations } from "../hooks/useChat";
import Chat from "../components/Chat";

function ChatPage() {
    const { data: conversationsData, isLoading, isError } = useConversations();
    const conversations = conversationsData?.conversations;
    const [selectedConvId, setSelectedConvId] = useState(null);

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
                    ) : conversations?.length === 0 ? (
                        <p
                            style={{
                                padding: "16px",
                                color: "var(--text-muted)",
                                fontSize: "0.88rem",
                            }}
                        >
                            No conversations started yet.
                        </p>
                    ) : (
                        <div className="chatList">
                            {conversations?.map((conv) => (
                                <div
                                    key={conv._id}
                                    className={`chatItem ${selectedConvId === conv._id ? "active" : ""}`}
                                    onClick={() => setSelectedConvId(conv._id)}
                                >
                                    <div
                                        className="navAvatar"
                                        style={{ flexShrink: 0 }}
                                    >
                                        {(conv.contactName ?? "Te")
                                            .substring(0, 2)
                                            .toUpperCase()}
                                    </div>
                                    <div className="chatItemInfo">
                                        <div className="chatItemName">
                                            {conv.contactName ?? "Test"}
                                        </div>
                                        <div className="chatItemMessage">
                                            {(conv.lastMessage ?? "LastMessage...").substring(0,30)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="chatMain">
                    {selectedConvId ? (
                        <Chat conversationId={selectedConvId}/>
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
