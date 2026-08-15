import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../App";
import useUser from "../hooks/useUser";
import { useMessages } from "../hooks/useChat";
import {
    useCreateOrderRequest,
    REQUEST_LABELS,
    REQUEST_BUTTON_LABELS,
} from "../hooks/useOrderRequest";

const sentOrderRequests = new Set();

const formatMessageTime = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
    const today = new Date();
    const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
    return isToday ? time : `${date.toLocaleDateString()} ${time}`;
};

const MessageTime = ({ value }) => {
    const formatted = formatMessageTime(value);
    if (!formatted) return null;
    return (
        <div
            style={{
                fontSize: "0.68rem",
                opacity: 0.65,
                marginTop: "4px",
                textAlign: "right",
            }}
        >
            {formatted}
        </div>
    );
};

const Chat = ({ conversationId, product, role, pendingRequest }) => {
    const productAvailable = product?.status === "Available";
    const queryClient = useQueryClient();
    const { data: user } = useUser();
    const { data: messages = [], isLoading } = useMessages(conversationId);

    const [msgInput, setMsgInput] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [connectionFailed, setConnectionFailed] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [optionCard, setOptionCard] = useState("");
    const [offerAmount, setOfferAmount] = useState("");
    const bottomRef = useRef(null);

    const requestMutation = useCreateOrderRequest();

    const addMessage = (msg) => {
        const stamped = {
            ...msg,
            createdAt: msg.createdAt ?? new Date().toISOString(),
        };
        queryClient.setQueryData(
            ["chat_messages", conversationId],
            (prev = []) => {
                // Never add the same message twice (e.g. server echoes)
                const id = stamped.msgId ?? stamped.id;
                if (id && prev.some((m) => (m.msgId ?? m.id) === id)) {
                    return prev;
                }
                return [...prev, stamped];
            },
        );
        queryClient.setQueryData(["chat_conversations"], (prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                conversations: prev.conversations.map((conv) => {
                    if (conv._id === conversationId) {
                        return {
                            ...conv,
                            lastMessage:
                                msg.type === "offer"
                                    ? `Offered ₹${msg.offerAmount}`
                                    : msg.message,
                        };
                    } else return conv;
                }),
            };
        });
    };

    const markMessageFailed = (msgId) => {
        queryClient.setQueryData(
            ["chat_messages", conversationId],
            (prev = []) =>
                prev.map((m) =>
                    (m.msgId ?? m.id) === msgId ? { ...m, failed: true } : m,
                ),
        );
    };

    const applyOfferUpdate = (update) => {
        queryClient.setQueryData(
            ["chat_messages", update.conversationId],
            (prev = []) =>
                prev.map((m) =>
                    (m.msgId ?? m.id) === update.msgId
                        ? { ...m, offerStatus: update.offerStatus }
                        : m,
                ),
        );
        queryClient.setQueryData(["chat_conversations"], (prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                conversations: prev.conversations.map((conv) => {
                    if (conv._id !== update.conversationId) return conv;
                    return {
                        ...conv,
                        lastMessage:
                            update.offerStatus === "accepted"
                                ? `Offer of ₹${update.offerAmount} accepted`
                                : `Offer of ₹${update.offerAmount} declined`,
                        currentOffer:
                            update.offerStatus === "accepted"
                                ? update.offerAmount
                                : conv.currentOffer,
                    };
                }),
            };
        });
    };

    const applyOrderUpdate = (update) => {
        queryClient.setQueryData(
            ["chat_messages", update.conversationId],
            (prev = []) =>
                prev.map((m) =>
                    (m.msgId ?? m.id) === update.msgId
                        ? { ...m, offerStatus: update.offerStatus }
                        : m,
                ),
        );
        queryClient.setQueryData(["chat_conversations"], (prev) => {
            if (!prev) return prev;
            const label = REQUEST_LABELS[update.orderType] || "Request";
            return {
                ...prev,
                conversations: prev.conversations.map((conv) =>
                    conv._id === update.conversationId
                        ? { ...conv, lastMessage: `${label} ${update.offerStatus}` }
                        : conv,
                ),
            };
        });
        queryClient.invalidateQueries({ queryKey: ["user_orders"] });
        if (update.offerStatus === "accepted") {
            queryClient.invalidateQueries({ queryKey: ["products"] });
            if (product?._id) {
                queryClient.invalidateQueries({
                    queryKey: ["product", product._id],
                });
            }
        }
    };

    useEffect(() => {
        if (!conversationId) return;
        if (!socket.connected) socket.connect();

        const joinRoom = () => socket.emit("join_room", conversationId);
        joinRoom();

        const handleConnect = () => {
            setIsConnected(true);
            setConnectionFailed(false);
            joinRoom();
        };
        const handleDisconnect = () => setIsConnected(false);
        const handleConnectError = () => {
            setIsConnected(false);
            setConnectionFailed(true);
        };
        const handleResponse = (data) => {
            if (data.conversationId && data.conversationId !== conversationId)
                return;
            // Error echo for a message we already show optimistically;
            // don't re-add it under the same key.
            if (data.status === "error") {
                console.error("Message failed to send:", data);
                markMessageFailed(data.msgId);
                return;
            }
            addMessage(data);
        };
        const handleOfferUpdate = (data) => {
            if (data.conversationId && data.conversationId !== conversationId)
                return;
            if (data.status === "error") return;
            applyOfferUpdate(data);
        };
        const handleOrderUpdate = (data) => {
            if (data.conversationId && data.conversationId !== conversationId)
                return;
            if (data.status === "error") {
                window.alert(data.error || "Could not update the request");
                return;
            }
            applyOrderUpdate(data);
        };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);
        socket.on("response", handleResponse);
        socket.on("offerUpdate", handleOfferUpdate);
        socket.on("orderUpdate", handleOrderUpdate);

        return () => {
            socket.emit("leave_room", conversationId);
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("disconnect", handleDisconnect);
            socket.off("response", handleResponse);
            socket.off("offerUpdate", handleOfferUpdate);
            socket.off("orderUpdate", handleOrderUpdate);
        };
    }, [conversationId]);

    useEffect(() => {
        return () => {
            socket.disconnect();
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!conversationId || !msgInput.trim() || !user?.user_id) return;

        const newMessage = {
            msgId: crypto.randomUUID(),
            conversationId,
            message: msgInput,
            sender: user?.user_id,
            type: "text",
        };
        socket.emit("message", newMessage);
        addMessage(newMessage);
        setMsgInput("");
    };

    const sendOffer = () => {
        const amount = Number(offerAmount);
        if (
            !conversationId ||
            !Number.isFinite(amount) ||
            amount <= 0 ||
            !user?.user_id
        )
            return;

        const newMessage = {
            msgId: crypto.randomUUID(),
            conversationId,
            offerAmount: amount,
            sender: user?.user_id,
            type: "offer",
            offerStatus: "none",
        };
        socket.emit("message", newMessage);
        addMessage(newMessage);
        setOfferAmount("");
        setOptionCard("");
        setShowOptions(false);
    };

    const respondToOffer = (msg, status) => {
        socket.emit("offer_update", {
            conversationId,
            msgId: msg.msgId ?? msg.id,
            status,
        });
    };

    const respondToOrder = (msg, status) => {
        socket.emit("order_update", {
            conversationId,
            msgId: msg.msgId ?? msg.id,
            status,
        });
    };

    const sendOrderMessage = (order) => {
        if (!conversationId || !order?._id || !user?.user_id) return;
        const { _id: orderId, orderType, totalAmount } = order;

        const newMessage = {
            msgId: crypto.randomUUID(),
            conversationId,
            sender: user.user_id,
            type: "order",
            orderId,
            orderType,
            offerAmount:
                orderType === "exchange" ? 0 : totalAmount ?? 0,
            message: REQUEST_LABELS[orderType],
        };
        socket.emit("message", newMessage);
        addMessage(newMessage);
    };

    const sendOrderRequest = (orderType) => {
        if (!product?._id || !user?.user_id) return;
        requestMutation.mutate(
            { productId: product._id, orderType },
            {
                onSuccess: (data) => {
                    if (data.order?._id && !data.duplicate) {
                        sendOrderMessage(data.order);
                    }
                },
                onSettled: () => {
                    setShowOptions(false);
                    setOptionCard("");
                },
            },
        );
    };

    useEffect(() => {
        const orderId = pendingRequest?.orderId;
        if (!orderId || !conversationId || !user?.user_id || isLoading) return;
        if (sentOrderRequests.has(orderId)) return;
        if (messages.some((m) => String(m.orderId) === String(orderId))) return;
        sentOrderRequests.add(orderId);
        sendOrderMessage({ ...pendingRequest, _id: orderId });
    });

    const renderOffer = (msg, isMe, key) => {
        const status = msg.offerStatus ?? "none";
        return (
            <div
                key={key}
                className={`offerBubble ${isMe ? "offer-sent" : "offer-received"}`}
                style={msg.failed ? { opacity: 0.6 } : undefined}
            >
                <div className="offerLabel">
                    {isMe ? "You made an offer" : "Offer for you"}
                </div>
                <div className="offerAmount">₹{msg.offerAmount}</div>

                {status === "none" && !isMe && productAvailable && (
                    <div className="offerActions">
                        <button
                            type="button"
                            className="offerBtn offerBtn-accept"
                            onClick={() => respondToOffer(msg, "accepted")}
                        >
                            ✓ Accept
                        </button>
                        <button
                            type="button"
                            className="offerBtn offerBtn-decline"
                            onClick={() => respondToOffer(msg, "declined")}
                        >
                            ✕ Decline
                        </button>
                    </div>
                )}

                {status === "none" && isMe && (
                    <div className="offerStatusBar offer-pending">
                        Awaiting response…
                    </div>
                )}
                {status === "accepted" && (
                    <div className="offerStatusBar offer-accepted">
                        ✓ Offer Accepted
                    </div>
                )}
                {status === "declined" && (
                    <div className="offerStatusBar offer-declined">
                        ✕ Offer Declined
                    </div>
                )}
                {msg.failed && (
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#ef4444",
                            marginTop: "4px",
                        }}
                    >
                        Not delivered
                    </div>
                )}
                <MessageTime value={msg.createdAt} />
            </div>
        );
    };

    const renderOrderRequest = (msg, isMe, key) => {
        const status = msg.offerStatus ?? "none";
        const label = REQUEST_LABELS[msg.orderType] || "Request";
        return (
            <div
                key={key}
                className={`offerBubble ${isMe ? "offer-sent" : "offer-received"}`}
                style={msg.failed ? { opacity: 0.6 } : undefined}
            >
                <div className="offerLabel">
                    {isMe ? `You sent a ${label.toLowerCase()}` : `${label} for you`}
                </div>
                <div className="offerAmount">
                    {msg.orderType === "exchange"
                        ? "Open to swap"
                        : `₹${msg.offerAmount}`}
                </div>

                {status === "none" && !isMe && productAvailable && (
                    <div className="offerActions">
                        <button
                            type="button"
                            className="offerBtn offerBtn-accept"
                            onClick={() => respondToOrder(msg, "accepted")}
                        >
                            ✓ Accept
                        </button>
                        <button
                            type="button"
                            className="offerBtn offerBtn-decline"
                            onClick={() => respondToOrder(msg, "declined")}
                        >
                            ✕ Decline
                        </button>
                    </div>
                )}

                {status === "none" && isMe && (
                    <div className="offerStatusBar offer-pending">
                        Awaiting response…
                    </div>
                )}
                {status === "accepted" && (
                    <div className="offerStatusBar offer-accepted">
                        ✓ Request Accepted
                    </div>
                )}
                {status === "declined" && (
                    <div className="offerStatusBar offer-declined">
                        ✕ Request Declined
                    </div>
                )}
                {msg.failed && (
                    <div
                        style={{
                            fontSize: "0.75rem",
                            color: "#ef4444",
                            marginTop: "4px",
                        }}
                    >
                        Not delivered
                    </div>
                )}
                <MessageTime value={msg.createdAt} />
            </div>
        );
    };

    return (
        <>
            <div className="chatMessages">
                {isLoading ? (
                    <p style={{ color: "var(--text-muted)" }}>
                        Loading message history...
                    </p>
                ) : (
                    messages.map((msg, i) => {
                        const isMe = String(msg.sender) === String(user?.user_id);
                        if (msg.type === "order") {
                            return renderOrderRequest(msg, isMe, msg.msgId ?? msg.id ?? i);
                        }
                        if (msg.type === "offer") {
                            return renderOffer(msg, isMe, msg.msgId ?? msg.id ?? i);
                        }
                        return (
                            <div
                                key={msg.msgId ?? msg.id ?? i}
                                className={`chatBubble ${isMe ? "bubble-sent" : "bubble-received"}`}
                                style={msg.failed ? { opacity: 0.6 } : undefined}
                            >
                                {msg.message}
                                {msg.failed && (
                                    <div
                                        style={{
                                            fontSize: "0.75rem",
                                            color: "#ef4444",
                                            marginTop: "4px",
                                        }}
                                    >
                                        Not delivered
                                    </div>
                                )}
                                <MessageTime value={msg.createdAt} />
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {optionCard === "offer" && productAvailable && (
                <div className="offerComposer">
                    <div className="offerComposerTitle">
                        Negotiate with a new price
                    </div>
                    <div className="offerComposerRow">
                        <input
                            type="number"
                            step="any"
                            min="1"
                            className="formInput"
                            placeholder="Enter amount (₹)"
                            value={offerAmount}
                            onChange={(e) => setOfferAmount(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={sendOffer}
                            disabled={!Number(offerAmount)}
                        >
                            Send Offer
                        </button>
                        <button
                            type="button"
                            className="btn"
                            style={{
                                background: "var(--bg-secondary)",
                                border: "1.5px solid var(--border-color)",
                                color: "var(--text-muted)",
                            }}
                            onClick={() => {
                                setOptionCard("");
                                setShowOptions(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showOptions && optionCard !== "offer" && (
                <div className="chatOptionsMenu">
                    {product?.types?.includes("sell") && productAvailable && (
                        <button
                            type="button"
                            className="chatOptionItem"
                            onClick={() => setOptionCard("offer")}
                        >
                            Make an offer
                        </button>
                    )}
                    {role === "buyer" &&
                        product?.status === "Available" &&
                        (product?.types ?? []).map((orderTypeKey) => {
                            const orderType =
                                orderTypeKey === "sell" ? "buy" : orderTypeKey;
                            if (!REQUEST_BUTTON_LABELS[orderType]) return null;
                            return (
                                <button
                                    key={orderType}
                                    type="button"
                                    className="chatOptionItem"
                                    onClick={() => sendOrderRequest(orderType)}
                                    disabled={requestMutation.isPending}
                                >
                                    {requestMutation.isPending
                                        ? "Sending request..."
                                        : REQUEST_BUTTON_LABELS[orderType]}
                                </button>
                            );
                        })}
                </div>
            )}

            <form className="chatInputArea" onSubmit={sendMessage}>
                <button
                    type="button"
                    className="chatPlusBtn"
                    title="More options"
                    aria-label="More options"
                    onClick={() => {
                        setShowOptions(!showOptions);
                        if (showOptions) setOptionCard("");
                    }}
                >
                    {showOptions || optionCard === "offer" ? "×" : "+"}
                </button>
                <input
                    className="formInput"
                    value={msgInput}
                    onClick={() => {
                        setShowOptions(false);
                        setOptionCard("");
                    }}
                    onChange={(e) => setMsgInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1 }}
                    required
                />
                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ padding: "0 20px" }}
                >
                    Send
                </button>
            </form>

            {!isConnected && (
                <p className="chatStatus">
                    {connectionFailed
                        ? "Connection failed. Please refresh, or log in again."
                        : "Connecting..."}
                </p>
            )}
        </>
    );
};

export default Chat;
