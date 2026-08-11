import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socket } from "../App";
import useUser from "../hooks/useUser";
import { useMessages } from "../hooks/useChat";

const Chat = ({ conversationId }) => {
    const queryClient = useQueryClient();
    const { data: user } = useUser();
    const { data: messages = [], isLoading } = useMessages(conversationId);

    const [msgInput, setMsgInput] = useState("");
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [showOptions, setShowOptions] = useState(false);
    const [optionCard, setOptionCard] = useState("");
    const [offerAmount, setOfferAmount] = useState("");
    const bottomRef = useRef(null);

    const addMessage = (msg) => {
        queryClient.setQueryData(
            ["chat_messages", conversationId],
            (prev = []) => {
                // Never add the same message twice (e.g. server echoes)
                const id = msg.msgId ?? msg.id;
                if (id && prev.some((m) => (m.msgId ?? m.id) === id)) {
                    return prev;
                }
                return [...prev, msg];
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

    // Sync an accepted/declined offer into the message list and the
    // conversation list (agreed price + last message preview).
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

    useEffect(() => {
        if (!conversationId) return;
        if (!socket.connected) socket.connect();

        const joinRoom = () => socket.emit("join_room", conversationId);
        joinRoom();

        const handleConnect = () => {
            setIsConnected(true);
            joinRoom();
        };
        const handleDisconnect = () => setIsConnected(false);
        const handleResponse = (data) => {
            if (data.conversationId && data.conversationId !== conversationId)
                return;
            // Error echo for a message we already show optimistically;
            // don't re-add it under the same key.
            if (data.status === "error") {
                console.error("Message failed to send:", data);
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

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("response", handleResponse);
        socket.on("offerUpdate", handleOfferUpdate);

        return () => {
            socket.emit("leave_room", conversationId);
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("response", handleResponse);
            socket.off("offerUpdate", handleOfferUpdate);
        };
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!conversationId || !msgInput.trim()) return;

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
        if (!conversationId || !Number.isFinite(amount) || amount <= 0) return;

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
        applyOfferUpdate({
            conversationId,
            msgId: msg.msgId ?? msg.id,
            offerStatus: status,
            offerAmount: msg.offerAmount,
        });
    };

    const renderOffer = (msg, isMe, key) => {
        const status = msg.offerStatus ?? "none";
        return (
            <div
                key={key}
                className={`offerBubble ${isMe ? "offer-sent" : "offer-received"}`}
            >
                <div className="offerLabel">
                    {isMe ? "You made an offer" : "Offer for you"}
                </div>
                <div className="offerAmount">₹{msg.offerAmount}</div>

                {status === "none" && !isMe && (
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
                        if (msg.type === "offer") {
                            return renderOffer(msg, isMe, msg.msgId ?? msg.id ?? i);
                        }
                        return (
                            <div
                                key={msg.msgId ?? msg.id ?? i}
                                className={`chatBubble ${isMe ? "bubble-sent" : "bubble-received"}`}
                            >
                                {msg.message}
                            </div>
                        );
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {optionCard === "offer" && (
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
                    <button
                        type="button"
                        className="chatOptionItem"
                        onClick={() => setOptionCard("offer")}
                    >
                        Make an offer
                    </button>
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

            {!isConnected && <p className="chatStatus">Connecting...</p>}
        </>
    );
};

export default Chat;
